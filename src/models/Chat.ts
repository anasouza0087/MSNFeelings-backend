import { Schema, model, Document, Types } from "mongoose"

export interface IChat extends Document {
  user: {
    id: Types.ObjectId
    name: string
    avatar?: string 
  }
  message?: string
}

const ChatSchema = new Schema<IChat>({
  user: {
    id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    avatar: { type: String, required: false },
  },
  message: { type: String, required: false },
})

export const Chat = model<IChat>("Chat", ChatSchema)
