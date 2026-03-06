// models/userModel.ts
import { Schema, model, Document } from 'mongoose';

interface IUser extends Document {
  name?: string;
  email?: string;
  username?: string;
  passwordHash?: string;
}

const userSchema = new Schema<IUser>(
  {
    name: String,
    email: String,
    username: { type: String, required: true, unique: true },
    passwordHash: String,
  },
  {

    versionKey: false,
    toJSON: {
      transform(_doc: unknown, ret: Record<string, any>) {
        ret.id = ret._id?.toString();
        delete ret._id;      
        return ret;
      },
    },
  }
);

export default model<IUser>('User', userSchema);
