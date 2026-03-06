import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { apiRequest } from '../utils'

const POSTS_PER_PAGE = 10;



export type Note = {
  _id: number;
  title: string;
  author: {
    name: string;
    email: string;
  };
  content: string;
  user: number;
  isRichText: boolean;
};

type State = {
  notes: Note[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  editNoteId: string;
  notification: string;
  notesCache: { page: number; notes: Note[], fetched: boolean }[];
  sanitizer: boolean; // Optional property for sanitization
};

type Action =
  | { type: 'noteAdded'; _id: number; content: string, author: { name: string; email: string }, title: string, user: number, isRichText: boolean }
  | { type: 'noteUpdated'; note: Note }
  | { type: 'noteDeleted'; id: number }
  | { type: 'setPage'; page: number }
  | { type: 'setNotes'; notes: Note[]; totalCount: number }
  | { type: 'setEditing'; editNoteId: string }
  | { type : 'addNoteToCache'; page: number; notes: Note[] }
  | { type: 'updateCachePages'; pages: number[] }
  | { type: 'setSanitizer'; } // Action to set the sanitizer state
  | { type: 'noteOperation failed' }
  | { type: 'setCache'; notesCache: { page: number; notes: Note[], fetched: boolean }[] }
  | { type: 'updateTotalCount'; totalCount: number };

  
  

const initialState: State = {
  notes: [],
  currentPage: 1,
  pageSize: POSTS_PER_PAGE,
  totalCount: 0,
  editNoteId: "",
  notification: "Notification area",
  //chached notes
  notesCache: [{page: 1, notes: [], fetched: false}, {page: 2, notes: [], fetched: false}, {page: 3, notes: [], fetched: false}, {page: 4, notes: [], fetched: false}, {page: 5, notes: [], fetched: false}],
  sanitizer: true, // Initialize the sanitizer property
};




function notesReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'noteAdded':
      return {
        ...state,
        notification: "Note added",
        notes: [{ _id: action._id, content: action.content, author: action.author, title: action.title, user: action.user, isRichText: action.isRichText
         }, ...state.notes].slice(0, 10),
         totalCount: state.totalCount + 1
          

      };
    case 'noteUpdated':
      return {
        ...state,
        notification: "Note updated",
        notes: state.notes.map(note =>
          note._id === action.note._id ? action.note : note
        ),
        editNoteId: ""
        ,
      };
    case 'noteDeleted':
      return {
        ...state,
        notification: "Note deleted",
        notes: state.notes.filter(note => note._id !== action.id),
        totalCount: state.totalCount - 1
      };
    case 'setPage':
      return {
        ...state,
        currentPage: action.page,
        editNoteId: "",
      };
    case 'setNotes':
      return {
        ...state,
        notes: action.notes,
        totalCount: action.totalCount,
      };
    case 'setEditing':
      return {
        ...state,
        editNoteId: action.editNoteId,
      };
    case 'addNoteToCache':
      return {
        ...state,
        notesCache: state.notesCache.map(cache => 
          cache.page === action.page ? { ...cache, notes: action.notes, fetched: true } : cache
        ),  
      }
    case 'updateCachePages':
      const missingPages = action.pages.filter(page => !state.notesCache.some(cache => cache.page === page));
      let newCache = state.notesCache.filter(cache => action.pages.includes(cache.page));
      newCache = newCache.concat(
        missingPages.map(page => ({ page, notes: [], fetched: false }))
      );
      //sort the cache by page number
      newCache.sort((a, b) => a.page - b.page);
      return {...state, notesCache: newCache};
      
    case 'setSanitizer':
      return {
        ...state,
        sanitizer: ! state.sanitizer
      };
    case 'noteOperation failed':
      return {
        ...state,
        notification: "",
      };
    case 'setCache': 
      return {
        ...state,
        notesCache: action.notesCache
      };
      case 'updateTotalCount':
      return {
        ...state,
        totalCount: action.totalCount
      };
      default:
      return state;
  }
}

const NotesContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(notesReducer, initialState);
  useEffect(() => {

    state.notesCache.forEach((cache) => {
      if (!cache.fetched) {
    apiRequest('get', 'notes', {}, {
      _page: cache.page,
      _per_page: POSTS_PER_PAGE
    })
      .then((response) => {
        if (response.data.length > 0 && cache.page === state.currentPage) {
          dispatch({ type: 'setNotes', notes: response.data, totalCount: parseInt(response.headers['x-total-count'] || '0', 10) });
        }
        dispatch({ type: 'addNoteToCache', page: cache.page, notes: response.data });
        
      })
      .catch(error => {
        console.error('Failed to fetch notes:', error);
      });
    }
    else {
      if (cache.page === state.currentPage) {
        dispatch({ type: 'setNotes', notes: cache.notes, totalCount: state.totalCount });
      }
    }
    });
  }, [state.currentPage]);

  return (
    <NotesContext.Provider value={{ state, dispatch }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
