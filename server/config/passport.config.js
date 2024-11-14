import passport from "passport";
import LocalStrategy from "passport-local";
import GitHubStrategy from "passport-github2"
import bcrypt from "bcrypt";

import db from "../models/index.js";
const User = db.users;

passport.use(
    new LocalStrategy({
        usernameField: "email",
        passwordField: "senha"
    },

    async (email, senha, done) => {
        try {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return done(null, false, { message: "O usuário não foi encontrado." });
            }

            const match = await bcrypt.compare(senha, user.senha);
            if (!match) {
                return done(null, false, { message: "E-mail ou senha incorretos." });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

passport.use(
    new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
        scope: ["user"]
    },

    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
            if (!email) {
                return done( new Error("O e-mail do perfil GitHub está indisponível.") );
            };

            const user = await User.findOne({ where: { email } });
            if (!user) {
                user = await User.create({
                    id: profile.id,
                    email: email,
                    nome: profile.name,
                    profile_url: profile._json.html_url,
                    saldo: 0
                })
            }

            return done(null, user)
        } catch (error) {
            return done(error);
        }
    }
));

export default passport;