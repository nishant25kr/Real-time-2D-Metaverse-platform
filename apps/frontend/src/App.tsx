import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { Landing } from './Pages/Landing'
import { Signup } from './Pages/Singup'
import { Arena } from './Pages/Arena'
import { Avatar } from './Pages/Avatar'
import { Dashboard } from './Pages/Dashboard'
import { Login } from './Pages/Login'


function App() {

  return (
    <BrowserRouter>
      <Routes>

        <Route path='/' element={<Landing />} />
        <Route path='/signup' element={<Signup/>} />
        <Route path='/arena/:id' element={<Arena/>} />
        <Route path='/avatar' element={<Avatar/>} />
        <Route path='/dashboard' element={<Dashboard/>} />
        <Route path='/space' element={<Arena/>} />
        <Route path='/login' element={<Login/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
