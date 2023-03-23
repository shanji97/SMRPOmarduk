import axios from "axios";
import { StoryData } from "../../classes/storyData";

const STORY_API_URL = 'http://localhost:3000/api/story';

const create = async (storyData: StoryData, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const response = await axios.post(`${STORY_API_URL}`, storyData, config);

    return response.data;
}

const storyService = {
    create
}

export default storyService;
