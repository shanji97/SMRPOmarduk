import axios from "axios";
import { getBaseUrl } from "../../helpers/helpers";


const TASK_API_URL = `${getBaseUrl()}/api/task`;


const getTaskForSprint = async (sprintId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const response = await axios.get(`${TASK_API_URL}/sprint/${sprintId}`, config);

    return response.data;
}

const createTask = async (taskData: any, token: string) => { // TODO change data type from any to TaskData if possible
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    if (taskData.assignedUserId === "") {
        delete taskData.assignedUserId;
    }

    console.log(taskData)
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
    let taskId = taskData.id;
    delete taskData.id;
    console.log(taskData)

    const response = await axios.patch(`${TASK_API_URL}/${taskId}`, taskData, config);

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

const assignUser = async (assignUserData: any, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }
    const response = await axios.post(`${TASK_API_URL}/${assignUserData.taskId}/assign/${assignUserData.userId}`, {}, config);

    return response.data;
}

const taskService = {
    getTaskForSprint,
    createTask,
    editTask,
    deleteTask,
    assignUser,
}

export default taskService;
