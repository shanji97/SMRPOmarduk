import axios from "axios";
import { ProjectData, ProjectDataEdit } from "../../classes/projectData";
import { getBaseUrl } from "../../helpers/helpers";
import {Comment, PostData} from "../../classes/wallData";

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

const deleteComment = async (body:  {commentId: string, projectId: string}, token: string) => {
  const config = {
    headers: {
      Authorization: `JWT ${token}`
    }
  }
  const response = await axios.delete(`${PROJECTS_API_URL}/${body.projectId}/notification-comments/${body.commentId}`, config);

  return response.data;
}

const addComment = async (commentBody: Comment, token: string) => {
  const config = {
    headers: {
      Authorization: `JWT ${token}`
    }
  }

  const reqBody = {...commentBody};
  delete reqBody.projectId;
  delete reqBody.notificationId

  const response = await axios.post(`${PROJECTS_API_URL}/${commentBody.projectId}/notification/${commentBody.notificationId}/comment`, reqBody, config);

  return response.data;
}

const projectWallService = {
  getAllWallPosts,
  deletePost,
  createPost,
  addComment,
  deleteComment,
}

export default projectWallService;
