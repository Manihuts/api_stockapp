import axios from "axios";
import db from "../models/index.js";
const User = db.users;
const Transacao = db.transacoes;
const User_ativo = db.user_ativos;

const SERVER_URL = process.env.SERVER_URL;
const API_KEY = process.env.BRAPI_TOKEN;
const API_URL = process.env.API_URL;

export const fetchAtivos = async (req,res) => {
    try {
        const response = await axios.get(`${API_URL}/quote/list`, {
            headers: {
                Authorization: `Bearer ${API_KEY}`
            },
            params: {
                market: "B3",
                limit: 200
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
            message: "Erro ao buscar dados dos ativos.",
            error: error.message
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
            message: "Erro ao buscar dados dos ativos do usuário.",
            error: error.message
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
                mudanca: -(valor_total),
                data: new Date()
            }, { transaction: t }); 

            // Registra um novo ativo no inventário do user
            await User_ativo.create({
                user_id: userid,
                ativo: simbolo,
                tipo,
                quantidade,
                valor_compra: valor,
                isFavorito: 0
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
            message: "Erro ao processar a compra do ativo.",
            error: error.message
        })
    }
};

export const processaVenda = async (req, res) => {
    const { ativo, valor_compra, quantidade, userid } = req.body;

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

        if (!registro_ativo) {
            return res.status(404).send({
                message: "Registro do ativo não encontrado!"
            });
        };

        // Busca a cotação atual da ação, para calcular o valor total da venda
        const busca_ativo = await axios.get(`${API_URL}/quote/${ativo}`, {
            headers: {
                Authorization: `Bearer ${API_KEY}`
            }
        });

        if (!busca_ativo) {
            return res.status(404).send({
                message: "Erro na busca do valor do ativo!"
            });
        };

        const cotacao_ativo = busca_ativo.data.results[0].regularMarketPrice;

        // Compara os valores totais na compra e na venda pra retornar o lucro/prejuízo
        const valor_total_compra = parseFloat(valor_compra) * parseInt(quantidade);
        const valor_total_venda = parseFloat(cotacao_ativo) * parseInt(quantidade);

        const mudanca = valor_total_venda - valor_total_compra;

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
                mudanca,
                data: new Date()
            }, { transaction: t });

            registro_ativo.quantidade = Number(registro_ativo.quantidade) - Number(quantidade);
            if (registro_ativo.quantidade <= 0) {       // Se o usuário vender todas as unidades, deleta o registro do inventário                   
                await User_ativo.destroy({
                    where: {
                        user_id: userid,
                        ativo: ativo,
                        valor_compra: valor_compra
                    }, transaction: t
                });
            } else {        // Se vender menos, atualiza o registro no lugar                                                
                await registro_ativo.save({ transaction: t });      
            };
            
            // Commita a transaction
            await t.commit();

            return res.status(200).send({
                message: "Venda realizada com sucesso!", mudanca
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
            message: "Erro ao processar a venda do ativo.",
            error: error.message
        })
    };
};

export const processaFavorito =  async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    try {
        const ativo = await User_ativo.findByPk(id);

        if (!ativo) {
            return res.status(404).send({
                message: "Ativo não encontrado."
            });
        };

        ativo.isFavorito = estado;
        await ativo.save();

        return res.status(200).send({
            message: "Favorito atualizado com sucesso."
        });
    } catch (error) {
        return res.status(500).send({
            message: "Erro ao atualizar favorito.",
            error: error.message
        })
    }
}