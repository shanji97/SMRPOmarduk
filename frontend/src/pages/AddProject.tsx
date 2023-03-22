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
import { Member, ProjectData } from "../classes/projectData";
import { createProject } from "../features/projects/projectSlice";

const AddProject = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const projectsState = useAppSelector((state) => state.projects);
  const { users, isAdmin } = useAppSelector((state) => state.users);

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("user")!).token;
    const isAdmin = parseJwt(token).isAdmin;
    if (!isAdmin) {
      navigate("/");
      return;
    }

    dispatch(getAllUsers());
  }, [isAdmin]);

  const [projectName, setProjectName] = useState("");
  const [membersArray, setMembersArray] = useState<Member[]>([
    { userId: "", role: -1 },
  ]);

  const [nameError, setNameError] = useState(false);
  const [memberNamesError, setMemberNamesError] = useState([false]);
  const [memberRolesError, setMemberRolesError] = useState([false]);

  const [nameTouched, setNameTouched] = useState(false);
  const [memberNamesTouched, setMemberNamesTouched] = useState([false]);
  const [memberRolesTouched, setMemberRolesTouched] = useState([false]);

  const wasAnythingTouched =
    nameTouched ||
    memberNamesTouched.includes(true) ||
    memberRolesTouched.includes(true);

  console.log(wasAnythingTouched);

  const formIsValid =
    nameTouched &&
    !nameError &&
    !memberNamesError.includes(true) &&
    !memberNamesTouched.includes(false) &&
    !memberRolesError.includes(true) &&
    !memberRolesTouched.includes(false);

  const addInputHandler = () => {
    setMembersArray((prevMembersArray) => [
      ...prevMembersArray,
      { userId: "", role: -1 },
    ]);
    setMemberNamesTouched((prevMemberNamesTouched) => [
      ...prevMemberNamesTouched,
      false,
    ]);
    setMemberRolesTouched((prevMemberRolesTouched) => [
      ...prevMemberRolesTouched,
      false,
    ]);
  };

  const projectNameChangedHandler = (e: any) => {
    setProjectName(e.target.value);
  };

  const memberInputChangedHandler = (e: any, index: number) => {
    setMembersArray((prevMembersArray) => {
      const newMembersArray = [...prevMembersArray];

      newMembersArray[index] = {
        ...newMembersArray[index],
        userId: e.target.value,
      };
      return newMembersArray;
    });
    checkMemberNameInput(index);
  };

  const roleInputChangedHandler = (e: any, index: number) => {
    setMembersArray((prevMembersArray) => {
      const newMembersArray = [...prevMembersArray];

      newMembersArray[index] = {
        ...newMembersArray[index],
        role: +e.target.value,
      };
      return newMembersArray;
    });
  };

  const removeMemberHandler = (index: any) => {
    setMembersArray((prevMembersArray) => {
      const newMembersArray = [...prevMembersArray];
      newMembersArray.splice(index, 1);
      return newMembersArray;
    });
    setMemberNamesTouched((prevMemberNamesTouched) => {
      const newMemberNamesTouched = [...prevMemberNamesTouched];
      newMemberNamesTouched.splice(index, 1);
      return newMemberNamesTouched;
    });
    setMemberRolesTouched((prevMemberRolesTouched) => {
      const newMemberRolesTouched = [...prevMemberRolesTouched];
      newMemberRolesTouched.splice(index, 1);
      return newMemberRolesTouched;
    });
  };

  // name validation
  const checkProjectName = () => {
    projectName.trim() === "" ? setNameError(true) : setNameError(false);
    setNameTouched(true);
  };

  //  checks if a member is selected for all the inputs
  const checkMemberNameInput = (index: number) => {
    const inputValue = membersArray[index].userId;
    const newMemberNamesError = [...memberNamesError];
    newMemberNamesError[index] = inputValue === "";
    setMemberNamesError(newMemberNamesError);

    setMemberNamesTouched((prevMemberNamesTouched) => {
      const newMemberNamesTouched = [...prevMemberNamesTouched];
      newMemberNamesTouched[index] = true;
      return newMemberNamesTouched;
    });
  };

  //  checks if a role is selected for all the inputs
  const checkMemberRoleInput = (index: number) => {
    const inputValue = membersArray[index].role;
    const newMemberRolesError = [...memberRolesError];
    newMemberRolesError[index] = inputValue === -1;
    setMemberRolesError(newMemberRolesError);

    setMemberRolesTouched((prevMemberRolesTouched) => {
      const newMemberRolesTouched = [...prevMemberRolesTouched];
      newMemberRolesTouched[index] = true;
      return newMemberRolesTouched;
    });
  };

  const validateForm = () => {
    // let nameError: boolean = projectName === "";
    let usersInputError: boolean = membersArray.some((u) => u.userId === "");
    let roleInputError: boolean = membersArray.some((u) => u.role === -1);

    return nameError || usersInputError || roleInputError;
  };

  const submitFormHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newProject: ProjectData = {
      projectName: projectName.trim(),
      members: membersArray,
    };

    console.log(newProject);

    // TODO send data to backend via service
    dispatch(createProject(newProject));

    setProjectName("");
    setMembersArray([{ userId: "", role: -1 }]);
    setNameTouched(false);
    setMemberNamesTouched([false]);
    setMemberRolesTouched([false]);
  };

  return (
    <div className={classes.cardContainer}>
      <Card>
        <h1 className={`${classes.cardHeading} text-primary`}>
          Add project title
        </h1>
        <Form onSubmit={submitFormHandler}>
          <Form.Group className="mb-3" controlId="form-title">
            <Form.Label>Project name</Form.Label>
            <Form.Control
              placeholder="Add project name"
              name="projectName"
              value={projectName}
              onChange={projectNameChangedHandler}
              onBlur={checkProjectName}
              isInvalid={nameError}
            />
          </Form.Group>

          <Form.Group
            className={`mb-3 ${classes.testsGroup}`}
            controlId="form-tests"
          >
            <Form.Label>Project members</Form.Label>
            <Form.Group className="mb-3" controlId="form-tests">
              {membersArray.map((member, index) => (
                <Form.Group key={index}>
                  <Form.Text className="text-secondary mb-1">{`Member ${
                    index + 1
                  }`}</Form.Text>
                  <Container>
                    <Row className="mb-2">
                      <Col>
                        <Form.Select
                          name="membersArray.userId"
                          value={membersArray[index].userId}
                          onChange={(e) => {
                            memberInputChangedHandler(e, index);
                          }}
                          onBlur={() => checkMemberNameInput(index)}
                          isInvalid={
                            memberNamesError[index] && memberNamesTouched[index]
                          }
                        >
                          <option key={-1} value={""}>
                            Select member
                          </option>
                          {users.map(
                            (user) =>
                              // ce je username notr ga ne prikazi
                              (!membersArray.find(
                                (u) => u.userId === String(user.id)
                              ) ||
                                membersArray[index].userId ===
                                  "" + String(user.id)) && (
                                <option key={user.id} value={user.id}>
                                  {user.username}
                                </option>
                              )
                          )}
                        </Form.Select>
                      </Col>
                      <Col>
                        <Form.Select
                          as="select"
                          value={membersArray[index].role}
                          onChange={(e) => {
                            roleInputChangedHandler(e, index);
                          }}
                          name="role"
                          onBlur={() => checkMemberRoleInput(index)}
                          isInvalid={
                            memberRolesError[index] && memberRolesTouched[index]
                          }
                          key={index + "s"}
                        >
                          <option value="-1">Select role</option>
                          <option value="0">Developer</option>
                          {(!membersArray.find((u) => u.role === 1) ||
                            membersArray[index].role === 1) && (
                            <option value="1">Scrum master</option>
                          )}
                          {/* {(!membersArray.find((u) => u.role === 2) ||
                          membersArray[index].role === 2) && ( */}
                          <option value="2">Product owner</option>
                          {/* )} */}
                        </Form.Select>
                      </Col>
                      <Col>
                        <Button
                          variant="link"
                          type="button"
                          onClick={() => removeMemberHandler(index)}
                        >
                          Remove member
                        </Button>
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
              disabled={membersArray.length >= users.length}
            >
              Add another member
            </Button>
            {membersArray.length >= users.length && (
              <Form.Text>There are no more users to add.</Form.Text>
            )}
          </Form.Group>
          {projectsState.isError &&
            !projectsState.isLoading &&
            !wasAnythingTouched && (
              <Alert variant={"danger"}>{projectsState.message}</Alert>
            )}
          {projectsState.isSuccess &&
            !projectsState.isLoading &&
            !wasAnythingTouched && (
              <Alert variant={"success"}>Project added successfully!</Alert>
            )}
          <Button
            variant="primary"
            type="submit"
            size="lg"
            disabled={!formIsValid}
          >
            Add project
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default AddProject;
