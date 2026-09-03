import { prisma } from "../prisma.js";

type CriarAvaliacaoInput = {
  nota: number;
  comentario?: string;
  clienteId: string;
  tecnicoId?: string;
  pedidoId: string;
};

function validarNota(nota: number) {
  if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
    throw new Error("A nota deve ser um número inteiro entre 1 e 5.");
  }
}

export async function criarAvaliacao(input: CriarAvaliacaoInput) {
  const { nota, comentario, clienteId, tecnicoId, pedidoId } = input;

  validarNota(nota);

  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: { avaliacao: true },
  });

  if (!pedido) {
    throw new Error("Pedido não encontrado.");
  }

  if (pedido.userId !== clienteId) {
    throw new Error("Este pedido não pertence ao cliente informado.");
  }

  if (pedido.status !== "Finalizado") {
    throw new Error(
      "Só é possível avaliar pedidos com status 'Finalizado'."
    );
  }

  if (pedido.avaliacao) {
    throw new Error("Este pedido já foi avaliado.");
  }

  const avaliacao = await prisma.avaliacao.create({
    data: {
      nota,
      comentario,
      clienteId,
      ...(tecnicoId ? { tecnicoId } : {}),
      pedidoId,
    },
    include: {
      pedido: { select: { codigo: true, problema: true } },
      tecnico: { select: { nome: true } },
    },
  });

  return avaliacao;
}

export async function listarAvaliacoesPorCliente(clienteId: string) {
  const avaliacoes = await prisma.avaliacao.findMany({
    where: { clienteId },
    orderBy: { createdAt: "desc" },
    include: {
      pedido: { select: { codigo: true, problema: true, bike: true } },
      tecnico: { select: { nome: true, telefone: true } },
    },
  });

  return avaliacoes;
}

export async function listarAvaliacoesPorTecnico(tecnicoId: string) {
  const avaliacoes = await prisma.avaliacao.findMany({
    where: { tecnicoId },
    orderBy: { createdAt: "desc" },
    include: {
      pedido: { select: { codigo: true, problema: true, bike: true } },
      cliente: { select: { nome: true } },
    },
  });

  return avaliacoes;
}

export async function mediaDeTecnico(tecnicoId: string) {
  const resultado = await prisma.avaliacao.aggregate({
    where: { tecnicoId },
    _avg: { nota: true },
    _count: { nota: true },
  });

  return {
    tecnicoId,
    media: resultado._avg.nota ?? 0,
    totalAvaliacoes: resultado._count.nota,
  };
}

export async function buscarAvaliacaoPorPedido(pedidoId: string) {
  const avaliacao = await prisma.avaliacao.findUnique({
    where: { pedidoId },
    include: {
      cliente: { select: { nome: true } },
      tecnico: { select: { nome: true } },
      pedido: { select: { codigo: true, problema: true } },
    },
  });

  if (!avaliacao) {
    throw new Error("Avaliação não encontrada para este pedido.");
  }

  return avaliacao;
}