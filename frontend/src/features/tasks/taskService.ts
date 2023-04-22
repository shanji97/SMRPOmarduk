import axios from "axios";
import { getBaseUrl } from "../../helpers/helpers";


const TASK_API_URL = `${getBaseUrl()}/api/task`;


const createTask = async (taskData: any, token: string) => { // TODO change data type from any to TaskData if possible
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }
    let storyId = taskData.storyId;
    delete taskData.storyId;

    const response = await axios.post(`${TASK_API_URL}/${storyId}`, taskData, config);

    return response.data;
}

const editTask = async (taskData: any, token: string) => { // TODO change data type from any to TaskData if possible
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }
    let storyId = taskData.storyId;
    delete taskData.storyId;

    // console.log(storyData);

    const response = await axios.patch(`${TASK_API_URL}/${storyId}`, taskData, config);

    return response.data;
}

const deleteTask = async (taskId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }
    const response = await axios.delete(`${TASK_API_URL}/${taskId}`, config);

    return response.data;
}


const taskService = {
    createTask,
    editTask,
    deleteTask
}

export default taskService;
