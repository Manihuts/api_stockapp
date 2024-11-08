export default (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        github_id: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        profile_url: {
            type: Sequelize.STRING,
            allowNull: true
        },
        nome: {
            type: Sequelize.STRING,
            allowNull: true
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true 
        },
        senha: {
            type: Sequelize.STRING,
            allowNull: true
        },
        saldo: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        }
    });

    return User;
};