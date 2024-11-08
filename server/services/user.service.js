import bcrypt from "bcrypt";
import db from "../models/index.js";
const User = db.users;

export const create = async (req,res) => {
    const { nome, email, senha  } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).send({
            message: "Todos os campos são obrigatórios!"
        });
    };

    try {
        const emailExiste = await User.findOne({ where: { email: email } });
        if (emailExiste) {
            return res.status(400).send({
                message: "Esse e-mail já está em uso. Escolha um novo e-mail."
            });
        };

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const user = {
            nome: nome,
            email: email,
            senha: senhaCriptografada,
            saldo: 0
        };

       const newUser = await User.create(user);
       res.status(201).send(newUser);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Ocorreu um erro ao criar um novo usuário."
        });
    };
};

export const findOne = async (req,res) => {
    const id = req.params.id;

    await User.findByPk(id)
        .then(data => {
            if (data) {
                res.status(200).send(data);
            } else {
                res.status(404).send({
                    message: `Não foi possível encontrar o usuário com id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || `Erro ao buscar o usuário com id=${id}.`
            });
        });
};

export const update = async (req,res) => {
    const id = req.params.id;

    await User.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.status(200).send({
                    message: "Usuário atualizado com sucesso."
                });
            } else {
                res.status(404).send({
                    message: `Não foi possível atualizar o usuário com id=${id}. Talvez o usuário não tenha sido encontrado ou o corpo da requisição esteja vazio.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || `Erro ao atualizar o usuário com id=${id}.`
            });
        });
};

export const deleta = async (req,res) => {
    const id = req.params.id;
    
    await User.destroy({
        where: { id: id } 
    })
        .then(num => {
            if (num == 1) {
                res.status(200).send({
                    message: "Usuário deletado com sucesso."
                });
            } else {
                res.status(404).send({
                    message: `Não foi possível deletar o usuário com id=${id}. Talvez o usuário não tenha sido encontrado.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || `Não foi possível deletar o usuário com id=${id}.`
            });
        });
};