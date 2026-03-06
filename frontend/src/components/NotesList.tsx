import { useState } from "react";
import Pagination from "./pagination";
import AddNewNote from "./AddNewNote";
import { useNotes } from "../contexts/NoteContext";
import {  useAuth } from "../contexts/AuthContext";
import Note from "./Note";
import { Link } from "react-router-dom";


export default function NotesList() {

  const { state, dispatch } = useNotes();
  const { user, logout } = useAuth();
  const { notes, notification } = state;
  const [showAddNewNote, setShowAddNewNote] = useState(false);
  return <>
    {
      !user ? <>
     <Link to="/login"><button name="GoToLogin" onClick={() => {
      dispatch({type: "setPage", page: 1});
      dispatch({type: "updateCachePages", pages: [1, 2, 3, 4, 5]});
    }} data-testid="go_to_login_button">Go to Login</button></Link>
     <Link to="/create-user"><button onClick={() => dispatch({type: "setPage", page: 1})} data-testid="go_to_create_user_button">Create New User</button></Link>
      </> : <button onClick = {logout} data-testid="logout">Log out</button>
    }
    <div>
      <label htmlFor="sanitizer">Use Sanitizer</label>
      <input type="checkbox" data-testid="sanitizer_checkbox" checked={state.sanitizer} onChange={() => {dispatch({"type" : "setSanitizer"})}}/>
    </div>
    <div className="notification">{notification}</div>
    { user && <button name="add_new_note" onClick={() => setShowAddNewNote(true)}>Add new note</button>}
    {showAddNewNote && <AddNewNote setShowAddNewNote={setShowAddNewNote} />}
    <br />
    {
      notes.map((note, index) => <Note key={index} {...note}></Note>)
    }
    <Pagination />
  </>
}