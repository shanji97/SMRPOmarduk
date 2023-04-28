import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RejectStory, StoryData, UpdateStoryCategory, UpdateTimeComplexity } from "../../classes/storyData";
import storyService from "./storyService";

let user = JSON.parse(localStorage.getItem('user')!);

interface StoryState {
    stories: StoryData[]
    storiesForSprint: StoryData[]
    storiesForUser: StoryData[]
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    message: any
    isUpdateSuccess: boolean
    isUpdateError: boolean
    isDeleteSuccess: boolean
    isDeleteError: boolean
    isRejectError: boolean
    isRejectSuccess: boolean
    isSuccessConfirm: boolean
    isSuccessLoading: boolean
}

const initialState: StoryState = {
    stories: [],
    storiesForSprint: [],
    storiesForUser: [],
    isLoading: false,
    isSuccess: false,
    isError: false,
    isUpdateSuccess: false,
    isUpdateError: false,
    isDeleteSuccess: false,
    isDeleteError: false,
    message: '',
    isRejectError: false,
    isRejectSuccess: false,
    isSuccessConfirm: false,
    isSuccessLoading: false
}


export const getAllStoryById = createAsyncThunk('/story/getAllStoryById', async (projectId: string, thunkAPI: any) => { 
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await storyService.getAllStoryById(projectId, token!);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});

export const getStoriesForSprint = createAsyncThunk('/story/getStoriesForSprint', async (sprintId: string, thunkAPI: any) => { 
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await storyService.getStoriesForSprint(sprintId, token!);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        console.log(message);
        return thunkAPI.rejectWithValue(message)
    }  
});

export const getStoriesForUser = createAsyncThunk('/story/getStoriesForUser', async (_, thunkAPI: any) => { 
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await storyService.getStoriesForUser(token!);
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

export const updateStoryCategory = createAsyncThunk('/story/updateCategory', async (updateStoryCategory: UpdateStoryCategory, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await storyService.updateStoryCategory(updateStoryCategory, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});
export const updateTimeComplexity = createAsyncThunk('/story/timeCompl', async (updatedTimeComplexity: UpdateTimeComplexity, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await storyService.updateTimeComplexity(updatedTimeComplexity, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});
export const confirmStory = createAsyncThunk('/story/confirmStory', async (storyId: string, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await storyService.confirmStory(storyId, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});
export const rejectStory = createAsyncThunk('/story/rejectStory', async (rejectStory: RejectStory, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await storyService.rejectStory(rejectStory, token);
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
            state.isRejectError = false
            state.isSuccessConfirm = false
            state.isSuccessLoading = false
        }
    },
    extraReducers: builder => {
        builder
            .addCase(createStory.pending, (state) => {
                state.isLoading = true
            })
            .addCase(createStory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isUpdateSuccess = true;
                state.isUpdateError = false;
                state.message = '';
            })
            .addCase(createStory.rejected, (state, action) => {
                state.isLoading = false
                state.isUpdateSuccess = false;
                state.isUpdateError = true
                state.message = action.payload
            })
            .addCase(getAllStoryById.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getAllStoryById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
                state.stories = action.payload
            })
            .addCase(getStoriesForSprint.rejected, (state, action) => {
                state.isLoading = false
                state.isSuccess = false;
                state.isError = true
                state.message = action.payload
            })
            .addCase(getStoriesForSprint.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getStoriesForSprint.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
                state.storiesForSprint = action.payload;
            })
            .addCase(getStoriesForUser.rejected, (state, action) => {
                state.isLoading = false
                state.isSuccess = false;
                state.isError = true
                state.message = action.payload
            })
            .addCase(getStoriesForUser.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getStoriesForUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
                state.storiesForUser = action.payload;
            })
            .addCase(deleteStory.rejected, (state, action) => {
                state.isLoading = false
                state.isDeleteError = true
                state.message = action.payload
                state.isDeleteSuccess = false;
            })
            .addCase(deleteStory.pending, (state) => {
                state.isLoading = true
            })
            .addCase(deleteStory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isDeleteSuccess = true;
                state.isDeleteError = false;
                state.message = '';
            })
            .addCase(editStory.pending, (state) => {
                state.isLoading = true
            })
            .addCase(editStory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isUpdateSuccess = true;
                state.isUpdateError = false;
                state.message = '';
            })
            .addCase(editStory.rejected, (state, action) => {
                state.isLoading = false
                state.isUpdateSuccess = false;
                state.isUpdateError = true
                state.message = action.payload
            })
            .addCase(updateStoryCategory.pending, (state) => {
                state.isLoading = true
            })
            .addCase(updateStoryCategory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
                state.stories = action.payload;

            })
            .addCase(updateStoryCategory.rejected, (state, action) => {
                state.isLoading = false
                state.isSuccess = false;
                state.isError = true
                state.message = action.payload
            })
            .addCase(updateTimeComplexity.pending, (state) => {
                state.isLoading = true
            })
            .addCase(updateTimeComplexity.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
                state.stories = action.payload;
                console.log(state.stories);
                /*
                const obj = action.meta.arg;
                const index = state.stories.findIndex(story => story.id === obj.storyId);
                const starStory = state.stories.find(story => story.id === obj.storyId)!;
                console.log(JSON.stringify(starStory));
                /
                starStory.timeComplexity = obj.timeComplexity;
                const newStories = [...state.stories];
                newStories[index] = starStory;
                state.stories = newStories;
                */
                // 
            })
            .addCase(updateTimeComplexity.rejected, (state, action) => {
                state.isLoading = false
                state.isSuccess = false;
                state.isError = true
                state.message = action.payload
            })
            .addCase(rejectStory.pending, (state) => {
                state.isLoading = true
            })
            .addCase(rejectStory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isRejectSuccess = true;
                state.isRejectError = false;
                state.message = '';
                state.stories = action.payload;
                
            })
            .addCase(rejectStory.rejected, (state, action) => {
                state.isLoading = false
                state.isSuccess = false;
                state.isError = true;
                state.message = action.payload;
                state.isRejectSuccess = false;
            })
            .addCase(confirmStory.pending, (state) => {
                state.isLoading = true
                state.isSuccessLoading = true
            })
            .addCase(confirmStory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = action.payload;
                state.isSuccessConfirm = true;
                state.isSuccessLoading = false
                
            })
            .addCase(confirmStory.rejected, (state, action) => {
                state.isLoading = false;
                state.isSuccess = false;
                state.isError = true;
                state.message = action.payload;
                state.isSuccessLoading = false
                state.isSuccessConfirm = false;
            })
    }
})


export default storySlice.reducer;
export const {reset} = storySlice.actions