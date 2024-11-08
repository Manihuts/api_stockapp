import { Router } from "express";
import verifyToken from "../middleware/verifyToken.js";
import { fetchAtivos, processaCompra } from "../services/ativo.service.js";

const router = Router();

router.get("/fetch", fetchAtivos);                  // Busca informações de todos os ativos
router.post("/buy", processaCompra);                // Processa a compra de um ativo

export default (app) => {
    app.use("/ativos", router);
};