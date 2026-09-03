import { Router } from "express";
import {
  criar,
  listarPorCliente,
  listarPorTecnico,
  media,
  porPedido,
} from "../controllers/AvaliacaoController.js";

const router = Router();

router.post("/", criar);
router.get("/cliente/:clienteId", listarPorCliente);
router.get("/tecnico/:tecnicoId", listarPorTecnico);
router.get("/tecnico/:tecnicoId/media", media);
router.get("/pedido/:pedidoId", porPedido);

export default router;