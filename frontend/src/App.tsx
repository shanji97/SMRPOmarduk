import React, {Fragment} from 'react';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import './App.css';
import Home from "./pages/Home";
import AddUser from "./pages/AddUser";
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import Users from "./pages/Users";

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Fragment>
      <Router>
          <Routes>
              <Route path='/' element={<Home />}/>
              <Route path='/add-user' element={<AddUser />}/>
              <Route path='/login' element={<Login />} />
              <Route path='/change-password' element={<ChangePassword />} />
              <Route path='/users' element={<Users />} />
          </Routes>
      </Router>
    </Fragment>
  );
}

export default App;
