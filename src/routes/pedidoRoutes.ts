import { Router } from "express";
import PedidoController from "../controllers/PedidoController.js";

const pedidoRoutes = Router();

pedidoRoutes.get("/pedidos/disponiveis", PedidoController.listarDisponiveis);
pedidoRoutes.get("/pedidos/emandamento", PedidoController.listarEmAndamento);
pedidoRoutes.get("/pedidos/historico", PedidoController.listarHistorico);
pedidoRoutes.get("/pedidos/usuario/:userId", PedidoController.listarPorUsuario);
pedidoRoutes.get("/pedidos/tecnico/:tecnicoId", PedidoController.listarPorTecnico);
pedidoRoutes.get("/pedidos/:id", PedidoController.buscarPorId);
pedidoRoutes.post("/pedidos", PedidoController.criar);
pedidoRoutes.post("/pedidos/avaliar", PedidoController.avaliar);
pedidoRoutes.patch("/pedidos/:id/status", PedidoController.atualizarStatus);

export default pedidoRoutes;