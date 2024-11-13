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

export const fetchUserAtivos = async (req,res) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).send({
            message: "ID do usuário não encontrado."
        })
    }

    try {
        const ativos = await User_ativo.findAll({ where: { user_id: id } });

        if (!ativos) {
            return res.status(404).send({
                message: "Ativos do usuário não encontrados."
            })
        };

        return res.status(200).send(ativos);
    } catch (error) {
        return res.status(500).send({
            message: "Erro ao buscar dados dos ativos do usuário."
        });
    }
};

export const processaCompra = async (req,res) => {
    const { simbolo, quantidade, valor, tipo, userid } = req.body;
    const valor_total = parseFloat(valor) * parseInt(quantidade);

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
            // Atualiza o saldo do usuário
            user.saldo = parseFloat(user.saldo) - valor_total;
            await user.save({ transaction: t });

            // Registra uma nova transação de compra
            await Transacao.create({
                user_id: userid,
                ativo: simbolo,
                quantidade,
                tipo: "COMPRA",
                valor_total,
                data: new Date()
            }, { transaction: t }); 

            // Registra um novo ativo no inventário do user
            await User_ativo.create({
                user_id: userid,
                ativo: simbolo,
                tipo,
                quantidade,
                valor_compra: valor
            }, { transaction: t });

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

export const processaVenda = async (req, res) => {
    const { ativo, valor_compra, quantidade, userid } = req.body;
    const valor_total_venda = parseFloat(valor_compra) * parseInt(quantidade);

    if (!ativo || !valor_compra || !quantidade || !userid) {
        return res.status(400).send({
            message: "Parâmetros insuficientes!"
        })
    };

    try {
        // Verifica se o usuário existe no db
        const user = await User.findOne({ where: { id: userid } });
        
        if (!user) {
            return res.status(404).send({
                message: "Usuário não encontrado!"
            })
        };

        // Encontra o registro do ativo no inventário do usuário
        const registro_ativo = await User_ativo.findOne({
            where: {
                user_id: userid,
                ativo: ativo,
                valor_compra: valor_compra
            }
        });

        // Inicia uma transaction
        const t = await db.sequelize.transaction();

        try {
            // Atualiza o saldo do usuário
            user.saldo = parseFloat(user.saldo) + valor_total_venda;
            await user.save({ transaction: t });

            // Registra uma nova transação de venda
            await Transacao.create({
                user_id: userid,
                ativo,
                quantidade,
                tipo: "VENDA",
                valor_total: valor_total_venda,
                data: new Date()
            }, { transaction: t });

            // Se o usuário vender todas as unidades, deleta o registro do inventário
            if (registro_ativo.quantidade === quantidade) {
                await User_ativo.destroy({
                    where: {
                        user_id: userid,
                        ativo: ativo,
                        valor_compra: valor_compra
                    }, transaction: t
                });
            } else { 
                // Se vender menos, atualiza o registro no lugar
                registro_ativo -= quantidade;
                await registro_ativo.save({ transaction: t });
            };
            
            // Commita a transaction
            await t.commit();

            return res.status(200).send({
                message: "Venda realizada com sucesso!"
            });
        } catch (error) {
            console.error("Erro específico na transação:", error);
            // Desfaz a transaction, caso dê erro
            await t.rollback();

            return res.status(500).send({
                message: "Erro no processamento da venda."
            })
        };
    } catch (error) {
        return res.status(500).send({
            message: "Erro ao processar a venda do ativo."
        })
    };
};