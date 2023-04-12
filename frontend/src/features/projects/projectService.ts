import axios from "axios";
import { ProjectData } from "../../classes/projectData";
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
    const response = await axios.get(`${PROJECTS_API_URL}`, config);
    console.log(response.data)

    return response.data;
}

const userService = {
    create,
    getAllProjects
}

export default userService;
