import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { authMiddleware } from "../middleware/auth";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const token = await AuthService.register(req.body);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // use HTTPS in prod
        sameSite: "lax", // or "strict"
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      res.status(201).json({ message: "User registered successfully" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { token, user } = await AuthService.login(email, password);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(200).json({ message: "Login successful", user });
    } catch (err: any) {
      res.status(401).json({ message: err.message });
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // set to true in production
      sameSite: "lax",
    });
    res.status(200).json({ message: "Logged out" });
  }
}
