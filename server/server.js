import express from "express";
import cors from "cors";
import db from "./models/index.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import ativoRoutes from "./routes/ativos.routes.js"
import passport from "./config/passport.config.js"
const PORT = process.env.SERVER_PORT;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

db.sequelize.sync({})
.then(() => {
  console.log("Banco de dados sincronizado!");
})
.catch((error) => {
  console.log("Erro na sicronização com a database: ", error); 
});

userRoutes(app);
authRoutes(app);
ativoRoutes(app);

app.listen(PORT, () => {
  console.log(`Server rodando na porta ${PORT}!`);
});