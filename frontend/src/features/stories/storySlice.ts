import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {StoryData} from "../../classes/storyData";
import storyService from "./storyService";

let user = JSON.parse(localStorage.getItem('user')!);

interface StoryState {
    stories: StoryData[]
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    message: any
    isUpdateSuccess: boolean
    isUpdateError: boolean
    isDeleteSuccess: boolean
    isDeleteError: boolean
}

const initialState: StoryState = {
    stories: [],
    isLoading: false,
    isSuccess: false,
    isError: false,
    isUpdateSuccess: false,
    isUpdateError: false,
    isDeleteSuccess: false,
    isDeleteError: false,
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

export const createStory = createAsyncThunk('story/create', async (storyData: StoryData, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await storyService.create(storyData, token);
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

export const editStory = createAsyncThunk('/story/editStory', async (storyData: StoryData, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await storyService.editStory(storyData, token!);
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
            state.isDeleteError = false
            state.isDeleteSuccess = false
            state.isUpdateSuccess = false
            state.isUpdateError = false
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
            .addCase(deleteStory.pending, (state) => {
                state.isLoading = true
            })
            .addCase(deleteStory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isDeleteSuccess = true;
                state.isDeleteError = false;
                state.message = '';
                // @ts-ignore
                state.stories = state.stories.filter(story => story.id !== action.payload)
            })
            .addCase(deleteStory.rejected, (state, action) => {
                state.isLoading = false
                state.isDeleteError = true
                state.message = action.payload
                state.isDeleteSuccess = false;
            })
            .addCase(editStory.pending, (state) => {
                state.isLoading = true
            })
            .addCase(editStory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
            })
            .addCase(editStory.rejected, (state, action) => {
                state.isLoading = false
                state.isSuccess = false;
                state.isError = true
                state.message = action.payload
            })
    }
})


export default storySlice.reducer;
export const {reset} = storySlice.actions