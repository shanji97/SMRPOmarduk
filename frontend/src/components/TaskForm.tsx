import { Fragment, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import Card from "../components/Card";
import { Form } from "react-bootstrap";

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
import {
  getProject,
  setActiveProject,
} from "../features/projects/projectSlice";
import { parseJwt } from "../helpers/helpers";
import { getAllUsers } from "../features/users/userSlice";
import { createTask, reset } from "../features/tasks/taskSlice";

// for testing
const userRoles = [
  { userId: 2, role: 0 },
  { userId: 3, role: 0 },
  { userId: 3, role: 1 },
  { userId: 4, role: 0 },
  { userId: 9, role: 2 },
];

interface TaskProps {
  id?: string;
  storyId: number;
  isEdit: boolean;
  descriptionInit: string;
  timeRequiredInit: string; // 'remaining' on backend
  assignedUserIdInit: string;
}

const TaskForm: React.FC<TaskProps> = ({
  id,
  storyId,
  isEdit,
  descriptionInit,
  timeRequiredInit,
  assignedUserIdInit,
}) => {
  const dispatch = useAppDispatch();
  let { isSuccess, isError, isLoading, message } = useAppSelector(
    (state) => state.tasks
  );
  const { activeProject } = useAppSelector((state) => state.projects);
  const { users } = useAppSelector((state) => state.users);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getAllUsers());
  }, []);

  useEffect(() => {
    setDevelopersOnProject([]);
    userRoles.forEach((user: any) => {
      if (user.role === 0) {
        setDevelopersOnProject((prevDevelopers) => {
          const newDevelopers = [...prevDevelopers];
          newDevelopers.push(user.userId.toString());
          return newDevelopers;
        });
      }
    });
  }, []);

  // NOTE: this is temporary, waiting for other cards to be finished
  const { storyID } = useParams();

  useEffect(() => {
    if (isSuccess && !isLoading) {
      toast.success(
        isEdit ? "Task successfully updated!" : "Task successfully created!"
      );
      resetInputs();
      dispatch(reset());
      // dispatch(getAllStory);
      // closeModal();
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
  const [assignedUserId, setAssignedUserId] = useState(assignedUserIdInit);

  const [developersOnProject, setDevelopersOnProject] = useState<string[]>([]);

  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const [timeRequiredTouched, setTimeRequiredTouched] = useState(false);
  const [assignedUserIdTouched, setAssignedUserIdTouchedTouched] =
    useState(false);

  const enteredDescriptionValid = description.trim() !== "";
  const enteredTimeRequiredValid =
    parseInt(timeRequired) > 0 &&
    parseInt(timeRequired) < 100 &&
    timeRequired.trim() !== ""; // TODO check for absurd numbers
  const enteredAssignedUserIdValid = true;

  const descriptionInvalid = descriptionTouched && !enteredDescriptionValid;
  const timeRequiredInvalid = timeRequiredTouched && !enteredTimeRequiredValid;
  const assignedUserIdInvalid =
    assignedUserIdTouched && !enteredAssignedUserIdValid;

  const formIsValid =
    enteredDescriptionValid &&
    enteredAssignedUserIdValid &&
    enteredTimeRequiredValid;

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

  const assignedUserIdChangedHandler = (e: any) => {
    setAssignedUserId(e.target.value);
  };

  const assignedUserIdBlurHandler = (e: any) => {
    setAssignedUserIdTouchedTouched(true);
  };

  const resetInputs = () => {
    // set inputs to default values
    setDescription("");
    setTimeRequired("");
    setAssignedUserId("");

    // set touch states values back to default
    setDescriptionTouched(false);
    setTimeRequiredTouched(false);
    setAssignedUserIdTouchedTouched(false);
  };

  // handle submit
  const submitFormHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setDescriptionTouched(true);
    setTimeRequiredTouched(true);
    setAssignedUserIdTouchedTouched(true);

    // display error msg if form is invalid
    if (!formIsValid) {
      toast.error("Make sure to properly fill out all required fields.");
      return;
    }

    if (isEdit) {
      const updatedTask: any = {
        id: id,
        storyId: storyId,
        name: description,
        remaining: timeRequired,
        assignedUserId: assignedUserId,
      };
      console.log(updatedTask);
      //   dispatch(editTask(updatedTask));
    } else {
      const newTask: any = {
        // storyId: storyId,
        storyId: storyID,
        name: description,
        remaining: timeRequired,
        // assignedUserId: assignedUserId, TODO
      };
      console.log(newTask);
      dispatch(createTask(newTask));
    }
  };

  // utility function, takes in user id and returns username
  const displayUsername = (member: string) => {
    let u = users.filter((user) => {
      return user.id?.toString() === member;
    });
    return u[0] ? u[0].username : ""; // TODO handle this better
  };

  return (
    <Card>
      <Form onSubmit={submitFormHandler}>
        <Row>
          <Col>
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
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group className="mb-1" controlId="form-business-value">
              <Form.Label>Time required</Form.Label>
              <Form.Control
                isInvalid={timeRequiredInvalid}
                placeholder="Enter time in hours"
                name="sequenceNumber"
                value={timeRequired}
                onChange={timeRequiredChangedHandler}
                onBlur={timeRequiredBlurHandler}
                type="number"
              />
              <Form.Text className="text-secondary">
                Enter time in hours.
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>
        <Form.Group>
          <Form.Label>Assign task</Form.Label>
          <Row className="mb-3">
            <Col>
              <Form.Select
                value={assignedUserId}
                onChange={(e) => {
                  assignedUserIdChangedHandler(e);
                }}
                onBlur={assignedUserIdBlurHandler}
                isInvalid={assignedUserIdInvalid}
                // disabled={users.length < developers.length + 2}
              >
                <option key={-1} value={""}>
                  Select developer (optional)
                </option>
                {developersOnProject.map((userId) => {
                  {
                    return (
                      <option key={userId} value={userId}>
                        {displayUsername(userId)}
                      </option>
                    );
                  }
                  return null;
                })}
              </Form.Select>
            </Col>
          </Row>
        </Form.Group>
        <Button variant="primary" type="submit" size="lg">
          {isEdit ? "Update task" : "Add task"}
        </Button>
      </Form>
    </Card>
  );
};

export default TaskForm;
