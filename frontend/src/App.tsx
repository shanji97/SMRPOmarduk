import React, { Fragment, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import AddSubtask from "./pages/AddSubtask";
import AddUser from "./pages/AddUser";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import AddStory from "./pages/AddStory";
import Users from "./pages/Users";
import Header from "./components/Header";
import AddProject from "./pages/AddProject";
import AddSprint from "./pages/AddSprint";
import Profile from "./pages/Profile";
import ProjectWall from "./pages/ProjectWall";
import Projects from "./pages/Projects";
import Sprints from "./pages/Sprints";

import ProductBacklog from "./pages/ProductBacklog";
import SprintBacklog from "./pages/SprintBacklog";
import MyTasks from "./pages/MyTasks";

import TaskForm from "./components/TaskForm"; // temporary

import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import EditTaskForm from "./components/EditTaskForm";
import AssignUserForm from "./components/AssignUserForm";
import DeleteTaskModal from "./components/DeleteTaskModal";

function App() {
  return (
    <Fragment>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<ProductBacklog />} />
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
          <Route
            path="/:projectID/add-sprint"
            element={
              <AddSprint
                isEdit={false}
                sprintId=""
                nameInit=""
                velocityInit={0}
                dateRangeInit={{
                  startDate: new Date(),
                  endDate: new Date(),
                  key: "selection",
                }}
              />
            }
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectID/sprints" element={<Sprints />} />
          <Route path="/:projectID/add-story" element={<AddStory />} />
          <Route path='/product-backlog' element={<ProductBacklog />} />
          <Route path='/sprint-backlog' element={<SprintBacklog />} />
          <Route path='/my-tasks' element={<MyTasks />} />
          <Route path='/projects/:projectID/wall' element={<ProjectWall />} />
          <Route path="/product-backlog" element={<ProductBacklog />} />
          <Route path="/sprint-backlog" element={<SprintBacklog />} />
          <Route path="/my-tasks" element={<MyTasks />} />

          {
            // this is for testing
          }

          <Route
            path="/add-task/:storyID/"
            element={
              <TaskForm
                storyId={1}
                descriptionInit=""
                timeRequiredInit=""
                assignedUserIdInit=""
                closeModal={() => {}}
                showModal={true}
              />
            }
          />
          <Route
            path="/edit-task/"
            element={
              <EditTaskForm
                id={"1"}
                descriptionInit="Prepare UI"
                timeRequiredInit="1"
              />
            }
          />
          <Route
            path="/assign-user/"
            element={<AssignUserForm id={"2"} assignedUserIdInit="" />}
          />
          <Route path="/delete-task/" element={<DeleteTaskModal id={"13"} />} />
        </Routes>
      </Router>
      <ToastContainer position="top-center" autoClose={1000} />
    </Fragment>
  );
}

export default App;
