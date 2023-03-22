import { useState } from "react";
import { Button } from "react-bootstrap";
import Card from "../components/Card";
import { Form } from "react-bootstrap";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import classes from "./AddProject.module.css";

const AddProject = () => {
  const [projectName, setProjectName] = useState("");

  const [membersArray, setMembersArray] = useState([
    { username: "", role: -1 },
  ]);

  // TODO get this from backend -> is there a user class i can use here?
  const DUMMY_USERS = [
    {
      username: "tinec",
      password: "123123",
      name: "Tine",
      surname: "Crnugelj",
      email: "tine.crnugelj@gmail.com",
      isAdmin: false,
    },
    {
      username: "martind",
      password: "123123",
      name: "Martin",
      surname: "Dagarin",
      email: "martin.dagarin@gmail.com",
      isAdmin: true,
    },
    {
      username: "simonk",
      password: "123123",
      name: "Simon",
      surname: "Klavzar",
      email: "simon.klavzar@gmail.com",
      isAdmin: false,
    },
    {
      username: "matevzl",
      password: "123123",
      name: "Matevz",
      surname: "Lapajne",
      email: "matevz.lapajne@gmail.com",
      isAdmin: true,
    },
  ];

  // TODO check doubling of project name

  const addInputHandler = () => {
    setMembersArray((prevMembersArray) => [
      ...prevMembersArray,
      { username: "", role: -1 },
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
        username: e.target.value,
      };
      return newMembersArray;
    });
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
  };

  const validateForm = () => {
    let nameError: boolean = projectName === "";

    let usersInputError: boolean = membersArray.some((u) => u.username === "");

    let roleInputError: boolean = membersArray.some((u) => u.role === -1);

    return nameError || usersInputError || roleInputError;
  };

  let formHasError = validateForm();

  const submitFormHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let formData = {
      projectName: projectName,
      members: membersArray,
    };

    // TODO send data to backend via service
    console.log(formData);

    setProjectName("");
    setMembersArray([]);
  };

  return (
    <Card>
      <h1 className="text-primary">Add project title</h1>
      <Form onSubmit={submitFormHandler}>
        <Form.Group className="mb-3" controlId="form-title">
          <Form.Label>Project name</Form.Label>
          <Form.Control
            placeholder="Add project name"
            name="projectName"
            value={projectName}
            onChange={projectNameChangedHandler}
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
                <Form.Text className="text-secondary">{`Member ${
                  index + 1
                }`}</Form.Text>
                <Container>
                  <Row>
                    <Col>
                      <Form.Select
                        name="membersArray.username"
                        value={membersArray[index].username}
                        onChange={(e) => {
                          memberInputChangedHandler(e, index);
                        }}
                      >
                        <option key={-1} value={""}>
                          Select member
                        </option>
                        {DUMMY_USERS.map(
                          (user) =>
                            // ce je username notr ga ne prikazi
                            (!membersArray.find(
                              (u) => u.username === user.username
                            ) ||
                              membersArray[index].username ===
                                user.username) && (
                              <option key={user.username} value={user.username}>
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
                        key={index + "s"}
                      >
                        <option value="-1">Select member role</option>
                        <option value="0">Developer</option>
                        {(!membersArray.find((u) => u.role === 1) ||
                          membersArray[index].role === 1) && (
                          <option value="1">Scrum master</option>
                        )}
                        {(!membersArray.find((u) => u.role === 2) ||
                          membersArray[index].role === 2) && (
                          <option value="2">Product owner</option>
                        )}
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
            variant="outline-primary"
            type="button"
            onClick={addInputHandler}
          >
            Add another member
          </Button>
        </Form.Group>
        <Button
          variant="primary"
          type="submit"
          size="lg"
          disabled={formHasError}
        >
          Add story
        </Button>
      </Form>
    </Card>
  );
};

export default AddProject;
