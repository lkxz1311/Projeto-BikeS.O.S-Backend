import { prisma } from "../prisma.js";

function gerarCodigoPedido() {
  return `BS${Math.floor(1000 + Math.random() * 9000)}`;
}

function definirStatusInicial(tipo: string): string {
  if (tipo === "sos") return "SOS enviado";
  if (tipo === "agendado") return "Agendamento enviado";
  return "Aguardando técnico aceitar";
}

class PedidoService {
  async listarPorUsuario(userId: string) {
    return await prisma.pedido.findMany({
      where: { userId },
      include: {
        avaliacao: true,
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
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async buscarPorId(id: string) {
    return await prisma.pedido.findUnique({
      where: { id },
      include: {
        user: { select: { nome: true, telefone: true } },
        avaliacao: true,
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

    return await prisma.pedido.update({
      where: { id },
      data: dataAtualizacao,
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

    return avaliacao;
  }
}

export default new PedidoService();