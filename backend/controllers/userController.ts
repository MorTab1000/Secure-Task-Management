import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/userModel';
import jwt from 'jsonwebtoken';
import { signUp, signin } from '../services/userService';

export const createNewUser = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const { username, name, password, email } = request.body;

    const savedUser = await signUp(username, name, password, email);
    if (!savedUser) {
      response.status(400).json({ error: 'User creation failed' });
    }
    response.status(201).json({
      message: 'User created successfully',
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    response
      .status(500)
      .json({ error: error.message || 'Internal server error' });
  }
};

export const login = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const { username, password } = request.body;
    const userData = await signin(username, password);
    response.status(200).json({
      token: userData.token,
      id: userData._id,
    });
  } catch (error) {
    console.error('Error during login:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
};
