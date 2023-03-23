import axios from "axios";
import { ProjectData } from "../../classes/projectData";


const PROJECTS_API_URL = `${window.location.protocol}//${window.location.hostname}/api/project`;


const create = async (projectData: ProjectData, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const response = await axios.post(`${PROJECTS_API_URL}`, projectData, config);

    return response.data;
}

const userService = {
create
}

export default userService;
