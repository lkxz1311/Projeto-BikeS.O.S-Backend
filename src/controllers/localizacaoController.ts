import { Request, Response } from 'express';
import { LocalizacaoService } from '../services/localizacaoService.js';

const localizacaoService = new LocalizacaoService();

export class LocalizacaoController {
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
      return res.status(500).json({ mensagem: error.message || 'Erro ao processar localização.' });
    }
  }

  async buscar(req: Request, res: Response) {
    try {
      const { pedidoId } = req.params;

      const localizacao = await localizacaoService.buscarLocalizacaoPorPedido(pedidoId);

      return res.status(200).json(localizacao);
    } catch (error: any) {
      return res.status(404).json({ mensagem: error.message });
    }
  }
}