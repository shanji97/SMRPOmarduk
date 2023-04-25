import { Fragment, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import Card from "../components/Card";
import { Form, Modal } from "react-bootstrap";

import classes from "./StoryForm.module.css";

import { StoryData } from "../classes/storyData";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  createStory,
  editStory,
  getAllStory,
} from "../features/stories/storySlice";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { parseJwt } from "../helpers/helpers";
import { getAllUsers } from "../features/users/userSlice";
import {
  createTask,
  editTask,
  getTasksForSprint,
  reset,
} from "../features/tasks/taskSlice";

// for testing
const userRoles = [
  { userId: 2, role: 0 },
  { userId: 3, role: 0 },
  { userId: 3, role: 1 },
  { userId: 4, role: 0 },
  { userId: 9, role: 2 },
];

interface EditTaskProps {
  id: string;
  descriptionInit: string;
  timeRequiredInit: string; // 'remaining' on backend
  showModal: boolean;
  closeModal: () => void;
}

const EditTaskForm: React.FC<EditTaskProps> = ({
  id,
  descriptionInit,
  timeRequiredInit,
  showModal,
  closeModal,
}) => {
  const dispatch = useAppDispatch();
  let { isSuccess, isError, isLoading, message } = useAppSelector(
    (state) => state.tasks
  );
  const { activeProject } = useAppSelector((state) => state.projects);
  let { activeSprint } = useAppSelector((state) => state.sprints);
  const { users } = useAppSelector((state) => state.users);
  const navigate = useNavigate();

  // NOTE: this is temporary, waiting for other cards to be finished
  const { storyID } = useParams();

  useEffect(() => {
    if (isSuccess && !isLoading) {
      toast.success("Task successfully updated!");
      resetInputs();
      dispatch(reset());
      if (activeSprint != undefined) {
        dispatch(getTasksForSprint(activeSprint.id!));
      }
      closeModal();
    }
    if (isError && !isLoading) {
      toast.error(message);
    }
  }, [isSuccess, isError, isLoading]);

  // TODO
  // this is temporary - checks if user is product owner or scrum master
  // if not, it redirects them to '/'
  //   useEffect(() => {
  //     if (projectsState.userRoles.length > 0) {
  //       const token = JSON.parse(localStorage.getItem("user")!).token;
  //       const uid = parseJwt(token).sid;
  //       setUserId(uid);

  //       let userAllowedToAddStories = false;

  //       projectsState.userRoles.forEach((user) => {
  //         if (user.userId === uid && user.role > 0) {
  //           userAllowedToAddStories = true;
  //           // console.log("userAllowedToAddStories");
  //         }
  //       });

  //       if (!userAllowedToAddStories) {
  //         navigate("/");
  //         return;
  //       }
  //     }
  //   }, [projectsState.userRoles]);

  const [description, setDescription] = useState(descriptionInit);
  const [timeRequired, setTimeRequired] = useState(timeRequiredInit);

  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const [timeRequiredTouched, setTimeRequiredTouched] = useState(false);

  const enteredDescriptionValid = description.trim() !== "";
  const enteredTimeRequiredValid =
    +timeRequired > 0 && +timeRequired < 100 && timeRequired.trim() !== ""; // TODO check for absurd numbers

  const descriptionInvalid = descriptionTouched && !enteredDescriptionValid;
  const timeRequiredInvalid = timeRequiredTouched && !enteredTimeRequiredValid;

  const formIsValid = enteredDescriptionValid && enteredTimeRequiredValid;

  const descriptionChangedHandler = (e: any) => {
    setDescription(e.target.value);
  };

  const descriptionBlurHandler = (e: any) => {
    setDescriptionTouched(true);
  };

  const timeRequiredChangedHandler = (e: any) => {
    setTimeRequired(e.target.value);
  };

  const timeRequiredBlurHandler = (e: any) => {
    setTimeRequiredTouched(true);
  };

  const resetInputs = () => {
    // set inputs to default values
    setDescription("");
    setTimeRequired("");

    // set touch states values back to default
    setDescriptionTouched(false);
    setTimeRequiredTouched(false);
  };

  // handle submit
  const handleSubmit = () => {
    setDescriptionTouched(true);
    setTimeRequiredTouched(true);

    // display error msg if form is invalid
    if (!formIsValid) {
      toast.error("Make sure to properly fill out all required fields.");
      return;
    }

    const updatedTask: any = {
      id: id,
      name: description,
      remaining: timeRequired,
    };
    console.log(updatedTask);
    dispatch(editTask(updatedTask));
  };

  // utility function, takes in user id and returns username
  const displayUsername = (member: string) => {
    let u = users.filter((user) => {
      return user.id?.toString() === member;
    });
    return u[0] ? u[0].username : ""; // TODO handle this better
  };

  return (
    <Modal show={showModal} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>Edit task</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-1" controlId="form-business-value">
            <Form.Label>Time required (hrs)</Form.Label>
            <Form.Control
              className="w-25"
              isInvalid={timeRequiredInvalid}
              placeholder="Enter time in hours"
              name="sequenceNumber"
              value={timeRequired}
              onChange={timeRequiredChangedHandler}
              onBlur={timeRequiredBlurHandler}
              type="number"
            />
          </Form.Group>
          <Form.Group className="mb-4" controlId="form-description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Add story description"
              name="description"
              value={description}
              onChange={descriptionChangedHandler}
              onBlur={descriptionBlurHandler}
              isInvalid={descriptionInvalid}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="default" onClick={closeModal}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Update task
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditTaskForm;
