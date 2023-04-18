import { Fragment, useEffect, useRef, useState } from "react";
import { Alert, Button, Table } from "react-bootstrap";
import Card from "./Card";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import classes from "./ProjectRolesForm.module.css";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { parseJwt } from "../helpers/helpers";
import { getAllUsers } from "../features/users/userSlice";
import { ProjectData, UserRole } from "../classes/projectData";
import {
  createProject,
  getAllProjects,
} from "../features/projects/projectSlice";
import { UserData } from "../classes/userData";
import { ProjectState } from "../features/projects/projectSlice";
import { toast } from "react-toastify";
import {
  addDeveloper,
  removeDeveloper,
  reset,
  updateProjectRoles,
} from "../features/projects/projectRoleSlice";

interface ProjectProps {
  idInit?: string;
  users: UserData[];
  userRoles: any;
  projectState: ProjectState;
  handleSubmitForm: (projectData: ProjectData) => void;
}

const ProjectRolesForm: React.FC<ProjectProps> = ({
  idInit,
  users,
  userRoles,
  projectState,
  handleSubmitForm,
}) => {
  const dispatch = useAppDispatch();

  // global state for editing project roles
  let { isLoading, isSuccess, isSuccessAdd, isError, message } = useAppSelector(
    (state) => state.projectRoles
  );

  useEffect(() => {
    setDevelopers([]);
    // put current roles (obtained from props) into state
    userRoles.forEach((user: any) => {
      // TODO change ?
      if (user.role === 2) {
        setProductOwnerID(user.userId.toString());
        setInitProductOwnerID(user.userId.toString());
      } else if (user.role === 1) {
        setScrumMasterID(user.userId.toString());
        setInitScrumMasterID(user.userId.toString());
      } else if (user.role === 0) {
        setDevelopers((prevDevelopers) => {
          const newDevelopers = [...prevDevelopers];
          newDevelopers.push(user.userId.toString());
          return newDevelopers;
        });
      }
    });
  }, [userRoles]);

  // alerts for errors/success
  useEffect(() => {
    if ((isSuccess || isSuccessAdd) && !isLoading) {
      toast.success("Changes saved successfully!");

      if (isSuccessAdd) {
        setAddNewDeveloper("");
        setAddNewDeveloperTouched(false);
      }

      dispatch(getAllProjects());
      dispatch(reset()); // resets project role slice
    }
    if (isError && !isLoading) {
      toast.error(message);
      dispatch(getAllProjects());
      dispatch(reset()); // resets project role slice
    }
  }, [isSuccess, isError, isLoading]);

  const [initProductOwnerID, setInitProductOwnerID] = useState("");
  const [initScrumMasterID, setInitScrumMasterID] = useState("");

  const [productOwnerID, setProductOwnerID] = useState("");
  const [scrumMasterID, setScrumMasterID] = useState("");
  const [addNewDeveloper, setAddNewDeveloper] = useState("");

  const [developers, setDevelopers] = useState<string[]>([]);

  const [productOwnerIDTouched, setProductOwnerIDTouched] = useState(false);
  const [scrumMasterIDTouched, setScrumMasterIDTouched] = useState(false);
  const [addNewDeveloperTouched, setAddNewDeveloperTouched] = useState(false);

  const [developersTouched, setDevelopersTouched] = useState([false]);

  const enteredProductOwnerValid = productOwnerID !== initProductOwnerID;
  const enteredScrumMasterValid = scrumMasterID !== initScrumMasterID;
  const enteredAddDeveloperValid = addNewDeveloper.trim() !== "";

  const addNewDeveloperInvalid =
    addNewDeveloperTouched && !enteredAddDeveloperValid;

  const removeDeveloperHandler = (index: any) => {
    // TODO call remove
    let removeDeveloperData = {
      projectId: idInit,
      userId: developers[index],
    };
    dispatch(removeDeveloper(removeDeveloperData));
  };

  const productOwnerChangedHandler = (e: any) => {
    setProductOwnerID(e.target.value);
    if (e.target.value === initProductOwnerID) {
      setProductOwnerIDTouched(false);
    } else {
      setProductOwnerIDTouched(true);
    }
  };

  const scrumMasterChangedHandler = (e: any) => {
    setScrumMasterID(e.target.value);
    if (e.target.value === initScrumMasterID) {
      setScrumMasterIDTouched(false);
    } else {
      setScrumMasterIDTouched(true);
    }
    // TODO
  };

  const addDeveloperChangedHandler = (e: any) => {
    setAddNewDeveloper(e.target.value);
  };

  const addDeveloperBlurHandler = () => {
    setAddNewDeveloperTouched(true);
  };

  const addDeveloperHandler = () => {
    if (addNewDeveloper === "") {
      setAddNewDeveloperTouched(true);
      toast.error("Please select a user to add.");
      return;
    }

    let addDeveloperData = {
      projectId: idInit,
      userId: addNewDeveloper,
    };

    dispatch(addDeveloper(addDeveloperData));
  };

  const saveProductOwnerHandler = () => {
    let projectRoleData = {
      role: 2,
      projectId: idInit,
      userId: productOwnerID,
    };
    dispatch(updateProjectRoles(projectRoleData));
  };

  const saveScrumMasterHandler = () => {
    let projectRoleData = {
      role: 1,
      projectId: idInit,
      userId: scrumMasterID,
    };
    dispatch(updateProjectRoles(projectRoleData));
  };

  const displayUsername = (member: string) => {
    let u = users.filter((user) => {
      return user.id?.toString() === member;
    });
    return u[0].username;
  };

  return (
    <Fragment>
      <h1 className={`${classes.cardHeading} text-primary`}>
        Edit project roles
      </h1>

      <Form>
        <h4 className="text-primary">Team</h4>
        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Product owner</Form.Label>
              <Form.Select
                name="productOwnerID"
                value={productOwnerID}
                onChange={productOwnerChangedHandler}
              >
                {" "}
                {users.map(
                  (user) =>
                    // check if any users are already developers and don't show them here
                    !developers.includes(String(user.id)) &&
                    scrumMasterID !== String(user.id) && (
                      <option key={user.id} value={user.id}>
                        {user.username}
                      </option>
                    )
                )}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col className="align-self-end">
            <Button
              variant="outline-primary d-block"
              type="button"
              onClick={saveProductOwnerHandler}
              disabled={!enteredProductOwnerValid}
            >
              Save change
            </Button>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col className="align-self-end">
            <Form.Group>
              <Form.Label>Scrum master</Form.Label>
              <Form.Select
                name="scrumMasterID"
                value={scrumMasterID}
                onChange={scrumMasterChangedHandler}
              >
                {users.map(
                  (user) =>
                    String(user.id) !== productOwnerID && (
                      <option key={user.id} value={user.id}>
                        {user.username}
                      </option>
                    )
                )}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col className="align-self-end">
            <Button
              variant="outline-primary d-block"
              type="button"
              onClick={saveScrumMasterHandler}
              disabled={!enteredScrumMasterValid}
            >
              Save change
            </Button>
          </Col>
        </Row>

        <Form.Group>
          <Form.Label>Add Developer</Form.Label>
          <Row className="mb-3">
            <Col>
              <Form.Select
                value={addNewDeveloper}
                onChange={(e) => {
                  addDeveloperChangedHandler(e);
                }}
                onBlur={addDeveloperBlurHandler}
                isInvalid={addNewDeveloperInvalid}
                disabled={users.length < developers.length + 2}
              >
                <option key={-1} value={""}>
                  Select developer
                </option>
                {users.map((user) => {
                  const isProductOwner = String(user.id) === productOwnerID;
                  const isDeveloper = developers.includes(String(user.id));
                  if (
                    !isProductOwner &&
                    !isDeveloper
                    // || developers[index] === String(user.id))
                  ) {
                    return (
                      <option key={user.id} value={user.id}>
                        {user.username}
                      </option>
                    );
                  }
                  return null;
                })}
              </Form.Select>
            </Col>
            <Col>
              <Button
                variant="outline-primary d-block"
                type="button"
                onClick={addDeveloperHandler}
                disabled={!enteredAddDeveloperValid}
              >
                Add developer
              </Button>
            </Col>
          </Row>
        </Form.Group>

        <Form.Group className="mb-4" controlId="form-tests">
          <Form.Group className="mb-3" controlId="form-tests">
            <Form.Label>Developers</Form.Label>
            <Table className="align-middle">
              <thead>
                <tr>
                  <th>User</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {developers.map((member, index) => {
                  return (
                    <tr key={index}>
                      <td>{displayUsername(member)}</td>
                      <td>
                        {" "}
                        {developers.length > 1 && (
                          <Button
                            variant="link"
                            type="button"
                            onClick={() => removeDeveloperHandler(index)}
                          >
                            Remove developer
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Form.Group>
        </Form.Group>
      </Form>
    </Fragment>
  );
};

export default ProjectRolesForm;
