import { Request, Response } from "express";
import PedidoService from "../services/PedidoService.js";

class PedidoController {
  async listarPorUsuario(request: Request, response: Response) {
    const { userId } = request.params;

    if (!userId) {
      return response.status(400).json({ mensagem: "userId é obrigatório" });
    }

    try {
      const pedidos = await PedidoService.listarPorUsuario(userId);
      return response.json(pedidos);
    } catch (error) {
      return response.status(500).json({ mensagem: "Erro ao buscar pedidos" });
    }
  }

  async listarDisponiveis(request: Request, response: Response) {
    try {
      const pedidos = await PedidoService.listarDisponiveis();
      return response.json(pedidos);
    } catch (error) {
      return response.status(500).json({ mensagem: "Erro ao buscar pedidos disponíveis" });
    }
  }

  async listarEmAndamento(request: Request, response: Response) {
    try {
      const pedidos = await PedidoService.listarEmAndamento();
      return response.json(pedidos);
    } catch (error) {
      return response.status(500).json({ mensagem: "Erro ao buscar pedidos em andamento" });
    }
  }

  async buscarPorId(request: Request, response: Response) {
    const { id } = request.params;

    try {
      const pedido = await PedidoService.buscarPorId(id);

      if (!pedido) {
        return response.status(404).json({ mensagem: "Pedido não encontrado" });
      }

      return response.json(pedido);
    } catch (error) {
      return response.status(500).json({ mensagem: "Erro ao buscar pedido" });
    }
  }

  async criar(request: Request, response: Response) {
    const { tipo, userId, telefone, problema, bike, localizacao, pagamento } = request.body;

    if (!tipo || !userId || !telefone || !problema || !bike || !localizacao || !pagamento) {
      return response.status(400).json({ mensagem: "Preencha todos os campos obrigatórios" });
    }

    try {
      const pedido = await PedidoService.criar({
        tipo,
        userId,
        telefone,
        problema,
        bike,
        localizacao,
        pagamento,
      });

      return response.status(201).json(pedido);
    } catch (error) {
      return response.status(500).json({ mensagem: "Erro ao criar pedido" });
    }
  }

  async atualizarStatus(request: Request, response: Response) {
    const { id } = request.params;
    const { status } = request.body;

    if (!status) {
      return response.status(400).json({ mensagem: "Status é obrigatório" });
    }

    try {
      const pedido = await PedidoService.atualizarStatus(id, status);
      return response.json(pedido);
    } catch (error) {
      return response.status(500).json({ mensagem: "Erro ao atualizar status" });
    }
  }
}

export default new PedidoController();