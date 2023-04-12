import { useEffect, useState } from "react";
import { Alert, Button } from "react-bootstrap";
import Card from "../components/Card";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import classes from "./AddProject.module.css";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { parseJwt } from "../helpers/helpers";
import { getAllUsers } from "../features/users/userSlice";
import { ProjectData } from "../classes/projectData";
import { createProject } from "../features/projects/projectSlice";

const AddProject = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const projectsState = useAppSelector((state) => state.projects);
  const { users, isAdmin } = useAppSelector((state) => state.users);

  useEffect(() => {
    if (localStorage.getItem("user") == null) {
      navigate("/login");
      return;
    }

    const token = JSON.parse(localStorage.getItem("user")!).token;
    const isAdmin = parseJwt(token).isAdmin;
    // console.log(isAdmin);

    if (!isAdmin) {
      navigate("/");
      return;
    }

    dispatch(getAllUsers());
  }, [isAdmin]);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [productOwnerID, setProductOwnerID] = useState("");
  const [scrumMasterID, setScrumMasterID] = useState("");
  const [developers, setDevelopers] = useState([""]);

  const [projectNameTouched, setProjectNameTouched] = useState(false);
  // const [projectDescriptionTouched, setProjectDescriptionTouched] =
  //   useState(false);
  const [productOwnerIDTouched, setProductOwnerIDTouched] = useState(false);
  const [scrumMasterIDTouched, setScrumMasterIDTouched] = useState(false);
  const [developersTouched, setDevelopersTouched] = useState([false]);

  const [invalidFormMessage, setInvalidFormMessage] = useState("");

  const enteredNameValid = projectName.trim() !== "";
  const enteredProjectOwnerValid = productOwnerID.trim() !== "";
  const enteredScrumMasterValid = scrumMasterID.trim() !== "";
  const enteredDevelopersValid = developers.map((dev, index) => dev !== "");

  const nameInputInvalid = projectNameTouched && !enteredNameValid;
  const productOwnerInputInvalid =
    productOwnerIDTouched && !enteredProjectOwnerValid;
  const scrumMasterInputInvalid =
    scrumMasterIDTouched && !enteredScrumMasterValid;
  const developersInputInvalid = enteredDevelopersValid.map(
    (devValid, index) => developersTouched[index] && !devValid
  );

  const formIsValid =
    enteredNameValid &&
    enteredProjectOwnerValid &&
    enteredScrumMasterValid &&
    !enteredDevelopersValid.includes(false);

  const addInputHandler = () => {
    setDevelopers((prevDevelopers) => [...prevDevelopers, ""]);
    setDevelopersTouched((prevDevelopersTouched) => [
      ...prevDevelopersTouched,
      false,
    ]);
  };

  const removeDeveloperHandler = (index: any) => {
    setDevelopers((prevDevelopers) => {
      const newDevelopers = [...prevDevelopers];
      newDevelopers.splice(index, 1);
      return newDevelopers;
    });

    setDevelopersTouched((prevDevelopersTouched) => {
      const newDevelopersTouched = [...prevDevelopersTouched];
      newDevelopersTouched.splice(index, 1);
      return newDevelopersTouched;
    });
  };

  const projectNameChangedHandler = (e: any) => {
    setProjectName(e.target.value);
  };

  const projectNameBlurHandler = (e: any) => {
    setProjectNameTouched(true);
  };

  const projectDescriptionChangedHandler = (e: any) => {
    setProjectDescription(e.target.value);
  };

  const productOwnerChangedHandler = (e: any) => {
    setProductOwnerID(e.target.value);
  };

  const productOwnerBlurHandler = (e: any) => {
    setProductOwnerIDTouched(true);
  };

  const scrumMasterChangedHandler = (e: any) => {
    setScrumMasterID(e.target.value);
  };

  const scrumMasterBlurHandler = (e: any) => {
    setScrumMasterIDTouched(true);
  };

  const developerInputChangedHandler = (e: any, index: number) => {
    setDevelopers((prevDevelopers) => {
      const newDevelopers = [...prevDevelopers];
      newDevelopers[index] = e.target.value;
      return newDevelopers;
    });
    setDevelopersTouched((prevDevelopersTouched) => {
      const newDevelopersTouched = [...prevDevelopersTouched];
      newDevelopersTouched[index] = true;
      return newDevelopersTouched;
    });
  };

  const developerInputBlurHandler = (index: number) => {
    setDevelopersTouched((prevDevelopersTouched) => {
      const newDevelopersTouched = [...prevDevelopersTouched];
      newDevelopersTouched[index] = true;
      return newDevelopersTouched;
    });
  };

  const submitFormHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setProjectNameTouched(true);
    setProductOwnerIDTouched(true);
    setScrumMasterIDTouched(true);
    setDevelopersTouched((prevDevsTouched) => {
      const newDevsTouched = [...prevDevsTouched];
      newDevsTouched.fill(true);
      return newDevsTouched;
    });

    // display error msg if form is invalid
    if (!formIsValid) {
      setInvalidFormMessage("Make sure to fill out all required fields.");
      return;
    }
    setInvalidFormMessage("");

    const userRoles = [
      {
        userId: +productOwnerID,
        role: [2],
      },
      {
        userId: +scrumMasterID,
        role: [1],
      },
    ];

    developers.forEach((devID) => {
      const indexOfExistingUserRole = userRoles.findIndex(
        (role) => role.userId === +devID
      );
      if (indexOfExistingUserRole !== -1) {
        userRoles[indexOfExistingUserRole].role.push(0);
      } else {
        userRoles.push({
          userId: +devID,
          role: [0],
        });
      }
    });

    const newProject: ProjectData = {
      projectName: projectName.trim(),
      projectDescription: projectDescription.trim(),
      userRoles,
    };

    // console.log(newProject);

    dispatch(createProject(newProject));

    setProjectName("");
    setProjectDescription("");
    setDevelopers([""]);
    setProductOwnerID("");
    setScrumMasterID("");

    setProjectNameTouched(false);
    setProductOwnerIDTouched(false);
    setScrumMasterIDTouched(false);
    setDevelopersTouched([false]);
  };

  return (
    <div className={classes.cardContainer}>
      <Card>
        <h1 className={`${classes.cardHeading} text-primary`}>Add project</h1>
        <Form onSubmit={submitFormHandler}>
          <Form.Group className="mb-3" controlId="form-title">
            <Form.Label>Project name</Form.Label>
            <Form.Control
              placeholder="Add project name"
              name="projectName"
              value={projectName}
              onChange={projectNameChangedHandler}
              onBlur={projectNameBlurHandler}
              isInvalid={nameInputInvalid}
            />
            <Form.Text>Add a unique project name.</Form.Text>
          </Form.Group>

          <Form.Group className="mb-4 mt-3" controlId="form-description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              placeholder="Add project description"
              name="projectDescription"
              value={projectDescription}
              onChange={projectDescriptionChangedHandler}
            />
          </Form.Group>

          <h4 className="text-primary">Team</h4>
          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label>Product owner</Form.Label>
                <Form.Select
                  name="productOwnerID"
                  value={productOwnerID}
                  onChange={productOwnerChangedHandler}
                  onBlur={productOwnerBlurHandler}
                  isInvalid={productOwnerInputInvalid}
                >
                  <option key={-1} value={""}>
                    Select product owner
                  </option>
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
            <Col>
              <Form.Group>
                <Form.Label>Scrum master</Form.Label>
                <Form.Select
                  name="scrumMasterID"
                  value={scrumMasterID}
                  onChange={scrumMasterChangedHandler}
                  onBlur={scrumMasterBlurHandler}
                  isInvalid={scrumMasterInputInvalid}
                >
                  <option key={-1} value={""}>
                    Select scrum master
                  </option>
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
          </Row>

          <Form.Group
            className={`mb-4 ${classes.testsGroup}`}
            controlId="form-tests"
          >
            <Form.Group className="mb-3" controlId="form-tests">
              <Form.Label>Developers</Form.Label>
              {developers.map((member, index) => (
                <Form.Group key={index}>
                  <Form.Text className="text-secondary mb-1">{`Developer ${
                    index + 1
                  }`}</Form.Text>
                  <Container>
                    <Row className="mb-3">
                      <Col>
                        <Form.Select
                          value={developers[index]}
                          onChange={(e) => {
                            developerInputChangedHandler(e, index);
                            // console.log(index);
                          }}
                          onBlur={() => developerInputBlurHandler(index)}
                          isInvalid={developersInputInvalid[index]}
                        >
                          <option key={-1} value={""}>
                            Select developer
                          </option>
                          {users.map((user) => {
                            const isProductOwner =
                              String(user.id) === productOwnerID;
                            const isDeveloper = developers.includes(
                              String(user.id)
                            );
                            if (
                              !isProductOwner &&
                              (!isDeveloper ||
                                developers[index] === String(user.id))
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
                        {developers.length > 1 && (
                          <Button
                            variant="link"
                            type="button"
                            onClick={() => removeDeveloperHandler(index)}
                          >
                            Remove developer
                          </Button>
                        )}
                      </Col>
                    </Row>
                  </Container>
                </Form.Group>
              ))}
            </Form.Group>

            <Button
              variant="outline-primary d-block"
              type="button"
              onClick={addInputHandler}
              disabled={developers.length >= users.length}
            >
              Add developer
            </Button>
            {developers.length >= users.length && (
              <Form.Text>There are no more users to add.</Form.Text>
            )}
          </Form.Group>
          {invalidFormMessage !== "" && (
            <Alert variant={"danger"}>{invalidFormMessage}</Alert>
          )}
          {invalidFormMessage === "" &&
            projectsState.isError &&
            !projectsState.isLoading && (
              <Alert variant={"danger"}>{projectsState.message}</Alert>
            )}
          {invalidFormMessage === "" &&
            projectsState.isSuccess &&
            !projectsState.isLoading && (
              <Alert variant={"success"}>Project added successfully!</Alert>
            )}
          <Button variant="primary" type="submit" size="lg" disabled={false}>
            Add project
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default AddProject;
