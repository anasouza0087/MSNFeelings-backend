import { Schema, model, Document, Types } from "mongoose";

export interface IUserChatroomStatus extends Document {
  userId: Types.ObjectId;
  chatroomId: Types.ObjectId;
  lastReadAt: Date;
}

const UserChatroomStatusSchema = new Schema<IUserChatroomStatus>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  chatroomId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
  lastReadAt: { type: Date, required: true },
});

export const UserChatroomStatus = model<IUserChatroomStatus>(
  "UserChatroomStatus",
  UserChatroomStatusSchema
);
