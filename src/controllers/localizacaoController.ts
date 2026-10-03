import { Request, Response } from 'express';
import { LocalizacaoError, LocalizacaoService } from '../services/localizacaoService.js';

const localizacaoService = new LocalizacaoService();

function responderErro(res: Response, error: any, mensagemPadrao: string) {
  if (error instanceof LocalizacaoError) {
    return res.status(error.statusCode).json({ mensagem: error.message });
  }
  console.error(mensagemPadrao, error);
  return res.status(500).json({ mensagem: error?.message || mensagemPadrao });
}

export class LocalizacaoController {
  // POST /pedidos/:pedidoId/localizacao  -> chamado pelo app do técnico
  async salvar(req: Request, res: Response) {
    try {
      const { pedidoId } = req.params;
      const { tecnicoId, latitude, longitude } = req.body;

      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ mensagem: 'Latitude e longitude são obrigatórias.' });
      }

      const localizacao = await localizacaoService.atualizarLocalizacao({
        pedidoId,
        tecnicoId,
        latitude: Number(latitude),
        longitude: Number(longitude),
      });

      return res.status(200).json(localizacao);
    } catch (error: any) {
      return responderErro(res, error, 'Erro ao processar localização.');
    }
  }

  // GET /pedidos/:pedidoId/localizacao
  async buscar(req: Request, res: Response) {
    try {
      const { pedidoId } = req.params;

      const localizacao = await localizacaoService.buscarLocalizacaoPorPedido(pedidoId);

      return res.status(200).json(localizacao);
    } catch (error: any) {
      return responderErro(res, error, 'Erro ao buscar localização.');
    }
  }

  // GET /pedidos/:pedidoId/rastreamento  -> chamado pelo app do cliente (polling)
  async rastreamento(req: Request, res: Response) {
    try {
      const { pedidoId } = req.params;

      const dados = await localizacaoService.buscarRastreamento(pedidoId);

      return res.status(200).json(dados);
    } catch (error: any) {
      return responderErro(res, error, 'Erro ao buscar rastreamento.');
    }
  }
}