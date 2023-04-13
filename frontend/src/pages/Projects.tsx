import {
  DropdownButton,
  Table,
  Dropdown,
  Modal,
  Form,
  Button,
} from "react-bootstrap";
import { Check, PencilFill, TrashFill, X } from "react-bootstrap-icons";
import Card from "../components/Card";
import React, { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddUser from "./AddUser";

import classes from "./Users.module.css";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { deleteUser, getAllUsers } from "../features/users/userSlice";
import { parseJwt } from "../helpers/helpers";
import { toast } from "react-toastify";
import { getAllProjects } from "../features/projects/projectSlice";

const Projects = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  let { projects } = useAppSelector((state) => state.projects);
  console.log(projects);

  // store isAdmin in state for now
  // TODO rewrite this later
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("user") == null) {
      navigate("/login");
      return;
    }

    const token = JSON.parse(localStorage.getItem("user")!).token;
    setIsAdmin(parseJwt(token).isAdmin);
    // console.log(isAdmin);

    dispatch(getAllProjects());
  }, [isAdmin]);

  const redirectToAddStory = (projectID: any) => {
    navigate(`/${projectID}/add-story`);
  };

  const redirectToAddSprint = (projectID: any) => {
    navigate(`/${projectID}/add-sprint`);
  };

  return (
    <Fragment>
      <Card style={{ width: "70%", marginTop: "1rem" }}>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Project name</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, i) => {
              return (
                <tr key={i}>
                  <td>{project.id}</td>
                  <td>
                    <div className={classes.usernameContainer}>
                      {project.projectName}
                      {/* <button onClick={() => redirectToAddStory(project.id)}>
                        {" "}
                        Add story
                      </button> */}
                      <Button
                        variant="primary"
                        type="button"
                        onClick={() => redirectToAddStory(project.id)}
                      >
                        Add story
                      </Button>
                      <Button
                        variant="primary"
                        type="button"
                        onClick={() => redirectToAddSprint(project.id)}
                      >
                        Add sprint
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </Fragment>
  );
};

export default Projects;
