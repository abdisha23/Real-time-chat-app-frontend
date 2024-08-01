import logo from './logo.svg';
import './App.css';
import {useContext} from 'react';
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import "bootstrap/dist/css/bootstrap.min.css";
import {Container} from  "react-bootstrap"
import NavBar from "./components/NavBar";
import {AuthContext} from "./context/AuthContext";
import { ChatContextProvider } from './context/ChatContext';
function App() {
  const {user} =  useContext(AuthContext);

  return (
    <>
    <BrowserRouter>
      <ChatContextProvider user = {user && user}>
        <NavBar />
        <Container className="text-secondary">
            <Routes>
              <Route path="/" element={user ? <Chat /> : <Login />}/>
              <Route path="/register" element={user ? <Chat/> : <Register />}/>
              <Route path="/login" element={user ? <Chat /> : <Login/>}/>
              <Route path="*" element={<NotFound />}/>
            </Routes>
        </Container>
      </ChatContextProvider>
    </BrowserRouter>
    </>
  );
}

export default App;
