import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ProjectData, ProjectDataEdit} from "../../classes/projectData";
import projectService from "./projectService";
import projectRoleService from "./projectRoleService";


export interface ProjectRoleState {
    projectName: string
    userRoles: any[] // TODO fix this !!!
    isLoading: boolean
    isSuccess: boolean
    isSuccessAdd: boolean
    isError: boolean
    message: any
    isUserRolesLoading: boolean
    isUserRolesSuccess: boolean
    isUserRolesError: boolean
}

const initialState: ProjectRoleState = {
    projectName: '',
    userRoles: [],
    isLoading: false,
    isSuccess: false,
    isSuccessAdd: false,
    isError: false,
    message: '',
    isUserRolesSuccess: false,
    isUserRolesLoading: false,
    isUserRolesError: false,
}

// this is for updating product owner and scrum master roles
export const updateProjectRoles = createAsyncThunk('projectRole/editProjectRoles', async (projectRoleData: any, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await projectRoleService.updateProjectRoles(projectRoleData, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});

export const getProjectUserRoles = createAsyncThunk('projectRole/getProjectUserRoles', async (projectRoleData: any, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await projectRoleService.getProjectUserRoles(projectRoleData, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});

export const addDeveloper = createAsyncThunk('projectRole/addDeveloper', async (addDeveloperData: any, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await projectRoleService.addDeveloper(addDeveloperData, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});

export const removeDeveloper = createAsyncThunk('projectRole/removeDeveloper', async (removeDeveloperData: any, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await projectRoleService.removeDeveloper(removeDeveloperData, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});



export const projectRoleSlice = createSlice({
    name: 'projectRole',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false
            state.isError = false
            state.isSuccess = false
            state.isSuccessAdd = false
            state.message = ''
            state.isUserRolesLoading = false;
            state.isUserRolesSuccess = false;
            state.isUserRolesError = false;
        }
    },
    extraReducers: builder => {
        builder
        .addCase(getProjectUserRoles.pending, (state) => {
            state.isLoading = true;
            state.isUserRolesLoading = true
        })
        .addCase(getProjectUserRoles.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.isError = false;
            state.isUserRolesLoading = false;
            state.isUserRolesSuccess = true;
            state.isUserRolesError = false;
            state.message = '';
            state.userRoles = action.payload;
        })
        .addCase(getProjectUserRoles.rejected, (state, action) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = true;
            state.isUserRolesLoading = false;
            state.isUserRolesSuccess = false;
            state.isUserRolesError = true;
            state.message = action.payload
        })
        .addCase(updateProjectRoles.pending, (state) => {
            state.isLoading = true
        })
        .addCase(updateProjectRoles.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.isError = false;
            state.message = '';
            state.userRoles = action.payload;
        })
        .addCase(updateProjectRoles.rejected, (state, action) => {
            state.isLoading = false
            state.isSuccess = false;
            state.isError = true
            state.message = action.payload
        })
        .addCase(addDeveloper.pending, (state) => {
            state.isLoading = true
        })
        .addCase(addDeveloper.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccessAdd = true;
            state.isError = false;
            state.message = '';
            state.userRoles = action.payload;
        })
        .addCase(addDeveloper.rejected, (state, action) => {
            state.isLoading = false
            state.isSuccess = false;
            state.isError = true
            state.message = action.payload
        })
        .addCase(removeDeveloper.pending, (state) => {
            state.isLoading = true
        })
        .addCase(removeDeveloper.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.isError = false;
            state.message = '';
            state.userRoles = action.payload;
        })
        .addCase(removeDeveloper.rejected, (state, action) => {
            state.isLoading = false
            state.isSuccess = false;
            state.isError = true
            state.message = action.payload
        })
    }
})

export default projectRoleSlice.reducer;
export const {reset} = projectRoleSlice.actions