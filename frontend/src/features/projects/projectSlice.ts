import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ProjectData} from "../../classes/projectData";
import projectService from "./projectService";


interface ProjectState {
    projectName: string
    members: string[]
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    message: any
    projects: ProjectData[]
}

const initialState: ProjectState = {
    projectName: '',
    members: [],
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: '',
    projects: []
}

export const createProject = createAsyncThunk('project/create', async (projectData: ProjectData, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await projectService.create(projectData, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});


export const getAllProjects = createAsyncThunk('project/getAllProjects', async (_, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await projectService.getAllProjects(token!);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
});

export const projectSlice = createSlice({
    name: 'projects',
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
        .addCase(createProject.pending, (state) => {
            state.isLoading = true
        })
        .addCase(createProject.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.isError = false;
            state.message = '';
        })
        .addCase(createProject.rejected, (state, action) => {
            state.isLoading = false
            state.isSuccess = false;
            state.isError = true
            state.message = action.payload
        })
        .addCase(getAllProjects.pending, (state) => {
            state.isLoading = true
        })
        .addCase(getAllProjects.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.isError = false;
            state.message = '';
            state.projects = action.payload;
        })
        .addCase(getAllProjects.rejected, (state, action) => {
            state.isLoading = false
            state.isSuccess = false;
            state.isError = true
            state.message = action.payload
        })
    }
})

export default projectSlice.reducer;