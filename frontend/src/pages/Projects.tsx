import { DropdownButton, Table, Dropdown, Modal } from "react-bootstrap";
import Card from "../components/Card";
import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import classes from "./Users.module.css";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { parseJwt } from "../helpers/helpers";
import {
  activateProject,
  getActiveProject,
  getAllProjects,
  reset,
} from "../features/projects/projectSlice";
import { UserRole } from "../classes/projectData";
import ProjectDataForm from "../components/ProjectDataForm";
import ProjectRolesForm from "../components/ProjectRolesForm";
import { toast } from "react-toastify";
import { getAllUsers } from "../features/users/userSlice";

const Projects = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { users, userData } = useAppSelector((state) => state.users);
  // const isAdmin = userData.isAdmin ? userData.isAdmin : false;
  // const userId = userData.id ? userData.id : "";

  let { projects, activeProject, isError, isSuccess } = useAppSelector(
    (state) => state.projects
  );

  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState("");

  const [editIndexProject, setEditIndexProject] = useState(-1);
  const [editIndexRoles, setEditIndexRoles] = useState(-1);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showEditRolesModal, setShowEditRolesModal] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("user") == null) {
      navigate("/login");
      return;
    }
    dispatch(getAllProjects());

    const token = JSON.parse(localStorage.getItem("user")!).token;
    const isAdmin = parseJwt(token).isAdmin;
    setIsAdmin(isAdmin);
    const id = parseJwt(token).sid;
    setUserId(id);
  }, []);

  useEffect(() => {
    dispatch(getActiveProject());
  }, []);

  // when projects are fetched, reset project state
  // so it doesn't interfere with other components
  useEffect(() => {
    dispatch(reset());
  }, [isSuccess, isError]);

  const redirectToAddStory = (projectID: any) => {
    navigate(`/${projectID}/add-story`);
  };

  const redirectToAddSprint = (projectID: any) => {
    navigate(`/${projectID}/add-sprint`);
  };

  const handleActivateProject = (projectId: string) => {
    dispatch(activateProject(projectId));
    toast.info("Project active");
  };

  const redirectToStats = (projectID: any) => {
    navigate(`/${projectID}/stats`);
  };

  const redirectToDocs = (projectID: any) => {
    navigate(`/${projectID}/docs`);
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
                      {project.id === activeProject.id ? (
                        <b>{project.projectName}</b>
                      ) : (
                        project.projectName
                      )}
                      <DropdownButton
                        id="dropdown-basic-button"
                        title="Options"
                      >
                        <Dropdown.Item
                          onClick={() => handleActivateProject(project.id!)}
                        >
                          Make active
                        </Dropdown.Item>
                        {(isAdmin ||
                          isUserScrumMaster(project.userRoles) ||
                          isUserProductOwner(project.userRoles)) && (
                          <Dropdown.Item
                            onClick={() => redirectToAddStory(project.id)}
                          >
                            Add story
                          </Dropdown.Item>
                        )}
                        <Dropdown.Item
                          onClick={() => redirectToAddSprint(project.id)}
                        >
                          Add sprint
                        </Dropdown.Item>
                        {(isAdmin || isUserScrumMaster(project.userRoles)) && (
                          <Dropdown.Item
                            onClick={() => openEditProjectModal(index)}
                          >
                            Edit project data
                          </Dropdown.Item>
                        )}
                        {(isAdmin || isUserScrumMaster(project.userRoles)) && (
                          <Dropdown.Item
                            onClick={() => openEditRolesModal(index)}
                          >
                            Edit project roles
                          </Dropdown.Item>
                        )}
                        <Dropdown.Item
                          onClick={() => redirectToStats(project.id)}
                        >
                          Statistics
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => redirectToDocs(project.id)}
                        >
                          Documentation
                        </Dropdown.Item>
                      </DropdownButton>
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
              closeModal={hideEditProjectModal}
            />
          </Modal.Body>
        </Modal>
      )}
      {showEditRolesModal && (
        <Modal show={showEditRolesModal} onHide={hideEditRolesModal}>
          <Modal.Body>
            <ProjectRolesForm
              idInit={projects[editIndexRoles].id}
              users={users}
              userRoles={projects[editIndexRoles].userRoles}
              isAdmin={isAdmin}
            />
          </Modal.Body>
        </Modal>
      )}
    </Fragment>
  );
};

export default Projects;
