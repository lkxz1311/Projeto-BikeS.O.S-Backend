import { prisma } from "./prisma.js";

interface AtualizarLocalizacaoData {
  pedidoId: string;
  tecnicoId?: string;
  latitude: number;
  longitude: number;
}

/**
 * Status em que o técnico já aceitou o pedido e ainda não finalizou.
 * Somente nesses status a localização do técnico é gravada/compartilhada.
 */
export const STATUS_RASTREAMENTO_ATIVO = [
  "Técnico aceitou",
  "Aceito pelo técnico",
  "Técnico a caminho",
  "Em atendimento",
];

/** Erro com código HTTP associado, para o controller responder corretamente. */
export class LocalizacaoError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = "LocalizacaoError";
  }
}

function coordenadaValida(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export class LocalizacaoService {
  async atualizarLocalizacao(data: AtualizarLocalizacaoData) {
    const { pedidoId, tecnicoId, latitude, longitude } = data;

    if (!coordenadaValida(latitude, longitude)) {
      throw new LocalizacaoError("Latitude/longitude inválidas.", 400);
    }

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: { id: true, status: true, tecnicoId: true },
    });

    if (!pedido) {
      throw new LocalizacaoError("Pedido não encontrado.", 404);
    }

    if (!STATUS_RASTREAMENTO_ATIVO.includes(pedido.status)) {
      throw new LocalizacaoError(
        `Pedido não está em andamento (status atual: ${pedido.status}).`,
        409
      );
    }

    // Garante que somente o técnico responsável pelo pedido atualize a posição
    if (tecnicoId && pedido.tecnicoId && pedido.tecnicoId !== tecnicoId) {
      throw new LocalizacaoError("Este pedido pertence a outro técnico.", 403);
    }

    const localizacao = await prisma.localizacaoTecnico.upsert({
      where: { pedidoId },
      update: {
        latitude,
        longitude,
        updatedAt: new Date(),
      },
      create: {
        pedidoId,
        latitude,
        longitude,
      },
    });

    return localizacao;
  }

  async buscarLocalizacaoPorPedido(pedidoId: string) {
    const localizacao = await prisma.localizacaoTecnico.findUnique({
      where: { pedidoId },
    });

    if (!localizacao) {
      throw new LocalizacaoError("Localização não encontrada para o pedido informado.", 404);
    }

    return localizacao;
  }

  /**
   * Dados consumidos pelo app do cliente para acompanhar o técnico:
   * status do pedido + dados do técnico + última posição conhecida.
   */
  async buscarRastreamento(pedidoId: string) {
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: {
        id: true,
        codigo: true,
        status: true,
        localizacao: true,
        tecnico: { select: { id: true, nome: true, telefone: true } },
        localizacaoTecnico: {
          select: { latitude: true, longitude: true, updatedAt: true },
        },
      },
    });

    if (!pedido) {
      throw new LocalizacaoError("Pedido não encontrado.", 404);
    }

    const rastreamentoAtivo = STATUS_RASTREAMENTO_ATIVO.includes(pedido.status);

    return {
      pedidoId: pedido.id,
      codigo: pedido.codigo,
      status: pedido.status,
      enderecoCliente: pedido.localizacao,
      rastreamentoAtivo,
      tecnico: pedido.tecnico,
      // Só expõe a posição do técnico enquanto o atendimento estiver ativo
      localizacao: rastreamentoAtivo ? pedido.localizacaoTecnico : null,
    };
  }
}