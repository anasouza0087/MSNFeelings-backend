import { Request, Response } from "express"
import { User } from "../models/User"
import * as jwt from "jsonwebtoken"
import * as bcrypt from "bcrypt"

export const createUser = async (req: Request, res: Response) => {
  const { name, password, email, avatar } = req.body

  if (!name || !password || !email) {
    return res.status(400).json({ message: "All fields are required!" })
  }

  try {
    // Verifica se o usuário já existe
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(409).json({ message: "User already exists" })
    }

    // Cria e salva novo usuário (o hash da senha acontece no schema)
    const newUser = await User.create({ name, password, email, avatar })

    // Remove a senha antes de retornar
    const { password: _, ...userWithoutPassword } = newUser.toObject()

    res.status(201).json(userWithoutPassword)
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const loginUser = async (req: Request, res: Response) => {
  const SECRET_KEY = "segredo123"
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" })
  }

  try {
    // Verifica se o usuário existe
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid)
      return res.status(401).json({ error: "Senha incorreta" })

    const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
      expiresIn: "1d",
    })

    res.json({
      message: "Login realizado com sucesso",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (err) {
    res.status(500).json({ error: "Erro ao fazer login" })
  }
}

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { email, name, page = 1, limit = 10, sort = "name" } = req.query

    const filter: any = {}
    if (email) filter.email = email
    if (name) filter.name = { $regex: name, $options: "i" }

    const pageNumber = Number(page)
    const limitNumber = Number(limit)
    const skip = (pageNumber - 1) * limitNumber

    const users = await User.find(filter)
      .select("-password -nickname")
      .sort(sort)
      .skip(skip)
      .limit(limitNumber)

    const totalUsers = await User.countDocuments(filter)
    const totalPages = Math.ceil(totalUsers / limitNumber)

    return res.status(200).json({
      currentPage: pageNumber,
      totalPages,
      totalUsers,
      results: users,
    })
  } catch (error) {
    console.error("Erro ao listar usuários:", error)
    return res.status(500).json({ error: "Erro interno no servidor" })
  }
}
