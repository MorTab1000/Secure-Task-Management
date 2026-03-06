import Note from '../models/noteModel';

export const getNotes = async (page: number, perPage: number) => {
  const totalCount = await Note.countDocuments();
  const notes = await Note.find()
    .sort({ _id: -1 })
    .skip((page - 1) * perPage)
    .limit(perPage);
  return { notes, totalCount };
};

export const getNoteById = async (id: string) => {
  const note = await Note.findById(id);
  if (!note) {
    throw new Error('Note not found');
  }
  return note;
};

export const createNote = async (noteData: any) => {
  const note = new Note(noteData);
  await note.save();
  return note;
}

export const updateNoteById = async (id: string, noteData: any) => {
  //update the note by id
  const updated = await Note.findByIdAndUpdate(id, noteData, { new: true });
  if (!updated) {
    throw new Error('Note not found');

  }
  return updated;
}

export const deleteNoteById = async (id: string) => {
  const deleted = await Note.findByIdAndDelete(id);
  if (!deleted) {
    throw new Error('Note not found');
  }
  return deleted;
};

export const getNoteByIndex = async (index: number) => {
  const note = await Note.findOne().skip(index);
  if (!note) {
    throw new Error('Note not found');
  }
  return note;
};

export const updateNoteByIndex = async (index: number, noteData: any) => {
  const note = await Note.findOne().skip(index);
  if (!note) {
    throw new Error('Note not found');
  }
  const updated = await Note.findByIdAndUpdate(note._id, noteData, { new: true });
  if (!updated) {
    throw new Error('Note not found');
  }
  return updated;
};

export const deleteNoteByIndex = async (index: number) => {
  const note = await Note.findOne().skip(index);
  if (!note) {
    throw new Error('Note not found');
  }
  const deleted = await Note.findByIdAndDelete(note._id);
  if (!deleted) {
    throw new Error('Note not found');
  }
  return deleted;
};