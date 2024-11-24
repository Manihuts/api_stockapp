import { Router } from "express";
import verifyToken from "../middleware/verifyToken.js";
import { fetchAtivos, fetchEvolucaoSaldo, fetchEvolucaoValorInvestido, fetchUserAtivos, processaCompra, processaFavorito, processaVenda } from "../services/ativo.service.js";

const router = Router();

router.get("/fetch",  verifyToken, fetchAtivos);                                         // Busca informações de todos os ativos
router.get("/fetch/:id", verifyToken, fetchUserAtivos);                                  // Busca ativos de um usuário
router.get("/fetch/evolution/balance/:id", verifyToken, fetchEvolucaoSaldo);             // Busca a evolução do saldo de um usuário
router.get("/fetch/evolution/invested/:id", verifyToken, fetchEvolucaoValorInvestido);   // Busca a evolução do valor investido de um usuário
router.post("/buy", verifyToken, processaCompra);                                        // Processa a compra de um ativo
router.post("/sell", verifyToken, processaVenda);                                        // Processa a venda de um ativo
router.put("/fav/:id", verifyToken, processaFavorito);                                   // Favorita ou desfavorita um ativo

export default (app) => {
    app.use("/ativos", router);
};