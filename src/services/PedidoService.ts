import { prisma } from "./prisma.js";

function gerarCodigoPedido() {
  return `BS${Math.floor(1000 + Math.random() * 9000)}`;
}

function definirStatusInicial(tipo: string): string {
  if (tipo === "sos") return "SOS enviado";
  if (tipo === "agendado") return "Agendamento enviado";
  return "Aguardando técnico aceitar";
}

// Status que encerram o atendimento: a localização do técnico deixa de ser compartilhada
const STATUS_ENCERRADOS = ["Finalizado", "Rejeitado", "Cancelado"];

async function limparLocalizacaoTecnico(pedidoId: string) {
  await prisma.localizacaoTecnico.deleteMany({ where: { pedidoId } });
}

class PedidoService {
  async listarPorUsuario(userId: string) {
    return await prisma.pedido.findMany({
      where: { userId },
      include: {
        avaliacao: true,
        tecnico: { select: { id: true, nome: true, telefone: true } },
        localizacaoTecnico: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async listarPorTecnico(tecnicoId: string) {
    return await prisma.pedido.findMany({
      where: {
        tecnicoId,
        status: {
          in: ["Técnico aceitou", "Aceito pelo técnico", "Em atendimento"],
        },
      },
      include: {
        user: { select: { nome: true, telefone: true } },
        localizacaoTecnico: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async listarDisponiveis(tecnicoId?: string) {
    const orConditions: any[] = [{ tecnicoSolicitadoId: null }];

    if (tecnicoId) {
      orConditions.push({ tecnicoSolicitadoId: tecnicoId });
    }

    return await prisma.pedido.findMany({
      where: {
        status: {
          in: ["Aguardando técnico aceitar", "SOS enviado", "Agendamento enviado"],
        },
        OR: orConditions,
      },
      include: {
        user: { select: { nome: true, telefone: true } },
        localizacaoTecnico: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async listarEmAndamento() {
    return await prisma.pedido.findMany({
      where: {
        status: {
          in: ["Técnico aceitou", "Aceito pelo técnico", "Em atendimento"],
        },
      },
      include: {
        user: { select: { nome: true, telefone: true } },
        localizacaoTecnico: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async buscarPorId(id: string) {
    return await prisma.pedido.findUnique({
      where: { id },
      include: {
        user: { select: { nome: true, telefone: true } },
        tecnico: { select: { id: true, nome: true, telefone: true } },
        avaliacao: true,
        localizacaoTecnico: true,
      },
    });
  }

  async criar(dados: {
    tipo: string;
    userId: string;
    telefone: string;
    problema: string;
    bike: string;
    localizacao: string;
    rua?: string;
    cidade?: string;
    estado?: string;
    latitude?: number;
    longitude?: number;
    pagamento: string;
    tecnicoSolicitadoId?: string | null;
  }) {
    return await prisma.pedido.create({
      data: {
        codigo: gerarCodigoPedido(),
        tipo: dados.tipo,
        telefone: dados.telefone,
        problema: dados.problema,
        bike: dados.bike,
        localizacao: dados.localizacao,
        rua: dados.rua ?? null,
        cidade: dados.cidade ?? null,
        estado: dados.estado ?? null,
        latitude: dados.latitude ?? null,
        longitude: dados.longitude ?? null,
        pagamento: dados.pagamento,
        status: definirStatusInicial(dados.tipo),
        userId: dados.userId,
        tecnicoSolicitadoId: dados.tecnicoSolicitadoId ?? null,
      },
    });
  }

  async atualizarStatus(id: string, status: string, tecnicoId?: string) {
    const dataAtualizacao: any = { status };
    if (tecnicoId) {
      dataAtualizacao.tecnicoId = tecnicoId;
    }

    const pedido = await prisma.pedido.update({
      where: { id },
      data: dataAtualizacao,
    });

    if (STATUS_ENCERRADOS.includes(status)) {
      await limparLocalizacaoTecnico(id);
    }

    return pedido;
  }

  async atualizarLocalizacaoTecnico(pedidoId: string, latitude: number, longitude: number) {
    return await prisma.localizacaoTecnico.upsert({
      where: { pedidoId },
      update: {
        latitude,
        longitude,
      },
      create: {
        pedidoId,
        latitude,
        longitude,
      },
    });
  }

  async listarHistorico() {
    return await prisma.pedido.findMany({
      where: {
        status: "Finalizado",
      },
      include: {
        user: { select: { nome: true, telefone: true } },
        avaliacao: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async criarAvaliacao(dados: {
    pedidoId: string;
    clienteId: string;
    tecnicoId?: string;
    nota: number;
    comentario?: string;
  }) {
    const avaliacao = await prisma.avaliacao.create({
      data: {
        pedidoId: dados.pedidoId,
        clienteId: dados.clienteId,
        tecnicoId: dados.tecnicoId,
        nota: dados.nota,
        comentario: dados.comentario,
      },
    });

    await prisma.pedido.update({
      where: { id: dados.pedidoId },
      data: { status: "Finalizado" },
    });

    await limparLocalizacaoTecnico(dados.pedidoId);

    return avaliacao;
  }
}

export default new PedidoService();