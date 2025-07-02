import { Request, Response } from "express";
import { User } from "../models/User";

export const createUser = async (req: Request, res: Response) => {
  const { name, password, nickname, email } = req.body;

  if (!name || !password || !nickname || !email) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {
    // Verifica se o usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Cria e salva novo usuário (o hash da senha acontece no schema)
    const newUser = await User.create({ name, password, nickname, email });

    // Remove a senha antes de retornar
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
