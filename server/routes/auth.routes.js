import { Router } from "express";
import passport from "passport";
import * as authService from "../services/auth.service.js"

const router = Router();

router.post("/login", (req, res, next) => {
    authService.normalLogin(req, res, next);
}); 

router.get("/github/login",
    passport.authenticate("github", { scope: "user" })
);

router.get("/github/callback", (req, res, next) => {
    authService.githubLogin(req, res, next);
});

export default (app) => {
    app.use("/auth", router);
}