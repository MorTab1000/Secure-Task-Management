import User from '../models/userModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

export const signUp = async (
  username: string,
  name: string,
  password: string,
  email: string,
) => {
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Find identical username
  const existingUser = await User.find({ username });
  if (existingUser.length > 0) {
    throw new Error('Username already exists');
  }

  const user = new User({
    username,
    name,
    passwordHash,
    email,
  });

  // Save the user to database
  const savedUser = await user.save();
  return savedUser;
};

export const signin = async (username: string, password: string) => {
  const user = await User.findOne({ username });
  console.log('User found:', user);

  const passwordCorrect =
    user === null || !user.passwordHash
      ? false
      : await bcrypt.compare(password, user.passwordHash as string);

  if (!(user && passwordCorrect)) {
    console.log('Invalid username or password');
    throw new Error('invalid username or password');
  }
  const userForToken = {
    username: user.username,
    id: user._id,
  };

  if (!process.env.SECRET) {
    throw new Error('SECRET environment variable is not set');
  }

  const token = jwt.sign(userForToken, process.env.SECRET);
  return { _id: user._id, token };
};
