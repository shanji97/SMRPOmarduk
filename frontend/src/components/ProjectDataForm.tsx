import { Fragment, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { Form } from "react-bootstrap";

import classes from "./ProjectDataForm.module.css";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { parseJwt } from "../helpers/helpers";
import {
  editProject,
  getAllProjects,
  reset,
} from "../features/projects/projectSlice";
import { toast } from "react-toastify";

interface ProjectProps {
  idInit?: string;
  projectNameInit: string;
  projectDescriptionInit?: string;
  closeModal: () => void;
}

const ProjectDataForm: React.FC<ProjectProps> = ({
  idInit,
  projectNameInit,
  projectDescriptionInit,
  closeModal,
}) => {
  const dispatch = useAppDispatch();

  const { isLoading, isError, isEditSuccess, message } = useAppSelector(
    (state) => state.projects
  );
  // alerts for errors/success
  useEffect(() => {
    if (isEditSuccess && !isLoading && formIsValid) {
      toast.success("Changes successfully saved!");
      dispatch(reset());
      dispatch(getAllProjects());
      closeModal();
    }
    if (isError && !isLoading) {
      toast.error(message);
      dispatch(reset());
      dispatch(getAllProjects());
    }
  }, [isEditSuccess, isError, isLoading]);

  // if project name wasn't changed due to error, set it to the initial one
  useEffect(() => {
    if (projectName !== projectNameInit) {
      setProjectName(projectNameInit);
    }
  }, [isError]);

  const [projectName, setProjectName] = useState(projectNameInit);
  const [projectDescription, setProjectDescription] = useState(
    projectDescriptionInit ? projectDescriptionInit : ""
  );

  // console.log(projectName, projectDescription);

  const [projectNameTouched, setProjectNameTouched] = useState(false);

  const enteredNameValid = projectName.trim() !== "";
  const nameInputInvalid = projectNameTouched && !enteredNameValid;

  const formIsValid = enteredNameValid;

  const projectNameChangedHandler = (e: any) => {
    setProjectName(e.target.value);
  };

  const projectNameBlurHandler = (e: any) => {
    setProjectNameTouched(true);
  };

  const projectDescriptionChangedHandler = (e: any) => {
    setProjectDescription(e.target.value);
  };

  const submitFormHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setProjectNameTouched(true);

    // display error msg if form is invalid
    if (!formIsValid) {
      toast.error("Make sure to properly fill out all required fields.");
      return;
    }

    // get user data
    // TODO change?
    const token = JSON.parse(localStorage.getItem("user")!).token;
    const id = parseJwt(token).sid;

    const updatedProject: any = {
      id: idInit,
      userId: id,
      projectName: projectName.trim(),
      projectDescription: projectDescription.trim(),
    };

    dispatch(editProject(updatedProject));
  };

  return (
    <Fragment>
      <h1 className={`${classes.cardHeading} text-primary`}>Edit project</h1>

      <Form onSubmit={submitFormHandler}>
        <Form.Group className="mb-3" controlId="form-title">
          <Form.Label>Project name</Form.Label>
          <Form.Control
            placeholder="Add project name"
            name="projectName"
            value={projectName}
            onChange={projectNameChangedHandler}
            onBlur={projectNameBlurHandler}
            isInvalid={nameInputInvalid}
          />
          <Form.Text>Add a unique project name.</Form.Text>
        </Form.Group>

        <Form.Group className="mb-4 mt-3" controlId="form-description">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={6}
            placeholder="Add project description"
            name="projectDescription"
            value={projectDescription}
            onChange={projectDescriptionChangedHandler}
          />
        </Form.Group>
        <Button variant="primary" type="submit" size="lg" disabled={false}>
          Add project
        </Button>
      </Form>
    </Fragment>
  );
};

export default ProjectDataForm;
