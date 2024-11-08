import { Router } from "express";
import * as users from "../services/user.service.js";
import verifyToken from "../middleware/verifyToken.js";

const router = Router();

router.post("/create", users.create);                   // Cria um novo usuário
router.get("/:id", users.findOne);                      // Busca usuário pelo id
router.put("/:id", users.update);                       // Atualiza usuário pelo id
router.delete("/:id", users.deleta);                    // Deleta usuário pelo id 

export default (app) => {
    app.use("/users", router);
};