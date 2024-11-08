import axios from "axios";
import db from "../models/index.js";
const User = db.users;
const Transacao = db.transacoes;
const User_ativo = db.user_ativos;

const SERVER_URL = process.env.SERVER_URL;
const API_KEY = process.env.BRAPI_TOKEN;
const API_URL = process.env.API_URL;

export const fetchAtivos = async (req,res) => {
    const { type, market } = req.query;

    try {
        const response = await axios.get(`${API_URL}/quote/list`, {
            headers: {
                Authorization: `Bearer ${API_KEY}`
            },
            params: {
                market: market || "B3",
                type: type || "stock",
                limit: 50
            }
        });

        const ativos = response.data.stocks;
        const dados = ativos.map(ativo => ({
            nome: ativo.name,
            simbolo: ativo.stock,
            valor: ativo.close,
            tipo: ativo.type
        }))

        return res.status(200).send(dados);
    } catch (error) {
        return res.status(500).send({
            message: "Erro ao buscar dados dos ativos."
        });
    };
};

export const processaCompra = async (req,res) => {
    const { simbolo, quantidade, valor, tipo, userid } = req.body;
    const valor_total = valor * quantidade;

    if (!simbolo || !quantidade || !valor || !tipo || !userid) {
        return res.status(400).send({
            message: "Parâmetros insuficientes!"
        })
    };

    try {
        const user = await User.findOne({ where: { id: userid } });
        // Verifica se o usuário existe no db
        if (!user) {
            return res.status(404).send({
                message: "Usuário não encontrado!"
            })
        };
        // Verifica se o usuário tem saldo suficiente
        if (user.saldo < valor_total) {
            return res.status(400).send({
                message: "O usuário não possui saldo suficiente para realizar a transação!"
            })
        };

        // Inicia uma transaction
        const t = await db.sequelize.transaction();

        try {
            console.log("Atualizando saldo do usuário...");
            // Atualiza o saldo do usuário
            user.saldo -= valor_total;
            await user.save({ transaction: t });

            console.log("Registrando nova transação...");
            // Registra uma nova transação
            await Transacao.create({
                user_id: userid,
                ativo: simbolo,
                quantidade,
                tipo: "COMPRA",
                valor_total,
                data: new Date()
            }, { transaction: t }); 

            console.log("Registrando novo ativo no inventário do usuário...");
            // Registra um novo ativo no inventário do user
            await User_ativo.create({
                user_id: userid,
                ativo: simbolo,
                tipo,
                quantidade,
                valor_compra: valor
            }, { transaction: t });

            console.log("Commit da transação...");
            // Commita a transaction
            await t.commit();

            return res.status(200).send({
                message: "Compra realizada com sucesso!"
            });
        } catch (error) {
            console.error("Erro específico na transação:", error);
            // Desfaz a transaction, caso dê erro
            await t.rollback();

            return res.status(500).send({
                message: "Erro no processamento da compra."
            })
        };
    } catch (error) {
        return res.status(500).send({
            message: "Erro ao processar a compra do ativo."
        })
    }
};