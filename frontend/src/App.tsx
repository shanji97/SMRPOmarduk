import React, { Fragment, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import AddSubtask from "./pages/AddSubtask";
import Home from "./pages/Home";
import AddUser from "./pages/AddUser";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import AddStory from "./pages/AddStory";
import Users from "./pages/Users";
import Dashboard from "./pages/Dashboard";
import Header from "./components/Header";
import AddProject from "./pages/AddProject";
import AddSprint from "./pages/AddSprint";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import Sprints from "./pages/Sprints";

import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  return (
    <Fragment>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/add-user"
            element={
              <AddUser
                isEdit={false}
                usernameInit=""
                passwordInit=""
                confirmPasswordInit=""
                firstNameInit=""
                lastNameInit=""
                emailInit=""
                isAdminInit={false}
                handleClose={() => {}}
              />
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/add-subtask" element={<AddSubtask />} />
          <Route path="/users" element={<Users />} />
          <Route path="/add-project" element={<AddProject />} />
          <Route path="/:projectID/add-sprint" element={<AddSprint
            isEdit={false}
            sprintId=''
            nameInit=''
            velocityInit={0}
            dateRangeInit={{
              startDate: new Date(),
              endDate: new Date(),
              key: 'selection'
            }}
          />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectID/sprints" element={<Sprints />} />
          <Route path="/:projectID/add-story" element={<AddStory />} />

        </Routes>
      </Router>
      <ToastContainer position="top-center" autoClose={1000} />
    </Fragment>
  );
}

export default App;
