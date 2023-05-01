import axios from "axios";
import { LoginData, UserData, UserDataEdit } from "../../classes/userData";
import { getBaseUrl } from "../../helpers/helpers";


const PROJECT_API_URL = `${getBaseUrl()}/api/project`;

const uploadFile = async ({ file, projectId }: { file: FormData, projectId: string }, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`,
        }
    }

    const response = await axios.post(`${PROJECT_API_URL}/${projectId}/documentation/upload`, file, config);

    return response.data;
}

const download = async ({fileName, projectId}: {fileName: string, projectId: string}, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const response = await axios.get(`${PROJECT_API_URL}/${projectId}/documentation/file/${fileName}`, config);
    return response.data;
}

const getFilesList = async (projectId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    // TODO
    projectId = "3"

    const response = await axios.get(`${PROJECT_API_URL}/${projectId}/documentation/`, config);
    

    return response.data;
}


const docService = {
    uploadFile,
    getFilesList,
    download
}

export default docService;