import dbConfig from "../config/db.config.js";
import userModel from "./user.model.js";
import transacaoModel from "./transacao.model.js";
import user_ativosModel from "./user_ativos.model.js";

import { Sequelize } from "sequelize";
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

const db = {
    Sequelize,
    sequelize,
    users: userModel(sequelize, Sequelize),
    transacoes: transacaoModel(sequelize, Sequelize),
    user_ativos: user_ativosModel(sequelize, Sequelize)
};

// User 1-N Transações 
db.users.hasMany(db.transacoes, { foreignKey: "user_id", as: "transacoes" });
db.transacoes.belongsTo(db.users, { foreignKey: "user_id", as: "user" });

// User 1-N User_ativos
db.users.hasMany(db.user_ativos, { foreignKey: "user_id", as: "ativos" });
db.user_ativos.belongsTo(db.users, { foreignKey: "user_id", as: "user" });

export default db;