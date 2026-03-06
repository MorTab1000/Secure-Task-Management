import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: { type: String },
  author: {
    type: {
      name: String,
      email: String,
    },
    required: true,
  },
  content: { type: String, required: true },
  isRichText: { type: Boolean, default: false },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const Note = mongoose.model('Note', noteSchema);

export default Note;
