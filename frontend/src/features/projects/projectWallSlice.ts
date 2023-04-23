import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {PostData} from "../../classes/wallData";
import projectWallService from "./projectWallService";

interface ProjectWallState {
  wallPosts: PostData[]
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  message: any
}

const initialState: ProjectWallState = {
  wallPosts: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
}

interface PostBody {
  title: string,
  postContent: string,
  author: string,
  userId?: string,
  projectId?: string,
}

export const getAllWallPosts = createAsyncThunk('projectRole/getAllPosts', async (projectId: string, thunkAPI: any) => {
  try {
    const token = JSON.parse(localStorage.getItem('user')!).token;
    return await projectWallService.getAllWallPosts(projectId, token);
  } catch (error: any) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
});

export const createPost = createAsyncThunk('projectRole/createPost', async (postBody: PostBody, thunkAPI: any) => {
  try {
    const token = JSON.parse(localStorage.getItem('user')!).token;
    return await projectWallService.createPost(postBody, token);
  } catch (error: any) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
});

export const deletePost = createAsyncThunk('projectRole/deletePost', async (body: {projectId: string, postId: string}, thunkAPI: any) => {
  try {
    const token = JSON.parse(localStorage.getItem('user')!).token;
    return await projectWallService.deletePost(body, token);
  } catch (error: any) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
});


export const projectRoleSlice = createSlice({
  name: 'projectWall',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isError = false
      state.isSuccess = false
      state.message = ''
    }
  },
  extraReducers: builder => {
    builder
      .addCase(getAllWallPosts.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getAllWallPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = '';
        state.wallPosts = action.payload;
      })
      .addCase(getAllWallPosts.rejected, (state, action) => {
        state.isLoading = false
        state.isSuccess = false;
        state.isError = true
        state.message = action.payload
      })
      .addCase(deletePost.pending, (state) => {
        state.isLoading = true
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = '';
        state.wallPosts = state.wallPosts.filter(post => post.id !== action.meta.arg.postId);
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.isLoading = false
        state.isSuccess = false;
        state.isError = true
        state.message = action.payload
      })
      .addCase(createPost.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = '';
        const newPost: PostBody = {
          author: action.meta.arg.author,
          projectId: action.meta.arg.projectId,
          postContent: action.meta.arg.postContent,
          title: action.meta.arg.title,
          userId: action.meta.arg.userId,
        }
        state.wallPosts.push(newPost);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false
        state.isSuccess = false;
        state.isError = true
        state.message = action.payload
      })
  }
})

export default projectRoleSlice.reducer;
export const {reset} = projectRoleSlice.actions