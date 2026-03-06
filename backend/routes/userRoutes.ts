import express from 'express';
import {
  createNewUser,
  login
} from '../controllers/userController';

const router = express.Router();

router.post('/users', createNewUser);
router.post('/login', login);

export default router;
