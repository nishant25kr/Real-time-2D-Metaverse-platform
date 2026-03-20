import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { Landing } from './Pages/Landing'
import { Signup } from './Pages/Singup'

function App() {

  return (
    <BrowserRouter>
      <Routes>

        <Route path='/' element={<Landing />} />
        <Route path='/signup' element={<Signup/>} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
