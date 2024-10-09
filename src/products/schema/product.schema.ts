import { Schema, Document } from 'mongoose';

export interface Product extends Document {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  stock: number;
  isDeleted: boolean;
}

export const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  stock: { type: Number, required: true, min: 0 },
  isDeleted: { type: Boolean, default: false },
});
