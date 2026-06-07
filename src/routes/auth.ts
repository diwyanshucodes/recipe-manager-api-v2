import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../db/prisma";
import { RegisterSchema, LoginSchema } from "../schemas/auth.schema";
import { AppError } from "../middleware/errorHandler";
const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const registerBody = RegisterSchema.safeParse(req.body);
    if(!registerBody.success){
      return res.status(400).json({error: registerBody.error.issues})
    }
    const { email, password } = registerBody.data;
    
    //email already exists
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists)
      throw new AppError("Email already exists",400);
    //hash password
    const password_hash = await bcrypt.hash(password, 10);

    const result = await prisma.user.create({ data: { email, password_hash } })
    const { password_hash: _, ...safeUser } = result;
    res.status(201).json({ user: safeUser });
  } catch (err) {
    next(err)}
});
router.post("/login", async (req, res, next) => {
  try {
    const loginBody = LoginSchema.safeParse(req.body);
    if(!loginBody.success){
      return res.status(400).json({error: loginBody.error.issues})
    }
    const { email, password } = loginBody.data;
    
    //find user
    const result = await prisma.user.findUnique({ where: { email } })
    if (!result)
      throw new AppError('Invalid credentials',400);
    
    //compare password
    const match = await bcrypt.compare(password, result.password_hash);
    if (!match) 
      throw new AppError('Invalid credentials',400);
    //sign jwt token
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not set");

    const token = jwt.sign({ userId: result.id, email: result.email }, secret, {
      expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"],
    });
    res.json({ token });
  } catch (err) {
    next(err)}
});

export default router;
