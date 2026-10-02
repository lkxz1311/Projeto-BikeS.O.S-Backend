import { prisma } from "./prisma.js";

interface AtualizarLocalizacaoData {
  pedidoId: string;
  tecnicoId?: string;
  latitude: number;
  longitude: number;
}

export class LocalizacaoService {
  async atualizarLocalizacao(data: AtualizarLocalizacaoData) {
    const { pedidoId, latitude, longitude } = data;

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
      throw new Error("Localização não encontrada para o pedido informado.");
    }

    return localizacao;
  }
}