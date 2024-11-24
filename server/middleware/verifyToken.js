import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const mySecret = process.env.JWT_SECRET_KEY;

// Função para verificar o token jwt
function verifyToken(req, res, next) {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(403).send("Token não fornecido -> ACESSO NEGADO!");
    };

    const bearerToken = token.split(" ")[1];
    jwt.verify(bearerToken, mySecret, (err, decoded) => {
        if (err) {
            return res.status(401).send("Token inválido -> ACESSO NEGADO!");
        }
        req.user = decoded;
        next();
    });
};

export default verifyToken;