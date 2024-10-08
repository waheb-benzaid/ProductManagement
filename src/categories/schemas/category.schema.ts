import { Schema, Document } from 'mongoose';

export interface Category extends Document {
  name: string;
  description: string;
}

export const CategorySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
});
