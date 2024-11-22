import { Router } from "express";
import verifyToken from "../middleware/verifyToken.js";
import { fetchAtivos, fetchEvolucaoSaldo, fetchUserAtivos, processaCompra, processaFavorito, processaVenda } from "../services/ativo.service.js";

const router = Router();

router.get("/fetch", fetchAtivos);                      // Busca informações de todos os ativos
router.get("/fetch/:id", fetchUserAtivos);              // Busca ativos de um usuário
router.get("/fetch/evolution/:id", fetchEvolucaoSaldo);  // Busca a evolução do saldo de um usuário
router.post("/buy", processaCompra);                    // Processa a compra de um ativo
router.post("/sell", processaVenda);                    // Processa a venda de um ativo
router.put("/fav/:id", processaFavorito);               // Favorita ou desfavorita um ativo

export default (app) => {
    app.use("/ativos", router);
};