import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import sprintService from "./sprintService";
import {SprintBody, StorySprint} from "../../classes/sprintData";

interface SprintState {
    sprints: SprintBody[]
    unrealizedStories: any []
    activeSprint: SprintBody | undefined
    isUpdated: boolean
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    message: any
    isNotStoryInSprint: boolean 
    isStoryInSprint: boolean
    isUpdatedActive: boolean
    isLoadingActive: boolean
    isSuccessActive: boolean
    isErrorActive: boolean
    isUnrealizedError: boolean
    isUnrealizedLoading: boolean
    isUnrealizedSuccess: boolean
    isToSprintLoading: boolean
    isToSprintSuccess: boolean
    isToSprintError: boolean
}

const initialState: SprintState = {
    sprints: [],
    unrealizedStories: [],
    activeSprint: undefined,
    isUpdated: false,
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: '',
    isNotStoryInSprint: false,
    isStoryInSprint: false,
    isUpdatedActive: false,
    isLoadingActive: false,
    isSuccessActive: false,
    isErrorActive: false,
    isUnrealizedLoading: false,
    isUnrealizedSuccess: false,
    isUnrealizedError: false,
    isToSprintLoading: false,
    isToSprintSuccess: false,
    isToSprintError: false,
}

export const createSprint = createAsyncThunk('sprint/create', async (sprintBody: SprintBody, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await sprintService.createSprint(sprintBody, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});

export const addStoryToSprint = createAsyncThunk('sprint/addStoryToSprint', async (storySprint: StorySprint, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await sprintService.addStoryToSprint(storySprint, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});

export const updateSprint = createAsyncThunk('sprint/update', async (sprintBody: SprintBody, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await sprintService.updateSprint(sprintBody, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
});

export const getAllSprints = createAsyncThunk('sprint/getAll', async (projectId: string, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await sprintService.getAllSprints(projectId, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});
export const getUnrealizedStoriesForSprint = createAsyncThunk('sprint/getUnrealizedStoriesForSprint', async (sprintId: string, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await sprintService.getUnrealizedStoriesForSprint(sprintId, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});
export const getActiveSprint = createAsyncThunk('sprint/getActiveSprint', async (projectId: string, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await sprintService.getActiveSprint(projectId, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});


export const deleteSprint = createAsyncThunk('sprint/delete', async (sprintId: string, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await sprintService.deleteSprint(sprintId, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
});



export const sprintSlice = createSlice({
    name: 'sprints',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false
            state.isError = false
            state.isSuccess = false
            state.message = ''
            state.isUpdated = false;
            state.isStoryInSprint = false
            state.isNotStoryInSprint = false
            state.isLoadingActive = false
            state.isErrorActive = false
            state.isSuccessActive = false
            state.isUnrealizedLoading = false
            state.isUnrealizedError = false
            state.isUnrealizedSuccess = false
            state.isToSprintLoading = false
            state.isToSprintError = false
            state.isToSprintSuccess = false
        },
        setActiveSprint: (state, action) => {
            state.activeSprint = action.payload;
        }
    },
    extraReducers: builder => {
        builder
        .addCase(createSprint.pending, (state) => {
            state.isLoading = true
        })
        .addCase(createSprint.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.isError = false;
            state.message = '';
            state.sprints.push(action.payload);
        })
        .addCase(createSprint.rejected, (state, action) => {
            state.isLoading = false
            state.isSuccess = false;
            state.isError = true
            state.message = action.payload
        })
        .addCase(addStoryToSprint.pending, (state) => {
            state.isToSprintLoading = true
        })
        .addCase(addStoryToSprint.fulfilled, (state, action) => {
            state.isToSprintLoading = false;
            state.isToSprintSuccess = true;
            state.isToSprintError = false;
            state.message = 'Story successfully added to sprint';
            state.sprints.push(action.payload);
        })
        .addCase(addStoryToSprint.rejected, (state, action) => {
            state.isToSprintLoading = false
            state.isToSprintSuccess = false;
            state.isToSprintError = true
            state.message = action.payload
        })
        .addCase(updateSprint.pending, (state) => {
            state.isLoading = true
        })
        .addCase(updateSprint.fulfilled, (state, action) => {
            state.isUpdated = true;
            state.isLoading = false;
            state.isError = false;
            state.message = '';

            const payloadSprint = action.meta.arg;
            const updatedSprint: SprintBody = {
                id: payloadSprint.id,
                projectId: payloadSprint.projectId,
                name: payloadSprint.name,
                velocity: payloadSprint.velocity,
                startDate: payloadSprint.startDate,
                endDate: payloadSprint.endDate
            }
            const index = state.sprints.findIndex(sprint => sprint.id === payloadSprint.id);
            const newSprints: SprintBody[] = [...state.sprints];
            newSprints[index] = updatedSprint;
            state.sprints = newSprints;
        })
        .addCase(updateSprint.rejected, (state, action) => {
            state.isLoading = false
            state.isSuccess = false;
            state.isError = true
            state.message = action.payload
        })
        .addCase(getAllSprints.pending, (state) => {
            state.isLoading = true
        })
        .addCase(getAllSprints.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.isError = false;
            state.message = '';
            state.sprints = action.payload;
        })
        .addCase(getAllSprints.rejected, (state, action) => {
            state.isLoading = false
            state.isSuccess = false;
            state.isError = true
            state.message = action.payload
        })
        .addCase(getUnrealizedStoriesForSprint.pending, (state) => {
            state.isUnrealizedLoading = true;
        })
        .addCase(getUnrealizedStoriesForSprint.fulfilled, (state, action) => {
            state.isUnrealizedLoading = false;
            state.isUnrealizedSuccess = true;
            state.isUnrealizedError = false;
            state.message = '';
            state.unrealizedStories = action.payload;
        })
        .addCase(getUnrealizedStoriesForSprint.rejected, (state, action) => {
            state.isUnrealizedLoading = false;
            state.isUnrealizedSuccess = false;
            state.isUnrealizedError = true;
            state.message = action.payload
        })
        .addCase(deleteSprint.pending, (state) => {
            state.isLoading = true
        })
        .addCase(deleteSprint.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.isError = false;
            state.message = '';
            state.sprints = state.sprints.filter(sprint => sprint.id !== action.meta.arg);
        })
        .addCase(deleteSprint.rejected, (state, action) => {
            state.isLoading = false
            state.isSuccess = false;
            state.isError = true
            state.message = action.payload
        })
        .addCase(getActiveSprint.pending, (state) => {
            state.isLoadingActive = true
        })
        .addCase(getActiveSprint.fulfilled, (state, action) => {
            state.isLoadingActive = false;
            state.isSuccessActive = true;
            state.isErrorActive = false;
            state.message = '';
            state.activeSprint = action.payload;
        })
        .addCase(getActiveSprint.rejected, (state, action) => {
            state.isLoadingActive = false
            state.isSuccessActive = false;
            state.isErrorActive = true
            state.message = action.payload
        })
    }
});

export default sprintSlice.reducer;
export const {reset, setActiveSprint} = sprintSlice.actions;
