import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {ProjectData, UserRole} from "../../classes/projectData";
import projectService from "./projectService";

interface ProjectState {
    projectName: string
    userRoles: any[] // TODO fix this !!!
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    message: any
    projects: ProjectData[]
    activeProject: ProjectData
}

const initialState: ProjectState = {
    projectName: '',
    userRoles: [],
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: '',
    projects: [],
    activeProject: {
        id: '',
        projectName: '',
        projectDescription: '',
        userRoles: [],
    }
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

export const getProject = createAsyncThunk('project/getProject', async (id: string, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await projectService.getProjectUserRoles(id, token!);
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
        },
        setActiveProject: (state, action) => {
            const project: ProjectData | undefined = state.projects.find(project => project.id === action.payload);
            state.activeProject = project!;
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
        .addCase(getProject.pending, (state) => {
            state.isLoading = true
        })
        .addCase(getProject.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.isError = false;
            state.message = '';
            state.userRoles = action.payload;
        })
        .addCase(getProject.rejected, (state, action) => {
            state.isLoading = false
            state.isSuccess = false;
            state.isError = true
            state.message = action.payload
        })
    }
})

export default projectSlice.reducer;
export const {reset, setActiveProject} = projectSlice.actions