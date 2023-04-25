import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {Comment, PostData} from "../../classes/wallData";
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
  id?: string,
  title: string,
  postContent: string,
  author: string,
  userId?: string,
  projectId?: string,
  created?: string,
  comments?: Comment[]
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

export const deleteComment = createAsyncThunk('projectRole/deletePostComment', async (body: {projectId: string, commentId: string}, thunkAPI: any) => {
  try {
    const token = JSON.parse(localStorage.getItem('user')!).token;
    return await projectWallService.deleteComment(body, token);
  } catch (error: any) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
});

export const addComment = createAsyncThunk('projectRole/createComment', async (body: Comment, thunkAPI: any) => {
  try {
    const token = JSON.parse(localStorage.getItem('user')!).token;
    return await projectWallService.addComment(body, token);
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
      .addCase(deleteComment.pending, (state) => {
        state.isLoading = true
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(deleteComment.rejected, (state, action) => {
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
          id: action.payload,
          author: action.meta.arg.author,
          projectId: action.meta.arg.projectId,
          postContent: action.meta.arg.postContent,
          title: action.meta.arg.title,
          userId: action.meta.arg.userId,
          created: new Date().toString(),
          comments: []
        }
        state.wallPosts.push(newPost);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false
        state.isSuccess = false;
        state.isError = true
        state.message = action.payload
      })
      .addCase(addComment.pending, (state) => {
        state.isLoading = true
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = '';

        const payloadComment = action.meta.arg;
        const newComment: Comment = {
          content: payloadComment.content,
          projectId: payloadComment.projectId,
          userId: payloadComment.userId,
          author: payloadComment.author,
          notificationId: payloadComment.notificationId,
        };


        const oldPost: PostData = state.wallPosts.find(post => post.id === newComment.notificationId)!;
        const oldIndex = state.wallPosts.findIndex(post => post.id === newComment.notificationId);
        const oldPosts = state.wallPosts.map(post => ({
          ...post,
          author: post.author,
          comments: post.comments ? post.comments.slice() : []
        }));
        const newPost = {...oldPost, comments: [...oldPost.comments!, newComment]};
        const newPosts = oldPosts.map((post, index) => index === oldIndex ? newPost : post);

        state.wallPosts = newPosts;
      })
      .addCase(addComment.rejected, (state, action) => {
        state.isLoading = false
        state.isSuccess = false;
        state.isError = true
        state.message = action.payload
      })
  }
})

export default projectRoleSlice.reducer;
export const {reset} = projectRoleSlice.actions