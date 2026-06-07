import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";

function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not set");
    const decodedPayload = jwt.verify(token, secret) as {
      userId: number;
      email: string;
    };
    req.user = decodedPayload;
    next();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid token";
    return res.status(401).json({ error: message });
  }
}

export default requireAuth;
