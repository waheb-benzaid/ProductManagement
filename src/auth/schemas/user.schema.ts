import { Schema, Document, model } from 'mongoose';

export interface User extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  refreshToken: string;
}

export const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['Admin', 'Manager', 'Client'],
    default: 'Client',
  },
  refreshToken: { type: String },
});

export const UserModel = model<User>('User', UserSchema);
