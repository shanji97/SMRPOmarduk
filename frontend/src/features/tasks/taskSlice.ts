import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import taskService from "./taskService";

let user = JSON.parse(localStorage.getItem('user')!);

interface TaskState {
    tasks: any[] // TODO
    tasksForSprint: any[]
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    message: any
}

const initialState: TaskState = {
    tasks: [],
    tasksForSprint: [],
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: ''
}


export const getTasksForSprint = createAsyncThunk('/task/getTaskForSprint', async (sprintId: string, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await taskService.getTaskForSprint(sprintId, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message)  || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
});

export const createTask = createAsyncThunk('/task/createTask', async (taskData: any, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await taskService.createTask(taskData, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message)  || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
});

export const deleteTask = createAsyncThunk('/task/deleteTask', async (taskId: string, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await taskService.deleteTask(taskId, token!);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
});

export const editTask = createAsyncThunk('/task/editTask', async (taskData: any, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await taskService.editTask(taskData, token!);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
});

export const assignUser = createAsyncThunk('/task/assignUser', async (assignUserData: any, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await taskService.assignUser(assignUserData, token!);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
});


export const taskSlice = createSlice({
    name: 'tasks',
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
        .addCase(getTasksForSprint.pending, (state) => {
            state.isLoading = true
        })
        .addCase(getTasksForSprint.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.isError = false;
            state.message = '';
            state.tasksForSprint = action.payload;
        })
        .addCase(getTasksForSprint.rejected, (state, action) => {
            state.isLoading = false
            state.isSuccess = false;
            state.isError = true
            state.message = action.payload
        })
        .addCase(createTask.pending, (state) => {
            state.isLoading = true
        })
        .addCase(createTask.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.isError = false;
            state.message = '';
        })
        .addCase(createTask.rejected, (state, action) => {
            state.isLoading = false
            state.isSuccess = false;
            state.isError = true
            state.message = action.payload
        })
        .addCase(deleteTask.pending, (state) => {
            state.isLoading = true
        })
        .addCase(deleteTask.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.isError = false;
            state.message = '';

        })
        .addCase(deleteTask.rejected, (state, action) => {
            state.isLoading = false
            state.isSuccess = false;
            state.isError = true
            state.message = action.payload
        })
        .addCase(editTask.pending, (state) => {
            state.isLoading = true
        })
        .addCase(editTask.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.isError = false;
            state.message = '';
        })
        .addCase(editTask.rejected, (state, action) => {
            state.isLoading = false
            state.isSuccess = false;
            state.isError = true
            state.message = action.payload
        })
        .addCase(assignUser.pending, (state) => {
            state.isLoading = true
        })
        .addCase(assignUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.isError = false;
            state.message = '';
        })
        .addCase(assignUser.rejected, (state, action) => {
            state.isLoading = false
            state.isSuccess = false;
            state.isError = true
            state.message = action.payload
        })
    }
})


export default taskSlice.reducer;
export const {reset} = taskSlice.actions