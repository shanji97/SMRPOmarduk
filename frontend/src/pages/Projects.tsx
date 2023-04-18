import {
  DropdownButton,
  Table,
  Dropdown,
  Modal,
  Form,
  Button,
} from "react-bootstrap";
import { Check, PencilFill, TrashFill, X } from "react-bootstrap-icons";
import Card from "../components/Card";
import React, { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddUser from "./AddUser";

import classes from "./Users.module.css";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { deleteUser, getAllUsers } from "../features/users/userSlice";
import { parseJwt } from "../helpers/helpers";
import { toast } from "react-toastify";
import { editProject, getAllProjects } from "../features/projects/projectSlice";
import ProjectForm from "../components/ProjectForm";
import { ProjectData, ProjectDataEdit, UserRole } from "../classes/projectData";
import ProjectDataForm from "../components/ProjectDataForm";
import ProjectRolesForm from "../components/ProjectRolesForm";

const Projects = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const projectState = useAppSelector((state) => state.projects);
  const { users } = useAppSelector((state) => state.users);

  let { projects } = useAppSelector((state) => state.projects);
  // console.log(projects);

  // store isAdmin in state for now
  // TODO rewrite this later
  const [isAdmin, setIsAdmin] = useState(false);

  const [editIndexProject, setEditIndexProject] = useState(-1);
  const [editIndexRoles, setEditIndexRoles] = useState(-1);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showEditRolesModal, setShowEditRolesModal] = useState(false);

  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (localStorage.getItem("user") == null) {
      navigate("/login");
      return;
    }

    const token = JSON.parse(localStorage.getItem("user")!).token;
    setIsAdmin(parseJwt(token).isAdmin);
    // console.log(isAdmin);

    const id = parseJwt(token).sid;
    setUserId(id);

    dispatch(getAllProjects());
  }, [isAdmin]);

  const redirectToAddStory = (projectID: any) => {
    navigate(`/${projectID}/add-story`);
  };

  useEffect(() => {
    dispatch(getAllUsers());
  }, []);

  const openEditProjectModal = (index: number) => {
    setEditIndexProject(index);
    setShowEditProjectModal(true);
  };

  const openEditRolesModal = (index: number) => {
    setEditIndexRoles(index);
    setShowEditRolesModal(true);
  };

  const hideEditProjectModal = () => {
    setShowEditProjectModal(false);
  };

  const hideEditRolesModal = () => {
    setShowEditRolesModal(false);
  };

  const submitAddProject = () => {};

  const isUserScrumMaster = (userRoles: UserRole[]) => {
    let scrumMasterId = userRoles.filter((user) => user.role === 1)[0].userId;
    return parseInt(userId) === scrumMasterId;
  };

  const isUserProductOwner = (userRoles: UserRole[]) => {
    let productOwnerId = userRoles.filter((user) => user.role === 2)[0].userId;
    return parseInt(userId) === productOwnerId;
  };

  return (
    <Fragment>
      <Card style={{ width: "70%", marginTop: "1rem" }}>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Project name</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => {
              return (
                <tr key={index}>
                  <td>{project.id}</td>
                  <td>
                    <div className={classes.usernameContainer}>
                      {project.projectName}
                      {/* <button onClick={() => redirectToAddStory(project.id)}>
                        {" "}
                        Add story
                      </button> */}
                      <Button
                        variant="primary"
                        type="button"
                        onClick={() => redirectToAddStory(project.id)}
                      >
                        Add story
                      </Button>
                      {(isAdmin || isUserScrumMaster(project.userRoles)) && (
                        <Button
                          variant="primary"
                          type="button"
                          onClick={() => openEditProjectModal(index)}
                        >
                          Edit project
                        </Button>
                      )}
                      <Button
                        variant="primary"
                        type="button"
                        onClick={() => openEditRolesModal(index)}
                      >
                        Edit roles
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
      {showEditProjectModal && (
        <Modal show={showEditProjectModal} onHide={hideEditProjectModal}>
          <Modal.Body>
            <ProjectDataForm
              idInit={projects[editIndexProject].id}
              projectNameInit={projects[editIndexProject].projectName}
              projectDescriptionInit={
                projects[editIndexProject].projectDescription
              }
              projectState={projectState}
              handleSubmitForm={submitAddProject}
            />
          </Modal.Body>
        </Modal>
      )}
      {showEditRolesModal && (
        <Modal show={showEditRolesModal} onHide={hideEditRolesModal}>
          <Modal.Body>
            <ProjectRolesForm
              idInit={projects[editIndexRoles].id}
              projectState={projectState}
              handleSubmitForm={submitAddProject}
              users={users}
              userRoles={projects[editIndexRoles].userRoles}
            />
          </Modal.Body>
        </Modal>
      )}
    </Fragment>
  );
};

export default Projects;
