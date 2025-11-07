import { Request, Response } from "express"
import { Chat } from "../models/Chat"
import { Message } from "../models/Message"

export const createChatroom = async (req: Request, res: Response) => {
  const { participants, message } = req.body

  if (
    !participants ||
    !Array.isArray(participants) ||
    participants.length < 2
  ) {
    return res
      .status(400)
      .json({ message: "São necessários pelo menos dois participantes" })
  }

  try {
    // evita criar duplicado com mesmos participantes
    const existingChat = await Chat.findOne({
      "participants.id": { $all: participants.map((p) => p.id) },
      $expr: { $eq: [{ $size: "$participants" }, participants.length] },
    })

    if (existingChat) {
      return res.status(200).json(existingChat)
    }

    const newChat = await Chat.create({
      participants,
      message,
    })

    res.status(201).json(newChat)
  } catch (error) {
    console.error("Erro ao criar chatroom:", error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

// export const listChatrooms = async (req: Request, res: Response) => {
//   try {
//     const userId = req.query.userId as string
//     const page = parseInt(req.query.page as string) || 1
//     const limit = parseInt(req.query.limit as string) || 10
//     const skip = (page - 1) * limit

//     if (!userId) {
//       return res.status(400).json({ message: "userId é obrigatório" })
//     }

//     // somente os chats onde o usuário participa
//     const filter: any = { "participants.id": userId }

//     // busca paginada
//     const chatrooms = await Chat.find(filter)
//       .select("_id participants message updatedAt")
//       .sort({ updatedAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean()

//     const total = await Chat.countDocuments(filter)

//     res.status(200).json({
//       data: chatrooms,
//       pagination: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     })
//   } catch (error) {
//     console.error("Erro ao listar chatrooms:", error)
//     res.status(500).json({ message: "Erro interno do servidor" })
//   }
// }

export const listChatrooms = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    if (!userId) {
      return res.status(400).json({ message: "userId é obrigatório" })
    }

    const filter = { "participants.id": userId }

    const chatrooms = await Chat.find(filter)
      .select("_id participants message updatedAt")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // ✅ Checa se o usuário tem mensagens não lidas
    const chatroomsWithUnread = await Promise.all(
      chatrooms.map(async (chat) => {
        const unreadExists = await Message.exists({
          chatroomId: chat._id,
          readBy: { $ne: userId },
        })
        return { ...chat, hasUnread: !!unreadExists }
      })
    )

    const total = await Chat.countDocuments(filter)

    res.status(200).json({
      data: chatroomsWithUnread,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao listar chatrooms:", error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export const getChatroomById = async (req: Request, res: Response) => {
  const { chatroomId } = req.params

  try {
    const chatroom = await Chat.findById(chatroomId)
    if (!chatroom) {
      return res.status(404).json({ message: "Chat não encontrado" })
    }
    res.status(200).json(chatroom)
  } catch (error) {
    console.error("Erro ao buscar chatroom:", error)
    res.status(500).json({ message: "Erro interno do servidor" })
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
