import { NotesProvider } from './contexts/NoteContext';
import { AuthProvider } from './contexts/AuthContext';
import {
  BrowserRouter as Router,
  Route, Routes,
} from "react-router-dom";
import Login from './pages/LoginPage';
import CreateUser from './pages/CreateUser';
import HomePage from './pages/HomePage';


function App() {
  return (
    <AuthProvider>
      <NotesProvider>
        <Router>
          <Routes>
          <Route path='/' element={<HomePage/>}/>
          <Route path='/login' element={<Login/>} />
          <Route path='create-user' element={<CreateUser/>}/>

      </Routes>
        </Router>

      </NotesProvider>
    </AuthProvider>
  );
}

export default App;
