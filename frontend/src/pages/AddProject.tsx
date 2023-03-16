import { useState } from "react";
import { Button } from "react-bootstrap";
import Card from "../components/Card";
import { Form } from "react-bootstrap";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import classes from "./AddProject.module.css";
import useValidateForm from "../hooks/useValidateForm";

const AddStory = () => {
  const [projectData, setProjectData] = useState({
    name: "",
    members: [{}],
  });

  const { name, members } = projectData;

  // TODO get this from backend -> is there a user class i can use here?
  const users: string[] = ["Joel", "Ellie", "Marlene"];

  // TODO check doubling of project name

  const addInputHandler = () => {
    console.log();
    setProjectData((prevProjectData) => ({
      ...prevProjectData,
      members: [...prevProjectData.members, ""],
    }));
  };

  const userDataChangedHandler = (e: any) => {
    console.log();
    setProjectData((prevProjectData) => ({
      ...prevProjectData,
      [e.target.name]: e.target.value,
    }));
  };

  const testInputChangedHandler = (e: any, index: number) => {
    console.log();
    // setStoryData((prevStoryData) => {
    //   const newTestsData: string[] = [...prevStoryData.tests];
    //   newTestsData[index] = e.target.value;
    //   return { ...prevStoryData, tests: newTestsData };
    // });
  };

  const selectInputChangedHandler = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    //   setStoryData((prevStoryData) => ({
    //     ...prevStoryData,
    //     priority: +e.target.value,
    //   }));
  };

  const checkBusinessValue = () => {
    // businessValue < 0 || businessValue > 10
    //   ? setBusinessValueError(true)
    //   : setBusinessValueError(false);
  };

  const submitFormHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // TODO send data to backend via service
    // console.log(storyData);

    // setStoryData({
    //   title: "",
    //   description: "",
    //   tests: [""],
    //   priority: 3,
    //   businessValue: 5,
    // });
  };

  return (
    <Card>
      <h1 className="text-primary">Add project title</h1>
      <Form onSubmit={submitFormHandler}>
        <Form.Group className="mb-3" controlId="form-title">
          <Form.Label>Project name</Form.Label>
          <Form.Control
            placeholder="Add project name"
            name="name"
            value={name}
            onChange={userDataChangedHandler}
          />
        </Form.Group>

        <Form.Group
          className={`mb-3 ${classes.testsGroup}`}
          controlId="form-tests"
        >
          <Form.Label>Project members</Form.Label>
          <Form.Group className="mb-3" controlId="form-tests">
            {projectData.members.map((member, index) => (
              <Form.Group
                key={index /* TODO this should be user id not index */}
              >
                <Form.Text className="text-secondary">{`Member ${
                  index + 1
                }`}</Form.Text>
                <Container>
                  <Row>
                    <Col>
                      <Form.Select
                        aria-label="Select member"
                        onChange={selectInputChangedHandler}
                        name="member"
                      >
                        {users.map((user, index) => (
                          <option
                            key={
                              index /* TODO this should be user id not index */
                            }
                            value={user}
                          >
                            {user}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col>
                      <Form.Select
                        aria-label="Select member role"
                        onChange={selectInputChangedHandler}
                        name="role"
                      >
                        <option value="0">Developer</option>
                        <option value="1">Scrum master</option>
                        <option value="2">Product owner</option>
                      </Form.Select>
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
          disabled={false /* TODO */}
        >
          Add story
        </Button>
      </Form>
    </Card>
  );
};

export default AddStory;
