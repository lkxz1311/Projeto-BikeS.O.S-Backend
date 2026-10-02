import { Router } from 'express';
import { LocalizacaoController } from '../controllers/localizacaoController.js';

const localizacaoRoutes = Router();
const localizacaoController = new LocalizacaoController();

localizacaoRoutes.post('/pedidos/:pedidoId/localizacao', (req, res) => localizacaoController.salvar(req, res));

localizacaoRoutes.get('/pedidos/:pedidoId/localizacao', (req, res) => localizacaoController.buscar(req, res));

export { localizacaoRoutes };