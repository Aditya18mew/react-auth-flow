
import './index.css'
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom';
import {Signup} from "./component/signup"
import {Forgetpassword} from "./component/forget password"
import {Resetpassword} from "./component/resetpassword"
import {Dashboard} from "./component/dashboard"
import {Signin} from "./component/signin"
import { Logoutbutton } from './component/buttons';





function App() {
 
 return (
   <Router>
    <Routes>
     <Route path='/' element={<div className='cotainer'><Dashboard></Dashboard></div>}></Route>
    <Route path='/sign-in' element={<div className='cotainer'><Signin/></div>}></Route>
    <Route path='/sign-up' element={ <div className='cotainer'><Signup/></div>}></Route>
    <Route path='/forget-password' element={ <div className='cotainer'><Forgetpassword></Forgetpassword></div>}></Route>
    <Route path='/resetpassword' element={<div className='cotainer'><Resetpassword></Resetpassword></div>}></Route>
    <Route path='/home' element={<div className='cotainer'><Logoutbutton></Logoutbutton></div>} ></Route>
    </Routes>
   </Router>
  );


}
export default App
