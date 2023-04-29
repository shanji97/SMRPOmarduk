import axios from "axios";
import { getBaseUrl } from "../../helpers/helpers";
import { SprintBody, StorySprint } from "../../classes/sprintData";

const SPRINTS_API_URL = `${getBaseUrl()}/api/sprint`;

const createSprint = async (sprintBody: SprintBody, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const newSprint = {
        name: sprintBody.name,
        velocity: sprintBody.velocity,
        startDate: sprintBody.startDate,
        endDate: sprintBody.endDate
    }

    const response = await axios.post(`${SPRINTS_API_URL}/${sprintBody.projectId}`, newSprint, config);
    return response.data;
}

const addStoryToSprint = async (storySprint: StorySprint, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const sprintToStory = {
        sprintId: storySprint.sprintId,
        storyId: storySprint.storyId
    }

    const response = await axios.post(`${SPRINTS_API_URL}/${storySprint.sprintId}/add-story/${storySprint.storyId}`, sprintToStory, config);
    return response.data;
}

const updateSprint = async (sprintBody: SprintBody, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const updatedSprint = {
        name: sprintBody.name,
        velocity: sprintBody.velocity,
        startDate: sprintBody.startDate,
        endDate: sprintBody.endDate
    }

    const response = await axios.patch(`${SPRINTS_API_URL}/${sprintBody.id}`, updatedSprint, config);
    return response.data;
}

const getAllSprints = async (projectId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const response = await axios.get(`${SPRINTS_API_URL}/project/${projectId}`, config);
    return response.data;
}

const getActiveSprint = async (projectId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const response = await axios.get(`${SPRINTS_API_URL}/project/${projectId}/active`, config);
    return response.data;
}

const deleteSprint = async (sprintId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const response = await axios.delete(`${SPRINTS_API_URL}/${sprintId}`, config);
    return response.data;
}


const sprintService = {
    createSprint,
    getAllSprints,
    getActiveSprint,
    updateSprint,
    deleteSprint,
    addStoryToSprint,
    
}

export default sprintService;
