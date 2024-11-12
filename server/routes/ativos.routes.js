import { Router } from "express";
import verifyToken from "../middleware/verifyToken.js";
import { fetchAtivos, fetchUserAtivos, processaCompra } from "../services/ativo.service.js";

const router = Router();

router.get("/fetch", fetchAtivos);                  // Busca informações de todos os ativos
router.get("/fetch/:id", fetchUserAtivos);          // Busca ativos de um usuário, pelo seu ID
router.post("/buy", processaCompra);                // Processa a compra de um ativo

export default (app) => {
    app.use("/ativos", router);
};