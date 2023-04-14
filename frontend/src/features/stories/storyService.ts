import axios from "axios";
import { StoryData } from "../../classes/storyData";
import { getBaseUrl } from "../../helpers/helpers";


const STORY_API_URL = `${getBaseUrl()}/api/story`;

// const STORY_API_URL = `http://localhost:3000/api/story`;

const create = async (storyData: StoryData, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }
    let projectID = storyData.projectID;
    delete storyData.projectID;

    // console.log(storyData);

    const response = await axios.post(`${STORY_API_URL}/${projectID}/add-story`, storyData, config);

    return response.data;
}

const storyService = {
    create
}

export default storyService;
