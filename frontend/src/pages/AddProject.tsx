import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { parseJwt } from "../helpers/helpers";
import { getAllUsers } from "../features/users/userSlice";
import { ProjectData } from "../classes/projectData";
import { createProject } from "../features/projects/projectSlice";
import ProjectForm from "../components/ProjectForm";

const AddProject = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const projectState = useAppSelector((state) => state.projects);
  const { users, isAdmin } = useAppSelector((state) => state.users);

  useEffect(() => {
    if (localStorage.getItem("user") == null) {
      navigate("/login");
      return;
    }

    const token = JSON.parse(localStorage.getItem("user")!).token;
    const isAdmin = parseJwt(token).isAdmin;
    // console.log(isAdmin);

    if (!isAdmin) {
      navigate("/");
      return;
    }

    dispatch(getAllUsers());
  }, [isAdmin]);

  const submitAddProject = (newProject: ProjectData) => {
    console.log("PARENT ADD PROJECT");
    dispatch(createProject(newProject));
  };

  return (
    <ProjectForm
      formTitle="Add project"
      users={users}
      userRoles={[]}
      isEdit={false}
      projectNameInit=""
      projectDescriptionInit=""
      productOwnerIDInit=""
      scrumMasterIDInit=""
      developersInit={[""]}
      projectState={projectState}
      handleSubmitForm={submitAddProject}
    />
  );
};

export default AddProject;
