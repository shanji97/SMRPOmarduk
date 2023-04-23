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
import {
  getProject,
  setActiveProject,
} from "../features/projects/projectSlice";
import { parseJwt } from "../helpers/helpers";
import { getAllUsers } from "../features/users/userSlice";
import { createTask, deleteTask, reset } from "../features/tasks/taskSlice";

interface DeleteTaskProps {
  id?: string;
}

const EditTaskForm: React.FC<DeleteTaskProps> = ({ id }) => {
  const dispatch = useAppDispatch();
  let { isSuccess, isError, isLoading, message } = useAppSelector(
    (state) => state.tasks
  );
  const { activeProject } = useAppSelector((state) => state.projects);
  const { users } = useAppSelector((state) => state.users);
  const navigate = useNavigate();

  // NOTE: this is temporary, waiting for other cards to be finished
  const { storyID } = useParams();

  useEffect(() => {
    if (isSuccess && !isLoading) {
      toast.info("Task successfully deleted!");
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

  const handleSubmit = () => {
    console.log(id);
    dispatch(deleteTask(String(id)));
  };

  // utility function, takes in user id and returns username
  const displayUsername = (member: string) => {
    let u = users.filter((user) => {
      return user.id?.toString() === member;
    });
    return u[0] ? u[0].username : ""; // TODO handle this better
  };

  return (
    <Modal show={true}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Confirmation</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to delete this task?</Modal.Body>
      <Modal.Footer>
        <Button variant="default">Cancel</Button>
        <Button variant="danger" onClick={handleSubmit}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditTaskForm;
