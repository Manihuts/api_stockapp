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
            allowNull: false
        },
        quantidade: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        tipo: {
            type: Sequelize.ENUM("COMPRA", "VENDA"),
            allowNull: false
        },
        valor_total: {
            type: Sequelize.DECIMAL,
            allowNull: false
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