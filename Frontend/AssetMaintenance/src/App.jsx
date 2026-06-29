import { Toaster } from 'react-hot-toast'
import LoginPage from "./pages/LoginPage.jsx";
import './App.css'

function App() {
  return (
    <>
      <LoginPage/>
      <Toaster position="top-center" />
    </>
  )
}

export default App
