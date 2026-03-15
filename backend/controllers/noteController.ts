import { Request, Response } from 'express';
import * as noteService from '../services/noteService';
import { NOTES_PER_PAGE } from '../config/const';

export const getAllNotes = async (req: Request, res: Response) => {
  try {
    const { _page = 1, _per_page = NOTES_PER_PAGE } = req.query;
    const page = Number(_page);
    const perPage = Number(_per_page);

    const { notes, totalCount } = await noteService.getNotes(page, perPage);
    res.setHeader('X-Total-Count', totalCount);
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getNoteById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!id) {
      res.status(400).json({ message: 'Note ID is required' });
    }
    const note = await noteService.getNoteById(id);
    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const createNote = async (req: Request, res: Response) => {
  try {
    if (!req.body || !req.body.title || !req.body.content) {
      res.status(400).json({ message: 'Title, author, and content are required' });
      return;
    }
    const note = await noteService.createNote({...req.body, 'user': req.user._id, 'author': {'name': req.user.name, 'email': req.user.email}, 'isRichText': req.body.richText || false});
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' + err });
  }
};

export const updateNoteById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!id) {
      res.status(400).json({ message: 'Note ID is required' });
    }
    const note = await noteService.updateNoteById(id, req.body);
    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deleteNoteById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!id) {
      res.status(400).json({ message: 'Note ID is required' });
    }
    await noteService.deleteNoteById(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export const getNoteByIndex = async (req: Request, res: Response) => {
  try {
    const i = req.params.i as string;
    if (!i || isNaN(parseInt(i))) {
      res.status(400).json({ message: 'Invalid index parameter' });
    }
    const note = await noteService.getNoteByIndex(parseInt(i));
    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateNoteByIndex = async (req: Request, res: Response) => {
  try {

    const i = req.params.i as string;
    if (!i || isNaN(parseInt(i))) {
      res.status(400).json({ message: 'Invalid index parameter' });
    }
    const note = await noteService.updateNoteByIndex(parseInt(i), req.body);
    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error: ' + err });
  }
};

export const deleteNoteByIndex = async (req: Request, res: Response) => {
  try {
    const i = req.params.i as string;
    if (!i || isNaN(parseInt(i))) {
      res.status(400).json({ message: 'Invalid index parameter' });
    }
    await noteService.deleteNoteByIndex(parseInt(i));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};