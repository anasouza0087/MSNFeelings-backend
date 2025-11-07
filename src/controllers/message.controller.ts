import { Request, Response } from "express"
import { Message } from "../models/Message"

// export const createMessage = async (req: Request, res: Response) => {
//   const { chatroomId, sender, content, direction } = req.body;

//   if (!chatroomId || !sender || !content || !direction) {
//     return res.status(400).json({ message: "All fields are required!" });
//   }

//   try {
//     const newMessage = await Message.create({ chatroomId, sender, content, direction });
//     res.status(201).json(newMessage);
//   } catch (error) {
//     console.error("Erro ao criar mensagem:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

export const createMessage = async (req: Request, res: Response) => {
  const { chatroomId, sender, content, direction } = req.body

  if (!chatroomId || !sender || !content || !direction) {
    return res.status(400).json({ message: "All fields are required!" })
  }

  try {
    const newMessage = await Message.create({
      chatroomId,
      sender,
      content,
      direction,
      readBy: [sender], // ✅ o remetente já leu
    })

    res.status(201).json(newMessage)
  } catch (error) {
    console.error("Erro ao criar mensagem:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const listMessagesByChatroom = async (req: Request, res: Response) => {
  const { chatroomId } = req.params

  try {
    const messages = await Message.find({ chatroomId })
      // .sort({ createdAt: -1 })
      .limit(50) // limite inicial (ideal para scroll infinito)

    res.status(200).json(messages)
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const markMessagesAsRead = async (req: Request, res: Response) => {
  const { chatroomId } = req.params
  const { userId } = req.body // quem está lendo

  if (!userId) {
    return res.status(400).json({ message: "userId é obrigatório" })
  }

  try {
    await Message.updateMany(
      { chatroomId, readBy: { $ne: userId } }, // mensagens que ainda não foram lidas por ele
      { $push: { readBy: userId } } // marca como lidas
    )

    res.status(200).json({ message: "Mensagens marcadas como lidas" })
  } catch (error) {
    console.error("Erro ao marcar mensagens como lidas:", error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}
