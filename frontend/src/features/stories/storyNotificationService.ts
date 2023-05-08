import axios from "axios";
import { NotificationData, RejectStory, StoryData, UpdateStoryCategory, UpdateTimeComplexity } from "../../classes/storyData";
import { getBaseUrl } from "../../helpers/helpers";


const STORY_API_URL = `${getBaseUrl()}/api/story`;
const NOTIFICATION_API_URL = `${getBaseUrl()}/api/notification`;


// const STORY_API_URL = `http://localhost:3000/api/story`;

const createNotification = async (notificationData: NotificationData, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const createStoryData = {
        description:  notificationData.description,
    }
    // console.log(storyData);

    const response = await axios.post(`${STORY_API_URL}/${notificationData.storyId}/notification/new`, createStoryData, config);

    return response.data;
}
const getNotifications = async (storyId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const response = await axios.get(`${STORY_API_URL}/${storyId}/notifications/information`, config);

    return response.data;
}
const getrejectionNotification = async (storyId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

   
    const response = await axios.get(`${NOTIFICATION_API_URL}/${storyId}/reject`, config);
    return response.data;
}
const approveNotification = async (NotificationId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

   
    const response = await axios.patch(`${NOTIFICATION_API_URL}/${NotificationId}/reject`,NotificationId ,config);
    return response.data;
}
const getRejectMessage = async (storyId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const response = await axios.get(`${STORY_API_URL}/${storyId}/reject` ,config);
    return response.data;
}

const storyService = {
    createNotification,
    getNotifications,
    getrejectionNotification,
    approveNotification,
    getRejectMessage
}

export default storyService;
