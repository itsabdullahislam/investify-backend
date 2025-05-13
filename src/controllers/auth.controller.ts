import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { authenticateUser } from "../middleware/auth";

export class AuthController {
  

static async register(req: Request, res: Response) {
  try {
    const token = await AuthService.register(req.body);
    res.status(201).json({ message: "User registered successfully", token }); // <-- include token
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

static async login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const { token, user } = await AuthService.login(email, password);
    res.status(200).json({ message: "Login successful", user, token }); // <-- include token
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
}

static async logout(req: Request, res: Response) {
  // If using localStorage, nothing needs to be cleared server-side
  res.status(200).json({ message: "Logged out" });
}

}
