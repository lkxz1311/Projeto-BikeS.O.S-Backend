import { Request, Response } from "express";
import {
  criarAvaliacao,
  listarAvaliacoesPorCliente,
  listarAvaliacoesPorTecnico,
  mediaDeTecnico,
  buscarAvaliacaoPorPedido,
} from "../services/AvaliacaoService.js";

export async function criar(req: Request, res: Response) {
  try {
    const { nota, comentario, clienteId, tecnicoId, pedidoId } = req.body;

    if (!nota || !clienteId || !pedidoId) {
      return res.status(400).json({
        erro: "Os campos nota, clienteId e pedidoId são obrigatórios.",
      });
    }

    const avaliacao = await criarAvaliacao({
      nota: Number(nota),
      comentario,
      clienteId,
      tecnicoId,
      pedidoId,
    });

    return res.status(201).json(avaliacao);
  } catch (error: any) {
    return res.status(400).json({ erro: error.message });
  }
}

export async function listarPorCliente(req: Request, res: Response) {
  try {
    const { clienteId } = req.params;
    const avaliacoes = await listarAvaliacoesPorCliente(clienteId);
    return res.status(200).json(avaliacoes);
  } catch (error: any) {
    return res.status(500).json({ erro: error.message });
  }
}

export async function listarPorTecnico(req: Request, res: Response) {
  try {
    const { tecnicoId } = req.params;
    const avaliacoes = await listarAvaliacoesPorTecnico(tecnicoId);
    return res.status(200).json(avaliacoes);
  } catch (error: any) {
    return res.status(500).json({ erro: error.message });
  }
}

export async function media(req: Request, res: Response) {
  try {
    const { tecnicoId } = req.params;
    const resultado = await mediaDeTecnico(tecnicoId);
    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(500).json({ erro: error.message });
  }
}

export async function porPedido(req: Request, res: Response) {
  try {
    const { pedidoId } = req.params;
    const avaliacao = await buscarAvaliacaoPorPedido(pedidoId);
    return res.status(200).json(avaliacao);
  } catch (error: any) {
    return res.status(404).json({ erro: error.message });
  }
}
