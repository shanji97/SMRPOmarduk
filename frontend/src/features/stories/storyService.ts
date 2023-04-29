import axios from "axios";
import { RejectStory, StoryData, UpdateStoryCategory, UpdateTimeComplexity } from "../../classes/storyData";
import { getBaseUrl } from "../../helpers/helpers";


const STORY_API_URL = `${getBaseUrl()}/api/story`;
const SPRINTS_API_URL = `${getBaseUrl()}/api/sprint`;

// const STORY_API_URL = `http://localhost:3000/api/story`;

const getAllStoryById = async (projectId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const response = await axios.get(`${STORY_API_URL}/${projectId}/stories-by-project`, config);

    return response.data;
}

const getStoriesForSprint = async (sprintId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const response = await axios.get(`${SPRINTS_API_URL}/${sprintId}/story`, config);

    return response.data;
}

const getStoriesForUser = async (token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const response = await axios.get(`${STORY_API_URL}/user`, config);

    return response.data;
}


const create = async (storyData: StoryData, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }
    
    const createStoryData = {
        title:  storyData.title,
        description:  storyData.description,
        tests: storyData.tests,
        priority:  storyData.priority,
        businessValue:     storyData.businessValue,
        sequenceNumber: storyData.sequenceNumber,
    
    }
    // console.log(storyData);

    const response = await axios.post(`${STORY_API_URL}/${storyData.projectID}`, createStoryData, config);

    return response.data;
}

const editStory = async (storyData: StoryData, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const editStoryData = {
        title:  storyData.title,
        description:  storyData.description,
        tests: storyData.tests,
        priority:  storyData.priority,
        businessValue:     storyData.businessValue,
        sequenceNumber: storyData.sequenceNumber,
    
    }


    const response = await axios.patch(`${STORY_API_URL}/${storyData.id}/update`, editStoryData, config);

    return response.data;
}

const deleteStory = async (storyId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }
    const response = await axios.delete(`${STORY_API_URL}/${storyId}`, config);

    return response.data;
}

const updateStoryCategory = async (updateStoryCategory: UpdateStoryCategory, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const updatedCategory = {
        category: updateStoryCategory.category,
        projectId: updateStoryCategory.projectId
    }

    const response = await axios.patch(`${STORY_API_URL}/${updateStoryCategory.storyId}/category`, updatedCategory, config);
    return response.data;
}

const updateTimeComplexity = async (updateTimeComplexity: UpdateTimeComplexity, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const updatedTimeComplexity = {
        timeComplexity: updateTimeComplexity.timeComplexity,

    }

    const response = await axios.patch(`${STORY_API_URL}/${updateTimeComplexity.storyId}/time-complexity`, updatedTimeComplexity, config);
    return response.data;
}
const confirmStory = async (storyId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }
    const response = await axios.patch(`${STORY_API_URL}/${storyId}/confirm`, storyId, config);
    return response.data;
}
const rejectStory = async (rejectStory: RejectStory, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const updatedRejectStory = {
        description: rejectStory.description,
    }

    const response = await axios.patch(`${STORY_API_URL}/${rejectStory.storyId}/reject`, updatedRejectStory, config);
    return response.data;
}

const storyService = {
    create,
    getAllStoryById,
    getStoriesForSprint,
    deleteStory,
    updateStoryCategory,
    editStory,
    updateTimeComplexity,
    rejectStory,
    getStoriesForUser,
    confirmStory
}

export default storyService;
