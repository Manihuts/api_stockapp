import { Router } from "express";
import * as users from "../services/user.service.js";
import verifyToken from "../middleware/verifyToken.js";

const router = Router();

router.post("/create", users.create);                   // Cria um novo usuário
router.get("/:id", verifyToken, users.findOne);                      // Busca usuário pelo id
router.put("/:id", verifyToken, users.update);                       // Atualiza usuário pelo id
router.delete("/:id", verifyToken, users.deleta);                    // Deleta usuário pelo id
router.post("/add/:id", verifyToken, users.addSaldo);                // Processa um depósito
router.post("/remove/:id", verifyToken, users.removeSaldo);          // Processa um saque
router.get("/hist/:id", verifyToken, users.historico);               // Busca o histórico de transações do usuário

export default (app) => {
    app.use("/users", router);
};