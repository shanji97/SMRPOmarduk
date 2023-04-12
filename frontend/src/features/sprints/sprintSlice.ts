import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import sprintService from "./sprintService";
import { SprintBody } from "../../classes/sprintData";

interface SprintState {
    sprints: SprintBody[]
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    message: any
}

const initialState: SprintState = {
    sprints: [],
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: '',
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

export const getAllSprints = createAsyncThunk('sprint/getAll', async (_, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await sprintService.getAllSprints(token);
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
    }
});

export default sprintSlice.reducer;