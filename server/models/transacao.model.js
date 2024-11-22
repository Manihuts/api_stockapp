export default (sequelize, Sequelize) => {
    const Transacao = sequelize.define("transacao", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        ativo: {
            type: Sequelize.STRING,
            allowNull: true
        },
        quantidade: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        tipo: {
            type: Sequelize.ENUM("COMPRA", "VENDA", "SAQUE", "DEPÓSITO"),
            allowNull: false
        },
        valor_total: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        },
        mudanca: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true
        },
        data: {
            type: Sequelize.DATE,
            allowNull: false
        }
    }, {
        tableName: "transacao"
    });

    return Transacao;
};