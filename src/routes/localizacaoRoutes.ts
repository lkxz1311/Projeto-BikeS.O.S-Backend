import { Router } from 'express';
import { LocalizacaoController } from '../controllers/localizacaoController.js';

const localizacaoRoutes = Router();
const localizacaoController = new LocalizacaoController();

localizacaoRoutes.post('/pedidos/:pedidoId/localizacao', (req, res) => localizacaoController.salvar(req, res));

localizacaoRoutes.get('/pedidos/:pedidoId/localizacao', (req, res) => localizacaoController.buscar(req, res));

// Status do pedido + dados do técnico + última posição (usado pelo app do cliente)
localizacaoRoutes.get('/pedidos/:pedidoId/rastreamento', (req, res) => localizacaoController.rastreamento(req, res));

export { localizacaoRoutes };