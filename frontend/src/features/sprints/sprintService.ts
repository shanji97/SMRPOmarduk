import axios from "axios";
import { getBaseUrl } from "../../helpers/helpers";
import { SprintBody } from "../../classes/sprintData";

const SPRINTS_API_URL = `${getBaseUrl()}/api/sprint`;

const createSprint = async (sprintBody: SprintBody, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const a = {
        name: sprintBody.name,
        velocity: sprintBody.velocity,
        startDate: sprintBody.startDate,
        endDate: sprintBody.endDate
    }

    const response = await axios.post(`${SPRINTS_API_URL}/${sprintBody.projectId}`, a, config);
    return response.data;
}

const getAllSprints = async (projectId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const response = await axios.get(`${SPRINTS_API_URL}/project/${projectId}`, config); // TODO fix endpoint
    return response.data;
}

const sprintService = {
    createSprint,
    getAllSprints,
}

export default sprintService;
