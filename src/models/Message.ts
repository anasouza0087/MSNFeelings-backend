import { Schema, model, Document, Types } from "mongoose"

export interface IMessage extends Document {
  chatroomId: Types.ObjectId
  sender: Types.ObjectId
  content: string
  createdAt: Date
  direction: string
  readBy: Types.ObjectId
}

const MessageSchema = new Schema<IMessage>(
  {
    chatroomId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    direction: { type: String, required: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export const Message = model<IMessage>("Message", MessageSchema)
