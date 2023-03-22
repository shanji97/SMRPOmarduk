import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import {
  HouseDoorFill,
  PersonCircle,
  Bell,
  QuestionCircle,
  Calendar,
  Journals,
} from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.css";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../features/users/userSlice";
import { Fragment, useEffect, useState } from "react";
import { parseJwt } from "../helpers/helpers";
import { useNavigate } from "react-router-dom";

function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.users);
  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user === null) {
      return;
    }
    const token = JSON.parse(localStorage.getItem("user")!).token;
    const userData = parseJwt(token);
    setIsAdmin(userData.isAdmin);
    setUserName(userData.sub);
  }, [user]);

  const handleLoginAndLogout = () => {
    if (user !== null) {
      dispatch(logout());
      window.location.replace("/login");
    }
  };

  const redirectToUsers = () => {
    navigate("/users");
  };

  const redirectToNewSprint = () => {
    navigate("/add-sprint");
  };

  const redirectToNewProject = () => {
    navigate("/add-project");
  };

  const redirectToAddUser = () => {
    navigate("/add-user");
  };

  const redirectToChangePassword = () => {
    navigate("/change-password");
  };

  return (
    <Navbar collapseOnSelect expand="lg" bg="light" variant="light">
      <Container>
        <Navbar.Brand href="/" className="hstack">
          <HouseDoorFill className="me-2"></HouseDoorFill> Dashboard
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto">
            <NavDropdown
              id="projects-dropdown"
              title={
                <span>
                  <Journals className="mb-1"></Journals> Projects
                </span>
              }
            >
              <NavDropdown.Item onClick={redirectToNewProject}>
                + Add project
              </NavDropdown.Item>
            </NavDropdown>
            <NavDropdown
              id="sprint-dropdown"
              title={
                <span>
                  <Calendar className="mb-1"></Calendar> Sprints
                </span>
              }
            >
              <NavDropdown.Item onClick={redirectToNewSprint}>
                + Add sprint
              </NavDropdown.Item>
              <NavDropdown.Item>Sprint 1</NavDropdown.Item>
              <NavDropdown.Item>Sprint 2</NavDropdown.Item>
            </NavDropdown>

            <NavDropdown
              title={
                user !== null ? (
                  <span>
                    <PersonCircle className="mb-1"></PersonCircle> {userName}
                  </span>
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
