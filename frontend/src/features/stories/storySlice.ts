import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {StoryData, StoryDataOfProject} from "../../classes/storyData";
import storyService from "./storyService";

let user = JSON.parse(localStorage.getItem('user')!);

interface StoryState {
    stories: StoryData[]
    storiesOfProject: StoryDataOfProject[]
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    message: any
}

const initialState: StoryState = {
    stories: [],
    storiesOfProject: [],
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: ''
}


export const getAllStory = createAsyncThunk('/story/getAllStory', async (_, thunkAPI: any) => { 
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await storyService.getAllStory(token!);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        console.log(message);
        return thunkAPI.rejectWithValue(message)
    }  
});

export const getAllStoriesOfProject = createAsyncThunk('/story/getAllStoriesOfProject', async (projectId: string, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await storyService.getAllStoriesOfProject(projectId, token!);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        console.log(message);
        return thunkAPI.rejectWithValue(message)
    }
});

export const createStory = createAsyncThunk('story/create', async (storyData: StoryData, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await storyService.create(storyData, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message)  || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
});

export const realizeStory = createAsyncThunk('story/reqlizeStory', async (storyId: string, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await storyService.realizeStory(storyId, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message)  || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
});

export const deleteStory = createAsyncThunk('/story/deleteStory', async (storyId: string, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await storyService.deleteStory(storyId, token!);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
});


export const storySlice = createSlice({
    name: 'stories',
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
            .addCase(createStory.pending, (state) => {
                state.isLoading = true
            })
            .addCase(createStory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
            })
            .addCase(createStory.rejected, (state, action) => {
                state.isLoading = false
                state.isSuccess = false;
                state.isError = true
                state.message = action.payload
            })
          .addCase(realizeStory.pending, (state) => {
              state.isLoading = true
          })
          .addCase(realizeStory.fulfilled, (state, action) => {
              state.isLoading = false;
              state.isSuccess = true;
              state.isError = false;
              state.message = '';

              const storyId = action.meta.arg;
              const index = state.storiesOfProject.findIndex(story => story.id === storyId);
              const newStories = [...state.storiesOfProject];

              let storyToUpdate: StoryDataOfProject | undefined = state.storiesOfProject.find(story => story.id === storyId);
              if (storyToUpdate) {
                  storyToUpdate.isRealized = true;
              }
              state.storiesOfProject
          })
          .addCase(realizeStory.rejected, (state, action) => {
              state.isLoading = false
              state.isSuccess = false;
              state.isError = true
              state.message = action.payload
          })
            .addCase(getAllStory.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getAllStory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
                state.stories = action.payload
            })
            .addCase(getAllStory.rejected, (state, action) => {
                state.isLoading = false
                state.isSuccess = false;
                state.isError = true
                state.message = action.payload
            })
            .addCase(getAllStoriesOfProject.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getAllStoriesOfProject.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
                state.storiesOfProject = action.payload
            })
            .addCase(getAllStoriesOfProject.rejected, (state, action) => {
                  state.isLoading = false
                  state.isSuccess = false;
                  state.isError = true;
                  state.message = action.payload;
             })
            .addCase(deleteStory.pending, (state) => {
                state.isLoading = true
            })
            .addCase(deleteStory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
                // @ts-ignore
                state.stories = state.stories.filter(story => story.id !== action.payload)
            })
            .addCase(deleteStory.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
                state.isSuccess = false;
            })
    }
})


export default storySlice.reducer;
export const {reset} = storySlice.actions