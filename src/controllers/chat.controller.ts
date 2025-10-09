import { Request, Response } from "express"
import { Chat } from "../models/Chat"

export const createChatroom = async (req: Request, res: Response) => {
  const { name } = req.body

  if (!name) {
    return res.status(400).json({ message: "All fields are required!" })
  }

  try {
    const newChatroom = await Chat.create({ name })
    res.status(201).json(newChatroom)
  } catch (error) {
    console.error("Erro ao criar chatroom:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const listChatrooms = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    // filtro pelo name (query string: ?name=algo)
    const name = req.query.name as string
    const filter: any = {}

    if (name) {
      filter.name = { $regex: name, $options: "i" } // "i" = case-insensitive
    }

    // busca paginada com filtro
    const chatrooms = await Chat.find(filter, "_id name avatar")
      .skip(skip)
      .limit(limit)

    const total = await Chat.countDocuments(filter)

    res.status(200).json({
      data: chatrooms,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao listar chatrooms:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const getChatroomById = async (req: Request, res: Response) => {
  const { chatroomId } = req.params
  console.log(chatroomId)

  try {
    const chatroom = await Chat.find({ _id: chatroomId })
    console.log(chatroom)

    res.status(200).json(chatroom)
  } catch (error) {
    console.error("Erro ao buscar chatroom:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const DeleteChatroom = async (req: Request, res: Response) => {
  const { chatroomId } = req.params

  try {
    // 1️⃣ Verificar se o ID é válido (opcional, mas boa prática)
    if (!chatroomId) {
      return res.status(400).json({ message: "ID de chat inválido" })
    }

    // 2️⃣ Verificar se o chat existe
    const chatroom = await Chat.findById(chatroomId)
    if (!chatroom) {
      return res.status(404).json({ message: "Sala não encontrada" })
    }

    // 3️⃣ Excluir a sala
    await Chat.findByIdAndDelete(chatroomId)

    // 4️⃣ Retornar sucesso
    return res.status(200).json({
      message: "Sala excluída com sucesso",
      deletedChatroomId: chatroomId,
    })
  } catch (error) {
    console.error("Erro ao excluir sala:", error)
    return res.status(500).json({ message: "Erro interno do servidor" })
  }
}
