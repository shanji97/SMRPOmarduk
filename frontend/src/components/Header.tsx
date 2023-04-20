import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import {
  HouseDoorFill,
  PersonCircle,
  Calendar,
  Journals, Stack,
} from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.css";
import { useAppDispatch, useAppSelector } from "../app/hooks";

import { getLastLogin, logout } from "../features/users/userSlice";
import { Fragment, useEffect, useMemo, useState } from "react";
import { parseDate, parseJwt } from "../helpers/helpers";
import { useNavigate } from "react-router-dom";
import {getAllSprints} from "../features/sprints/sprintSlice";

function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user, lastLogin, userData } = useAppSelector((state) => state.users);
  const { sprints } = useAppSelector((state) => state.sprints);
  const {activeProject} = useAppSelector(state => state.projects);
  
  const [sub, setSub] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastLoginDate, setLastLoginDate] = useState("");

  useEffect(() => {
    if (user === null) {
      return;
    }
    const token = JSON.parse(localStorage.getItem("user")!).token;
    const userData1 = parseJwt(token);
    
    setSub(userData1.sub);
    setIsAdmin(userData1.isAdmin);

    dispatch(getLastLogin(userData1.sid));
    setLastLoginDate(lastLogin);
  }, [user, lastLogin]);

  useEffect(() => {
    if (activeProject.id !== '') {
      dispatch(getAllSprints(activeProject.id!));
    }
  }, [activeProject, dispatch, sprints.length]);

  useEffect(() => {}, [userData]);

  const activeSprint = useMemo(() => {
    return sprints.find(sprint => {
      const startDate = new Date(sprint.startDate);
      const endDate = new Date(sprint.endDate);
      const today = new Date();

      return today >= startDate && today <= endDate;
    });
  }, [sprints]);

  useEffect(() => {}, [sprints]);

  const handleLoginAndLogout = () => {
    if (user !== null) {
      dispatch(logout());
      navigate("/login");
    }
  };

  const redirectHome = () => {
    navigate("/");
  };
  const redirectToUsers = () => {
    navigate("/users");
  };

  const redirectToProjectList = () => {
    navigate("/projects");
  };

  const redirectToNewProject = () => {
    navigate("/add-project");
  };

  const redirectToAddUser = () => {
    navigate("/add-user");
  };

  const redirectToChangePassword = () => {
      navigate('/change-password');
  }
  const redirectToProductBacklog = () => {
      navigate('/product-backlog');
  }
  const redirectToSprintBacklog = () => {
      navigate('/sprint-backlog');
  }
  const redirectToMyTask = () => {
      navigate('/my-tasks');
  }
  const redirectToEditProfile = () => {
    navigate("/profile");
  };

  return (
    <Navbar collapseOnSelect expand="lg" bg="light" variant="light">
      <Container>
        <Navbar.Brand onClick={redirectHome} className="hstack">
          <HouseDoorFill className="me-2"></HouseDoorFill> Dashboard&nbsp;
          {activeProject.id !== '' &&
              (activeSprint ?
                      <Navbar.Text style={{marginRight: '5rem'}}>
                        Active sprint: <b>{activeSprint?.name}</b> {activeSprint?.startDate} - {activeSprint?.endDate}
                      </Navbar.Text> :
                      <Navbar.Text> No active sprint</Navbar.Text>
              )
          }
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto">
            <NavDropdown
                id="backlog-dropdown"
                title={
                  <span>
                                <Stack className="mb-1"></Stack> Backlog
                              </span>
                }
            >
              <NavDropdown.Item onClick={redirectToProductBacklog}>
                ProductBacklog
              </NavDropdown.Item>
              {isAdmin && (<NavDropdown.Item onClick={redirectToSprintBacklog}>
                    SprintBacklog
                  </NavDropdown.Item>
              ) }
            </NavDropdown>

            <NavDropdown
                id="sprint-dropdown"
                title={
                  <span>
                  <Journals className="mb-1"></Journals> Projects
                </span>
                }
            >
              <NavDropdown.Item onClick={redirectToProjectList}>
                Project List
              </NavDropdown.Item>
              {isAdmin && (
                  <NavDropdown.Item onClick={redirectToNewProject}>
                    Add Project
                  </NavDropdown.Item>
              )}
            </NavDropdown>
            <NavDropdown
              id="sprint-dropdown"
              title={
                <span>
                  <Calendar className="mb-1"></Calendar> Sprints
                </span>
              }
            >
              {sprints.length > 0 ?
                (
                  <Fragment>
                    <NavDropdown.Item onClick={() => navigate(`/projects/${activeProject.id}/sprints`)}>Sprint list</NavDropdown.Item>
                    <NavDropdown.Item onClick={() => navigate(`/projects/${activeProject.id}/userStories`)}>User stories</NavDropdown.Item>
                  </Fragment>
                ) :
                <p style={{marginLeft: '1.5rem'}} className='text-secondary'>No active project</p>}
            </NavDropdown>

            <NavDropdown
                title={
                  user !== null ? (
                      <div style={{ display: "inline-flex" }}>
                    <span>
                      <PersonCircle className="mb-1"></PersonCircle>{" "}
                      {sub},{" "}
                    </span>
                        {lastLoginDate ? (
                            <p>Last login: {parseDate(lastLoginDate)}</p>
                        ) : (
                            <p>Last login: First login</p>
                        )}
                      </div>
                  ) : (
                      <span>
                    <PersonCircle className="mb-1"></PersonCircle> Account
                  </span>
                  )
                }
                id="basic-nav-dropdown"
            >
              <NavDropdown.Item onClick={handleLoginAndLogout}>
                {user === null ? "Log in" : "Logout"}
              </NavDropdown.Item>
              <NavDropdown.Item onClick={redirectToChangePassword}>
                Change password
              </NavDropdown.Item>
              <NavDropdown.Item onClick={redirectToEditProfile}>
                Edit profile
              </NavDropdown.Item>
              {isAdmin && (
                  <Fragment>
                    <NavDropdown.Item onClick={redirectToUsers}>
                      Users
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={redirectToAddUser}>
                      + Add user
                    </NavDropdown.Item>
                  </Fragment>
              )}
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
