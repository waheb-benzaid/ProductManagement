import { Schema, Document, model } from 'mongoose';
import { Role } from 'src/auth/enums/roles.enum';

export interface User extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  refreshToken: string;
}

export const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: Object.values(Role),
    default: Role.Client,
  },
  refreshToken: { type: String },
});

export const UserModel = model<User>('User', UserSchema);
