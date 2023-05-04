import { useEffect, useState } from "react";
import { Alert, Button } from "react-bootstrap";
import Card from "../components/Card";
import { Form } from "react-bootstrap";

import classes from "./AddStory.module.css";

import { StoryData } from "../classes/storyData";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { createStory, reset } from "../features/stories/storySlice";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getProject } from "../features/projects/projectSlice";
import { parseJwt } from "../helpers/helpers";

const AddStory = () => {
  const dispatch = useAppDispatch();
  let storyState = useAppSelector((state) => state.stories);
  let projectsState = useAppSelector((state) => state.projects);
  const navigate = useNavigate();

  // get id
  const { projectID } = useParams();

  const [invalidFormMessage, setInvalidFormMessage] = useState("");

  const [userId, setUserId] = useState(-1);

  useEffect(() => {
    if (storyState.isUpdateSuccess && !storyState.isLoading) {
      toast.success("Story successfully created!");
      resetInputs();
      dispatch(reset());
    }
    if (storyState.isUpdateError && !storyState.isLoading) {
      toast.error(storyState.message);
    }
  }, [
    storyState.isUpdateSuccess,
    storyState.isUpdateError,
    storyState.isLoading,
  ]);

  useEffect(() => {
    if (projectID !== undefined) {
      dispatch(getProject(projectID));
    }
  }, [projectID]);

  // TODO
  // this is temporary - checks if user is product owner or scrum master
  // if not, it redirects them to '/'
  useEffect(() => {
    if (projectsState.userRoles.length > 0) {
      const token = JSON.parse(localStorage.getItem("user")!).token;
      const uid = parseJwt(token).sid;
      setUserId(uid);

      let userAllowedToAddStories = false;

      projectsState.userRoles.forEach((user) => {
        if (user.userId === uid && user.role > 0) {
          userAllowedToAddStories = true;
          // console.log("userAllowedToAddStories");
        }
      });

      if (!userAllowedToAddStories) {
        navigate("/");
        return;
      }
    }
  }, [projectsState.userRoles]);

  const [sequenceNumber, setSequenceNumber] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tests, setTests] = useState([""]);
  const [priority, setPriority] = useState(""); // 3 => must have, 0 => won't have this time
  const [businessValue, setBusinessValue] = useState("");
  //nove
  const [category, setCategory] = useState("");
  const [timeComplexity, setimeComplexity] = useState("");
  const [isRealized, setisRealized] = useState(false);

  const [sequenceNumberTouched, setSequenceNumberTouched] = useState(false);
  const [titleTouched, setTitleTouched] = useState(false);
  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const [businessValueTouched, setBusinessValueTouched] = useState(false);
  const [testsTouched, setTestsTouched] = useState([false]);
  const [priorityTouched, setPriorityTouched] = useState(false);

  const enteredTitleValid = title.trim() !== "";
  const enteredSequenceNumberValid =
    sequenceNumber.trim() !== "" &&
    parseInt(sequenceNumber) >= 0 &&
    parseInt(sequenceNumber) < 1000; // TODO check for absurdly max number or for negative
  const enteredDescriptionValid = description.trim() !== "";
  const enteredPriorityValid = priority.trim() !== "";
  const enteredBusinessValueValid =
    businessValue.trim() !== "" &&
    parseInt(businessValue) >= 1 &&
    parseInt(businessValue) <= 10;
  const enteredTestsValid = tests.map((test) => test.trim() !== "");

  const titleInvalid = titleTouched && !enteredTitleValid;
  const sequenceNumberInvalid =
    sequenceNumberTouched && !enteredSequenceNumberValid;
  const descriptionInvalid = descriptionTouched && !enteredDescriptionValid;
  const priorityInvalid = priorityTouched && !enteredPriorityValid;
  const businessValueInvalid =
    businessValueTouched && !enteredBusinessValueValid;
  const testsInvalid = enteredTestsValid.map(
    (testValid, index) => testsTouched[index] && !testValid
  );

  const formIsValid =
    enteredSequenceNumberValid &&
    enteredTitleValid &&
    enteredDescriptionValid &&
    enteredPriorityValid &&
    enteredBusinessValueValid &&
    !enteredTestsValid.includes(false);

  // for adding inputs in the 'Tests' section
  const addInputHandler = () => {
    setTests((prevTests) => [...prevTests, ""]);
    setTestsTouched((prevTestsTouched) => [...prevTestsTouched, false]);
  };

  // for removing inputs in the 'Tests' section
  const removeInputHandler = (index: any) => {
    setTests((prevTests) => {
      const newTestsArray = [...prevTests];
      newTestsArray.splice(index, 1);
      return [...newTestsArray];
    });

    setTestsTouched((prevTestsTouched) => {
      const newTestsTouched = [...prevTestsTouched];
      newTestsTouched.splice(index, 1);
      return newTestsTouched;
    });
  };

  const sequenceNumberChangedHandler = (e: any) => {
    setSequenceNumber(e.target.value);
  };

  const sequenceNumberBlurHandler = (e: any) => {
    setSequenceNumberTouched(true);
  };

  const titleChangedHandler = (e: any) => {
    setTitle(e.target.value);
  };

  const titleBlurHandler = (e: any) => {
    setTitleTouched(true);
  };

  const descriptionChangedHandler = (e: any) => {
    setDescription(e.target.value);
  };

  const descriptionBlurHandler = (e: any) => {
    setDescriptionTouched(true);
  };

  const testChangedHandler = (e: any, index: number) => {
    setTests((prevTests) => {
      const newTests = [...prevTests];
      newTests[index] = e.target.value;
      return newTests;
    });
  };

  const testBlurHandler = (index: number) => {
    setTestsTouched((prevTestsTouched) => {
      const newTestsTouched = [...prevTestsTouched];
      newTestsTouched[index] = true;
      return newTestsTouched;
    });
  };

  const priorityChangedHandler = (e: any) => {
    setPriority(e.target.value);
  };

  const priorityBlurHandler = (e: any) => {
    setPriorityTouched(true);
  };

  const businessValueChangedHandler = (e: any) => {
    setBusinessValue(e.target.value);
  };

  const businessValueBlurHandler = (e: any) => {
    setBusinessValueTouched(true);
  };

  const resetInputs = () => {
    // set inputs to default values
    setSequenceNumber("");
    setTitle("");
    setDescription("");
    setTests([""]);
    setPriority("");
    setBusinessValue("");

    // set touch states values back to default
    setSequenceNumberTouched(false);
    setTitleTouched(false);
    setDescriptionTouched(false);
    setTestsTouched([false]);
    setPriorityTouched(false);
    setBusinessValueTouched(false);
  };

  // handle submit
  const submitFormHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSequenceNumberTouched(true);
    setTitleTouched(true);
    setDescriptionTouched(true);
    setTestsTouched((prevTestsTouched) => {
      const newTestsTouched = [...prevTestsTouched];
      newTestsTouched.fill(true);
      return newTestsTouched;
    });
    setPriorityTouched(true);
    setBusinessValueTouched(true);

    // display error msg if form is invalid
    if (!formIsValid) {
      setInvalidFormMessage("Make sure to fill out all required fields."); // TODO there is no need for this now
      toast.error("Make sure to properly fill out all required fields.");
      return;
    }
    setInvalidFormMessage("");

    const newStory: StoryData = {
      sequenceNumber: parseInt(sequenceNumber),
      title,
      description,
      tests,
      priority: parseInt(priority),
      businessValue: parseInt(businessValue),
      projectID,
      userId,
      category: 0,
      timeComplexity: 0,
      isRealized: false,
      tasks: []
    };

    // console.log(newStory);

    // send to backend
    dispatch(createStory(newStory));
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
                  isInvalid={sequenceNumberInvalid}
                  placeholder="Enter #"
                  name="sequenceNumber"
                  value={sequenceNumber}
                  onChange={sequenceNumberChangedHandler}
                  onBlur={sequenceNumberBlurHandler}
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
                  isInvalid={titleInvalid}
                  placeholder="Add story title"
                  name="title"
                  value={title}
                  onChange={titleChangedHandler}
                  onBlur={titleBlurHandler}
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
              onChange={descriptionChangedHandler}
              onBlur={descriptionBlurHandler}
              isInvalid={descriptionInvalid}
            />
          </Form.Group>

          <Form.Group
            className={`mb-3 ${classes.testsGroup}`}
            controlId="form-tests"
          >
            <Form.Label>Tests</Form.Label>

            <Form.Group className="mb-3" controlId="form-tests">
              {tests.map((input, index) => (
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
                          testChangedHandler(e, index);
                        }}
                        onBlur={() => testBlurHandler(index)}
                        isInvalid={testsInvalid[index]}
                      />
                    </Col>
                    <Col xs="12" md="3">
                      {tests.length > 1 && (
                        <Button
                          variant="link"
                          type="button"
                          onClick={() => removeInputHandler(index)}
                        >
                          Remove test
                        </Button>
                      )}
                    </Col>
                  </Row>
                </Form.Group>
              ))}
            </Form.Group>
            <Form.Text className="text-secondary d-block mb-3">
              Make sure all the test fields you add are filled in.
            </Form.Text>
            <Button
              variant="outline-primary"
              type="button"
              onClick={addInputHandler}
              className="mb-1"
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
                  onChange={priorityChangedHandler}
                  onBlur={priorityBlurHandler}
                  isInvalid={priorityInvalid}
                  value={priority}
                  name="priority"
                  placeholder="Select priority"
                >
                  <option value="">Select story priority</option>
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
                  isInvalid={businessValueInvalid}
                  placeholder="Enter business value"
                  name="businessValue"
                  value={businessValue}
                  onChange={businessValueChangedHandler}
                  onBlur={businessValueBlurHandler}
                  type="number"
                />
                <Form.Text className="text-secondary">
                  Enter a number between 1 and 10.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          {/* {invalidFormMessage !== "" && (
            <Alert variant={"danger"}>{invalidFormMessage}</Alert>
          )}
          {invalidFormMessage === "" &&
            storyState.isError &&
            !storyState.isLoading && (
              <Alert variant={"danger"}>{storyState.message}</Alert>
            )}
          {invalidFormMessage === "" &&
            storyState.isSuccess &&
            !storyState.isLoading &&
            <Alert variant={"success"}>{storyState.message}</Alert>} */}
          <Button variant="primary" type="submit" size="lg">
            Add story
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default AddStory;
