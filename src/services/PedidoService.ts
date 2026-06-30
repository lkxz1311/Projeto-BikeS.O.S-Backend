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
      orderBy: { createdAt: "desc" },
    });
  }

  async listarDisponiveis() {
    return await prisma.pedido.findMany({
      where: {
        status: {
          in: ["Aguardando técnico aceitar", "SOS enviado", "Agendamento enviado"],
        },
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
          in: ["Técnico aceitou", "Técnico a caminho", "Em atendimento"],
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
      },
    });
  }

  async atualizarStatus(id: string, status: string) {
    return await prisma.pedido.update({
      where: { id },
      data: { status },
    });
  }

  async listarHistorico() {
    return await prisma.pedido.findMany({
      where: {
        status: { in: ["Finalizado", "Rejeitado"] },
      },
      include: {
        user: { select: { nome: true, telefone: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export default new PedidoService();