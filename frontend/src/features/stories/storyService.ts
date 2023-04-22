import axios from "axios";
import { StoryData, UpdateStoryCategory } from "../../classes/storyData";
import { getBaseUrl } from "../../helpers/helpers";


const STORY_API_URL = `${getBaseUrl()}/api/story`;

// const STORY_API_URL = `http://localhost:3000/api/story`;

const getAllStory = async (token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const response = await axios.get(`${STORY_API_URL}`, config);

    return response.data;
}


const create = async (storyData: StoryData, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }
    let projectID = storyData.projectID;
    delete storyData.projectID;

    // console.log(storyData);

    const response = await axios.post(`${STORY_API_URL}/${projectID}`, storyData, config);

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

    const response = await axios.patch(`${STORY_API_URL}/${updateStoryCategory.id}/category`, updatedCategory, config);
    return response.data;
}


const storyService = {
    create,
    getAllStory,
    deleteStory,
    updateStoryCategory
}

export default storyService;
