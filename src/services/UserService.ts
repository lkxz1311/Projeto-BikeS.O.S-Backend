import { prisma } from "../prisma.js";
import bcrypt from "bcrypt";

export default class UserService {
  static async cadastrarUsuario(dados: any) {
    const { nome, email, telefone, senha, tipo = "cliente" } = dados;

    if (!nome || !email || !telefone || !senha) {
      throw new Error("Nome, email, telefone e senha são obrigatórios.");
    }

    const usuarioExistente = await prisma.user.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      throw new Error("Este e-mail já está cadastrado.");
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.user.create({
      data: {
        nome,
        telefone,
        email,
        senha: senhaHash,
        tipo,
      },
    });

    const { senha: _, ...usuarioSeguro } = usuario;
    return usuarioSeguro;
  }

  static async login(email: string, senha: string) {
    const usuario = await prisma.user.findUnique({ where: { email } });

    if (!usuario) {
      throw new Error("E-mail ou senha incorretos.");
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      throw new Error("E-mail ou senha incorretos.");
    }

    const { senha: _, ...usuarioSeguro } = usuario;
    return usuarioSeguro;
  }

  static async buscarUsuarioPorId(id: string) {
    if (!id) {
      throw new Error("ID do usuário é obrigatório.");
    }

    const usuario = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        tipo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!usuario) {
      throw new Error("Usuário não encontrado.");
    }

    return usuario;
  }

  static async atualizarUsuario(id: string, dados: any) {
    if (!id) {
      throw new Error("ID do usuário é obrigatório.");
    }

    const { nome, telefone } = dados;

    const usuarioExistente = await prisma.user.findUnique({
      where: { id },
    });

    if (!usuarioExistente) {
      throw new Error("Usuário não encontrado.");
    }

    const usuarioAtualizado = await prisma.user.update({
      where: { id },
      data: {
        ...(nome && { nome }),
        ...(telefone && { telefone }),
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        tipo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return usuarioAtualizado;
  }
}