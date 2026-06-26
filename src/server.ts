import 'dotenv/config'; 

import express, { Request, Response } from "express";
import cors from "cors";
import pedidoRoutes from './routes/pedidoRoutes.js';
import usuarioRoutes from './routes/usuarioRouter.js';

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3333;

app.get("/", (request: Request, response: Response) => {
  return response.json({
    mensagem: "API do BikeS.O.S online",
    status: "ok",
  });
});

app.get("/teste", (request: Request, response: Response) => {
  return response.json({
    mensagem: "Backend do BikeS.O.S funcionando",
  });
});

app.use(pedidoRoutes);
app.use(usuarioRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});