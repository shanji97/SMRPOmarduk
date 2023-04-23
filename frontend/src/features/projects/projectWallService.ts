import axios from "axios";
import { ProjectData, ProjectDataEdit } from "../../classes/projectData";
import { getBaseUrl } from "../../helpers/helpers";
import {PostData} from "../../classes/wallData";

const PROJECTS_API_URL = `${getBaseUrl()}/api/project`;

const getAllWallPosts = async (projectId: string, token: string) => {
  const config = {
    headers: {
      Authorization: `JWT ${token}`
    }
  }
  const response = await axios.get(`${PROJECTS_API_URL}/${projectId}/notifications`, config);

  return response.data;
}

const createPost = async (postBody: PostData, token: string) => {
  const config = {
    headers: {
      Authorization: `JWT ${token}`
    }
  }

  const reqBody = {...postBody};
  delete reqBody.projectId;

  const response = await axios.post(`${PROJECTS_API_URL}/${postBody.projectId}/notification`, reqBody, config);

  return response.data;
}

const deletePost = async (body: {projectId: string, postId: string}, token: string) => {
  const config = {
    headers: {
      Authorization: `JWT ${token}`
    }
  }
  const response = await axios.delete(`${PROJECTS_API_URL}/${body.projectId}/notification/${body.postId}`, config);

  return response.data;
}

const projectWallService = {
  getAllWallPosts,
  deletePost,
  createPost,
}

export default projectWallService;
