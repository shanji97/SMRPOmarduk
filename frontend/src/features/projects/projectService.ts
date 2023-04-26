import axios from "axios";
import { ProjectData, ProjectDataEdit } from "../../classes/projectData";
import { getBaseUrl } from "../../helpers/helpers";


const PROJECTS_API_URL = `${getBaseUrl()}/api/project`;
// const PROJECTS_API_URL = `http://localhost:3000/api/project`;


const create = async (projectData: ProjectData, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const response = await axios.post(`${PROJECTS_API_URL}`, projectData, config);

    return response.data;
}

const getAllProjects = async (token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }
    const response = await axios.get(`${PROJECTS_API_URL}/with-data`, config);

    return response.data;
}

const getProjectUserRoles = async (id: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }
    const response = await axios.get(`${PROJECTS_API_URL}/${id}/user`, config);

    return response.data;
}

const editProject = async (projectData: ProjectDataEdit, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    let projectID = projectData.id;
    delete projectData.id;
    // console.log("BEFORE CALL: ", projectData)

    const response = await axios.patch(`${PROJECTS_API_URL}/${projectID}`, projectData, config);
    return response.data;
}

const activateProject = async (projectId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const response = await axios.patch(`${PROJECTS_API_URL}/${projectId}/set-active`, {}, config);
    return response.data;
}

const getActiveProject = async (token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const response = await axios.get(`${PROJECTS_API_URL}/active`, config);
    return response.data;
}

const projectService = {
    create,
    getAllProjects,
    editProject,
    activateProject,
    getActiveProject,
    getProjectUserRoles
}

export default projectService;
