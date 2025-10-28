import { Request, Response } from "express"
import { User } from "../models/User"

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

    // Compara as senhas
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" })
    }

    // Se tudo estiver ok, retorna os dados do usuário (sem a senha)
    const { password: _, ...userWithoutPassword } = user.toObject()
    res.status(200).json(userWithoutPassword)
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Internal server error" })
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
