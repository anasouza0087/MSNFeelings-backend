import { Schema, model, Document } from "mongoose";
const bcrypt = require("bcrypt");

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  nickname: string | number;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: Schema.Types.Mixed, required: false },
});

// Hash a senha antes de salvar
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar senha
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser>("User", UserSchema);
