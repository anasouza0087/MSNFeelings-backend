import { Request, Response } from "express";
import mongoose from "mongoose";
import { Chat } from "../models/Chat";
import { ObjectId } from "mongodb";
import { UserChatroomStatus } from "../models/_DEPRECATED_UserChatroomStatus";

export const getChatroomsWithPreviews = async (req: Request, res: Response) => {
  try {
    const userId = new ObjectId(req.user._id);

    const chatrooms = await Chat.aggregate([
      {
        $lookup: {
          from: "messages",
          let: { chatroomId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$chatroomId", "$$chatroomId"] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
          ],
          as: "lastMessage",
        },
      },
      {
        $lookup: {
          from: "userchatroomstatuses",
          let: { chatroomId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$chatroomId", "$$chatroomId"] },
                    { $eq: ["$userId", userId] },
                  ],
                },
              },
            },
          ],
          as: "status",
        },
      },
      {
        $addFields: {
          lastMessage: { $arrayElemAt: ["$lastMessage", 0] },
          lastReadAt: {
            $ifNull: [{ $arrayElemAt: ["$status.lastReadAt", 0] }, new Date(0)],
          },
        },
      },
      {
        $lookup: {
          from: "messages",
          let: { chatroomId: "$_id", lastReadAt: "$lastReadAt" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$chatroomId", "$$chatroomId"] },
                    { $gt: ["$createdAt", "$$lastReadAt"] },
                    { $ne: ["$sender", userId] },
                  ],
                },
              },
            },
            { $count: "unreadCount" },
          ],
          as: "unread",
        },
      },
      {
        $addFields: {
          unreadCount: {
            $ifNull: [{ $arrayElemAt: ["$unread.unreadCount", 0] }, 0],
          },
        },
      },
      {
        $project: {
          name: 1,
          avatar: 1,
          lastMessage: {
            content: "$lastMessage.content",
            createdAt: "$lastMessage.createdAt",
          },
          unreadCount: 1,
        },
      },
    ]);

    return res.status(200).json(chatrooms);
  } catch (error) {
    console.error("Erro ao buscar chatrooms com preview:", error);
    return res.status(500).json({ message: "Erro ao buscar chatrooms" });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  console.log(req.params.id)
  console.log(req.user.id)
  try {
    const chatroomId = new ObjectId(req.params.id);
    const userId = new ObjectId(req.user.id);

    await UserChatroomStatus.findOneAndUpdate(
      { chatroomId, userId },
      { $set: { lastReadAt: new Date() } },
      { upsert: true, new: true }
    );

    return res.status(200).json({ message: "Leitura marcada com sucesso" });
  } catch (error) {
    console.error("Erro ao marcar mensagens como lidas:", error);
    return res
      .status(500)
      .json({ message: "Erro ao marcar mensagens como lidas" });
  }
};
