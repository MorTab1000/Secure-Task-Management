import { NotesProvider } from './contexts/NoteContext';
import { AuthProvider } from './contexts/AuthContext';
import NoteList from './components/NotesList';
import {
  BrowserRouter as Router,
  Route, Routes,
} from "react-router-dom";
import Login from './pages/LoginPage';
import CreateUser from './pages/CreateUser';


function App() {
  return (
    <AuthProvider>
      <NotesProvider>
        <Router>
          <Routes>
          <Route path='/' element={<NoteList/>}/>
          <Route path='/login' element={<Login/>} />
          <Route path='create-user' element={<CreateUser/>}/>

      </Routes>
        </Router>

      </NotesProvider>
    </AuthProvider>
  );
}

export default App;
