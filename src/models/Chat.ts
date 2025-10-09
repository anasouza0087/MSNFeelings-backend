import { Schema, model, Document } from "mongoose";

export interface IChat extends Document {
  name: string;
  avatar?: string;
}

const ChatSchema = new Schema<IChat>({
  name: { type: String, required: true },
  avatar: { type: String, required: false },
});

export const Chat = model<IChat>("Chat", ChatSchema);
