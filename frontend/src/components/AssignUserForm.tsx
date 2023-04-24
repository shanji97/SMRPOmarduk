import { Fragment, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import Card from "./Card";
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
import { assignUser, createTask, reset } from "../features/tasks/taskSlice";

// for testing
const userRoles = [
  { userId: 2, role: 0 },
  { userId: 3, role: 0 },
  { userId: 3, role: 1 },
  { userId: 4, role: 0 },
  { userId: 9, role: 2 },
];

interface AssignUserProps {
  id: string;
  assignedUserIdInit: string;
}

const AssignUserForm: React.FC<AssignUserProps> = ({
  id,
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

  useEffect(() => {
    if (isSuccess && !isLoading) {
      toast.success("User successfully changed!");
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

  const [assignedUserId, setAssignedUserId] = useState(assignedUserIdInit);

  const [developersOnProject, setDevelopersOnProject] = useState<string[]>([]);

  const [assignedUserIdTouched, setAssignedUserIdTouchedTouched] =
    useState(false);

  const enteredAssignedUserIdValid = true;

  const assignedUserIdInvalid =
    assignedUserIdTouched && !enteredAssignedUserIdValid;

  const formIsValid = enteredAssignedUserIdValid;

  const assignedUserIdChangedHandler = (e: any) => {
    setAssignedUserId(e.target.value);
  };

  const assignedUserIdBlurHandler = (e: any) => {
    setAssignedUserIdTouchedTouched(true);
  };

  const resetInputs = () => {
    // set inputs to default values
    setAssignedUserId("");
    // set touch states values back to default
    setAssignedUserIdTouchedTouched(false);
  };

  // utility function, takes in user id and returns username
  const displayUsername = (member: string) => {
    let u = users.filter((user) => {
      return user.id?.toString() === member;
    });
    return u[0] ? u[0].username : ""; // TODO handle this better
  };

  const handleSubmit = () => {
    setAssignedUserIdTouchedTouched(true);

    // display error msg if form is invalid
    if (!formIsValid) {
      toast.error("Make sure to properly fill out all required fields.");
      return;
    }

    const assignedUserData: any = {
      taskId: id,
      userId: assignedUserId,
    };
    console.log(assignedUserData);
    dispatch(assignUser(assignedUserData));
  };

  return (
    <Modal show={true}>
      <Modal.Header closeButton>
        <Modal.Title>Assign User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Select user to work on task</Form.Label>
            <Form.Select
              className="w-75"
              value={assignedUserId}
              onChange={(e) => {
                assignedUserIdChangedHandler(e);
              }}
              onBlur={assignedUserIdBlurHandler}
              isInvalid={assignedUserIdInvalid}
              // disabled={users.length < developers.length + 2}
            >
              <option key={-1} value={""}>
                Select developer
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
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="default">Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignUserForm;
