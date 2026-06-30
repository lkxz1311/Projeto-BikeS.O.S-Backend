import { Router } from "express";
import UserController from "../controllers/UserController.js";

const usuarioRoutes = Router();

usuarioRoutes.post("/usuarios/cadastro", UserController.criar);
usuarioRoutes.post("/usuarios/cadastro/tecnico", UserController.criarTecnico);
usuarioRoutes.post("/usuarios/login", UserController.login);
usuarioRoutes.get("/usuarios/tecnicos", UserController.listarTecnicos);
usuarioRoutes.get("/usuarios/:id", UserController.buscarPerfil);
usuarioRoutes.put("/usuarios/:id", UserController.atualizarPerfil);

export default usuarioRoutes;