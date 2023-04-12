import axios from "axios";
import { getBaseUrl } from "../../helpers/helpers";
import { SprintBody } from "../../classes/sprintData";

const SPRINTS_API_URL = `${getBaseUrl()}/api/sprint`; // TODO

const createSprint = async (sprintBody: SprintBody, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const response = await axios.post(SPRINTS_API_URL, sprintBody, config);
    return response.data;
}

const sprintService = {
    createSprint,
}

export default sprintService;
