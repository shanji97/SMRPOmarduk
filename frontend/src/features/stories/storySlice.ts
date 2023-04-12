import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { StoryData } from "../../classes/storyData";
import storyService from "./storyService";

let user = JSON.parse(localStorage.getItem('user')!);

interface StoryState {
    stories: StoryData[]
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    message: any
}

const initialState: StoryState = {
    stories: [],
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: ''
}


export const createStory = createAsyncThunk('story/create', async (storyData: StoryData, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await storyService.create(storyData, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        console.log(message);
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
    }
})


export default storySlice.reducer;