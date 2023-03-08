import { useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import Card from "../components/Card";
import { Form } from "react-bootstrap";

import classes from "./AddStory.module.css";

const AddStory = () => {
  const [storyData, setStoryData] = useState({
    title: "",
    description: "",
    priority: 0,
    businessValue: 5,
  });

  const { title, description, priority, businessValue } = storyData;

  const [tests, setTests] = useState([""]);

  const addInputHandler = () => {
    setTests((prevTests) => [...prevTests, ""]);
  };

  const userDataChangedHandler = (e: any) => {
    console.log(e.target.name);
    setStoryData((prevStoryData) => ({
      ...prevStoryData,
      [e.target.name]: e.target.value,
    }));
  };

  const testInputChangedHandler = (value: string, index: number) => {
    setTests((prevTestsData) => {
      const newTestsData: string[] = [...prevTestsData];
      newTestsData[index] = value;
      return newTestsData;
    });
  };

  const submitFormHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStoryData({
      title: "",
      description: "",
      priority: 0,
      businessValue: 5,
    });

    // TODO send data to backend
    console.log(storyData);
    console.log(tests);
  };

  return (
    <Card>
      <h1 className="text-primary">Add user story</h1>
      <Form onSubmit={submitFormHandler}>
        <Form.Group className="mb-3" controlId="form-title">
          <Form.Label>Title</Form.Label>
          <Form.Control
            placeholder="Add story title"
            name="title"
            value={title}
            onChange={userDataChangedHandler}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="form-description">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            placeholder="Add story description"
            name="description"
            value={description}
            onChange={userDataChangedHandler}
          />
        </Form.Group>

        <Form.Group
          className={`mb-3 ${classes.testsGroup}`}
          controlId="form-tests"
        >
          <Form.Label>Tests</Form.Label>
          <Form.Group className="mb-3" controlId="form-tests">
            {tests.map((input, index) => (
              <Form.Group key={index}>
                <Form.Text className="text-secondary">{`Test ${
                  index + 1
                }`}</Form.Text>
                <Form.Control
                  type="text"
                  value={input}
                  onChange={(e) =>
                    testInputChangedHandler(e.target.value, index)
                  }
                />
              </Form.Group>
            ))}
          </Form.Group>

          <Button
            variant="outline-primary"
            type="button"
            onClick={addInputHandler}
          >
            Add another test
          </Button>
        </Form.Group>

        <Form.Group className="mb-3" controlId="form-priority">
          <Form.Label>Priority</Form.Label>
          <Form.Select
            aria-label="Select story priority"
            onChange={userDataChangedHandler}
            value={priority}
            name="priority"
          >
            <option value="0">Must have</option>
            <option value="1">Should have</option>
            <option value="2">Could have</option>
            <option value="3">Won't have this time</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3" controlId="form-business-value">
          <Form.Label>Business value</Form.Label>
          <Form.Control
            placeholder="Enter business value"
            name="businessValue"
            value={businessValue}
            onChange={userDataChangedHandler}
          />
        </Form.Group>
        <Button variant="primary" type="submit" size="lg">
          Add story
        </Button>
      </Form>
    </Card>
  );
};

export default AddStory;
