import passport from "passport";
import jwt from "jsonwebtoken";
const SECRET_KEY = process.env.JWT_SECRET_KEY;

export const normalLogin = (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return res.status(400).send({
                message: "Erro na autenticação do usuário.", ...info
            });
        } else if (!user) {
            return res.status(404).send({
                message: "Usuário não encontrado.", ...info
            });
        };

        const idPayload = user.github_id ? user.github_id : user.id;
        const token = jwt.sign({ id: idPayload  }, SECRET_KEY, { expiresIn: "1h" });

        return res.status(200).send({
            token,
            user: { id: idPayload, name: user.nome },
            message: "Login convencional realizado com sucesso!"
        });
    })(req, res, next);
};

export const githubLogin = (req, res, next) => {
    passport.authenticate("github",  (err, user, info) => {
        if (err) {
            return res.status(400).send({
                message: "Erro na autenticação do usuário pelo Github.", ...info
            });
        } else if (!user) {
            return res.status(404).send({
                message: "Usuário Github não encontrado.", ...info
            });
        };

        const idPayload = user.id;
        const token = jwt.sign({ id: idPayload  }, SECRET_KEY, { expiresIn: "1h" });

        return res.status(200).send({
            token,
            user: { id: idPayload, name: user.nome },
            message: "Login pelo Github realizado com sucesso!"
        });

    })(req, res, next);
};