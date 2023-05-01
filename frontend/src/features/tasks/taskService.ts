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

const getTaskCategorys = async (storyId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const response = await axios.get(`${TASK_API_URL}/story/${storyId}/categories`, config);

    return response.data;
}

const getTaskForStory = async (storyId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const response = await axios.get(`${TASK_API_URL}/story/${storyId}`, config);

    return response.data;
}

const getTaskForUser = async (token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const response = await axios.get(`${TASK_API_URL}/user`, config);

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

    let storyId = taskData.storyId;
    delete taskData.storyId;

    const response = await axios.post(`${TASK_API_URL}/${storyId}`, taskData, config);

    return response.data;
}

const acceptTask = async (body: {taskId?: number, confirm?: boolean}, token: string) => { // TODO change data type from any to TaskData if possible
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }
    const requestBody = {...body};
    delete requestBody.taskId;
    delete requestBody.confirm;


    const response = await axios.post(`${TASK_API_URL}/${body.taskId}/accept/${body.confirm}`, requestBody, config);
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

const releaseTask = async (taskId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }
    const response = await axios.delete(`${TASK_API_URL}/${taskId}/release`, config);

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

const getWorkLogs = async (taskId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }
    const response = await axios.get(`${TASK_API_URL}/${taskId}/time`, config);

    return response.data;
}

const logWork = async (body: {date?: string, userId?: string, taskId?: string, type?: string}, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }
    const requestBody = {...body};
    delete requestBody.taskId;
    delete requestBody.date;
    delete requestBody.userId;
    delete requestBody.type;

    const response = await axios.post(`${TASK_API_URL}/${body.taskId}/time/${body.userId}/${body.date}`, requestBody, config);

    return response.data;
}

const startTime = async (taskId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }
    const response = await axios.get(`${TASK_API_URL}/${taskId}/time/start`, config);

    return response.data;
}

const stopTime = async (taskId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }
    const response = await axios.get(`${TASK_API_URL}/${taskId}/time/stop`, config);

    return response.data;
}

const deleteWork = async (body: {taskId: string, userId: string, date: string}, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }
    const response = await axios.delete(`${TASK_API_URL}/${body.taskId}/time/${body.userId}/${body.date}`, config);

    return response.data;
}

const getBurndownData = async (projectId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }
    const response = await axios.get(`${TASK_API_URL}/burdown-diagramm-data/${projectId}`, config);

    return response.data;
}

const getProjectStatistics = async (projectId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }
    const response = await axios.get(`${TASK_API_URL}/project/${projectId}/user/statistics`, config);

    return response.data;
}

const taskService = {
    getTaskForSprint,
    createTask,
    editTask,
    deleteTask,
    assignUser,
    getTaskForUser,
    getTaskForStory,
    getWorkLogs,
    logWork,
    startTime,
    stopTime,
    acceptTask,
    releaseTask,
    deleteWork,
    getTaskCategorys,
    getBurndownData,
    getProjectStatistics
}

export default taskService;
