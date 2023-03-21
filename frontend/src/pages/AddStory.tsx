import { useEffect, useState } from "react";
import { Alert, Button } from "react-bootstrap";
import Card from "../components/Card";
import { Form } from "react-bootstrap";

import classes from "./AddStory.module.css";
import useValidateForm from "../hooks/useValidateForm";
import { StoryData } from "../classes/storyData";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { createStory } from "../features/stories/storySlice";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const AddStory = () => {
  const dispatch = useAppDispatch();

  let state = useAppSelector((state) => state.stories);

  const [storyData, setStoryData] = useState({
    title: "",
    description: "",
    tests: [""],
    priority: "", // 3 => must have, 0 => won't have this time
    businessValue: "",
    sequenceNumber: "",
  });

  const [titleError, setTitleError] = useState(false);
  const [businessValueError, setBusinessValueError] = useState(false);
  const [sequenceNumberError, setSequenceNumberError] = useState(false);
  const [testsError, setTestsError] = useState([false]);

  const [titleTouched, setTitleTouched] = useState(false);
  const [businessValueTouched, setBusinessValueTouched] = useState(false);
  const [sequenceNumberTouched, setSequenceNumberTouched] = useState(false);
  const [testsTouched, setTestsTouched] = useState([false]);

  const formIsValid =
    titleTouched &&
    !titleError &&
    businessValueTouched &&
    !businessValueError &&
    sequenceNumberTouched &&
    !sequenceNumberError &&
    !testsError.includes(true) &&
    !testsTouched.includes(false);

  const { title, description, priority, businessValue, tests, sequenceNumber } =
    storyData;

  const addInputHandler = () => {
    setStoryData((prevStoryData) => ({
      ...prevStoryData,
      tests: [...prevStoryData.tests, ""],
    }));
    setTestsError((prevTestsError) => [...prevTestsError, false]);
    setTestsTouched((prevTestsTouched) => [...prevTestsTouched, false]);
  };

  const removeInputHandler = (index: any) => {
    setStoryData((prevStoryData) => {
      const newTestsArray = [...prevStoryData.tests];
      newTestsArray.splice(index, 1);
      return {
        ...prevStoryData,
        tests: [...newTestsArray],
      };
    });
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
      priority: e.target.value,
    }));
  };

  const checkStoryTitle = () => {
    storyData.title.trim() === "" ? setTitleError(true) : setTitleError(false);
    setTitleTouched(true);
  };

  const checkBusinessValue = () => {
    setBusinessValueTouched(true);

    if (businessValue === "") {
      setBusinessValueError(true);
      return;
    }

    parseInt(businessValue) < 0 || parseInt(businessValue) > 10
      ? setBusinessValueError(true)
      : setBusinessValueError(false);
  };

  const checkSequenceNumber = () => {
    setSequenceNumberTouched(true);
    if (sequenceNumber === "") {
      setSequenceNumberError(true);
      return;
    }

    parseInt(sequenceNumber) < 1
      ? setSequenceNumberError(true)
      : setSequenceNumberError(false);
  };

  const checkTestInput = (index: number) => {
    const inputValue = storyData.tests[index];
    const newTestsError = [...testsError];
    newTestsError[index] = inputValue.trim() === "";
    setTestsError(newTestsError);

    setTestsTouched((prevTestsTouched) => {
      const newTestsTouched = [...prevTestsTouched];
      newTestsTouched[index] = true;
      return newTestsTouched;
    });
  };

  const submitFormHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newStory: StoryData = {
      title,
      description,
      tests,
      priority: parseInt(priority),
      businessValue: parseInt(businessValue),
      sequenceNumber: parseInt(sequenceNumber),
    };

    console.log(storyData);

    console.log("DISŠATCH RETURN " + dispatch(createStory(newStory)));

    setStoryData({
      title: "",
      description: "",
      tests: [""],
      priority: "",
      businessValue: "",
      sequenceNumber: "",
    });
  };

  return (
    <div className={classes.cardContainer}>
      <Card>
        <h1 className={`${classes.cardHeading} text-primary`}>
          Add User Story
        </h1>
        <Form onSubmit={submitFormHandler}>
          <Row>
            <Col>
              <Form.Group className="mb-1" controlId="form-business-value">
                <Form.Label>Story Number</Form.Label>
                <Form.Control
                  isInvalid={sequenceNumberError}
                  placeholder="Enter #"
                  name="sequenceNumber"
                  value={sequenceNumber}
                  onChange={userDataChangedHandler}
                  onBlur={checkSequenceNumber}
                  type="number"
                />
                <Form.Text className="text-secondary">
                  Enter a unique, positive number
                </Form.Text>
              </Form.Group>
            </Col>
            <Col xs="12" md="8">
              <Form.Group className="mb-1" controlId="form-title">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  isInvalid={titleError}
                  placeholder="Add story title"
                  name="title"
                  value={title}
                  onChange={userDataChangedHandler}
                  onBlur={checkStoryTitle}
                />
                <Form.Text className="text-secondary">
                  Story titles must be unique.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4 mt-3" controlId="form-description">
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
                <Form.Group key={index} className="mb-2">
                  <Form.Text className="text-secondary">{`Test ${
                    index + 1
                  }`}</Form.Text>
                  <Row>
                    <Col>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={input}
                        placeholder="Add test"
                        onChange={(e) => {
                          console.log();
                          testInputChangedHandler(e, index);
                        }}
                        onBlur={() => checkTestInput(index)}
                        isInvalid={testsError[index] ? true : false}
                      />
                    </Col>
                    <Col xs="12" md="3">
                      <Button
                        variant="link"
                        type="button"
                        onClick={() => removeInputHandler(index)}
                      >
                        Remove test
                      </Button>
                    </Col>
                  </Row>
                </Form.Group>
              ))}
            </Form.Group>

            <Button
              variant="outline-primary"
              type="button"
              onClick={addInputHandler}
              className="mb-3"
            >
              Add another test
            </Button>
          </Form.Group>
          <Row className="mb-3">
            <Col xs="12" md="6">
              <Form.Group controlId="form-priority">
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  aria-label="Select story priority"
                  onChange={selectInputChangedHandler}
                  value={priority}
                  name="priority"
                  placeholder="Select priority"
                >
                  <option value="3">Must have</option>
                  <option value="2">Should have</option>
                  <option value="1">Could have</option>
                  <option value="0">Won't have this time</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs="12" md="6">
              <Form.Group controlId="form-business-value">
                <Form.Label>Business value</Form.Label>
                <Form.Control
                  isInvalid={businessValueError}
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
            </Col>
          </Row>
          {state.isError && <Alert variant={"danger"}>{state.message}</Alert>}
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
    </div>
  );
};

export default AddStory;
