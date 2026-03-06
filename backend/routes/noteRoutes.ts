import express from 'express';
import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNoteById,
  deleteNoteById,
  getNoteByIndex,
  updateNoteByIndex,
  deleteNoteByIndex,
} from '../controllers/noteController';
import tokenExtractor from '../middlewares/tokenExtractor';
import userExtractor from '../middlewares/userExtractor';

const router = express.Router();

router.get('/', getAllNotes);
router.get('/:id', getNoteById);
router.post('/', tokenExtractor, userExtractor, createNote);
router.put('/:id', tokenExtractor, userExtractor,updateNoteById);
router.delete('/:id', tokenExtractor, userExtractor,deleteNoteById);
router.get('/by-index/:i', getNoteByIndex);
router.put('/by-index/:i', tokenExtractor, userExtractor,updateNoteByIndex);
router.delete('/by-index/:i', tokenExtractor, userExtractor, deleteNoteByIndex);

export default router;
