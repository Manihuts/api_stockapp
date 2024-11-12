export default (sequelize, Sequelize) => {
    const User_ativos = sequelize.define("user_ativos", {
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
        tipo: {
            type: Sequelize.STRING,
            allowNull: false
        },
        quantidade: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        valor_compra: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        }
    });

    return User_ativos;
};