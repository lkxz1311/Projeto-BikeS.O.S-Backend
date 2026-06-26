import { Request, Response } from "express";
import UserService from "../services/UserService.js";

export default class UserController {
  static async criar(req: Request, res: Response) {
    try {
      const usuario = await UserService.cadastrarUsuario(req.body);
      return res.status(201).json(usuario);
    } catch (error: any) {
      return res.status(400).json({ mensagem: error.message });
    }
  }

  static async criarTecnico(req: Request, res: Response) {
    try {
      const usuario = await UserService.cadastrarUsuario({ ...req.body, tipo: "tecnico" });
      return res.status(201).json(usuario);
    } catch (error: any) {
      return res.status(400).json({ mensagem: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;
      console.log("Login request received:", { email, senha }); // Log the request body
      const usuario = await UserService.login(email, senha);
      return res.status(200).json(usuario);
    } catch (error: any) {
      return res.status(400).json({ mensagem: error.message });
    }
  }

  static async buscarPerfil(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const usuario = await UserService.buscarUsuarioPorId(id);
      return res.status(200).json(usuario);
    } catch (error: any) {
      return res.status(400).json({ mensagem: error.message });
    }
  }

  static async atualizarPerfil(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const usuario = await UserService.atualizarUsuario(id, req.body);
      return res.status(200).json(usuario);
    } catch (error: any) {
      return res.status(400).json({ mensagem: error.message });
    }
  }
}