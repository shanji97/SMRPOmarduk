import { useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import Card from "../components/Card";
import { Form } from "react-bootstrap";

import classes from "./AddStory.module.css";
import useValidateForm from "../hooks/useValidateForm";

const AddStory = () => {
  const [storyData, setStoryData] = useState({
    title: "",
    description: "",
    tests: [""],
    priority: 3, // 3 => must have, 0 => won't have this time
    businessValue: 5,
  });

  const [businessValueError, setBusinessValueError] = useState(false);
  const formIsValid = useValidateForm(storyData) && !businessValueError;

  const { title, description, tests, priority, businessValue } = storyData;

  // TODO check doubling of story name

  const addInputHandler = () => {
    setStoryData((prevStoryData) => ({
      ...prevStoryData,
      tests: [...prevStoryData.tests, ""],
    }));
  };

  const userDataChangedHandler = (e: any) => {
    setStoryData((prevStoryData) => ({
      ...prevStoryData,
      [e.target.name]: e.target.value,
    }));
  };

  const testInputChangedHandler = (e: any, index: number) => {
    setStoryData((prevStoryData) => {
      const newTestsData: string[] = [...prevStoryData.tests];
      newTestsData[index] = e.target.value;
      return { ...prevStoryData, tests: newTestsData };
    });
  };

  const selectInputChangedHandler = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStoryData((prevStoryData) => ({
      ...prevStoryData,
      priority: +e.target.value,
    }));
  };

  const checkBusinessValue = () => {
    businessValue < 0 || businessValue > 10
      ? setBusinessValueError(true)
      : setBusinessValueError(false);
  };

  const submitFormHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // TODO send data to backend via service
    console.log(storyData);

    setStoryData({
      title: "",
      description: "",
      tests: [""],
      priority: 3,
      businessValue: 5,
    });
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
            {storyData.tests.map((input, index) => (
              <Form.Group key={index}>
                <Form.Text className="text-secondary">{`Test ${
                  index + 1
                }`}</Form.Text>
                <Form.Control
                  value={input}
                  placeholder="Add test"
                  onChange={(e) => {
                    console.log();
                    testInputChangedHandler(e, index);
                  }}
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
            onChange={selectInputChangedHandler}
            value={priority}
            name="priority"
          >
            <option value="3">Must have</option>
            <option value="2">Should have</option>
            <option value="1">Could have</option>
            <option value="0">Won't have this time</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3" controlId="form-business-value">
          <Form.Label>Business value</Form.Label>
          <Form.Control
            placeholder="Enter business value"
            name="businessValue"
            value={businessValue}
            onChange={userDataChangedHandler}
            onBlur={checkBusinessValue}
            type="number"
          />
          <Form.Text className="text-secondary">
            Enter a number between 0 and 10.
          </Form.Text>
        </Form.Group>
        <Button
          variant="primary"
          type="submit"
          size="lg"
          disabled={!formIsValid}
        >
          Add story
        </Button>
      </Form>
    </Card>
  );
};

export default AddStory;
