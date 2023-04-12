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

  useEffect(() => {
    dispatch(getAllProjects());
  }, []);

  const redirectToAddStory = (projectID: any) => {
    navigate(`/${projectID}/add-story`);
  };

  return (
    <Fragment>
      <Card style={{ width: "70%", marginTop: "1rem" }}>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Project name</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, i) => {
              return (
                <tr key={i}>
                  <td>
                    <div className={classes.usernameContainer}>
                      {project.projectName}
                      <button onClick={() => redirectToAddStory(project.id)}>
                        {" "}
                        Add story
                      </button>
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
