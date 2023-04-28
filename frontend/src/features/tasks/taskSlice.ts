import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import taskService from "./taskService";
import { start } from "repl";

let user = JSON.parse(localStorage.getItem('user')!);

interface TaskState {
    tasks: any[] // TODO
    tasksForSprint: any[]
    tasksForStory: any[]
    workLogs: any[]
    currentlyWorkingOnTaskId: string;
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    isTimerSuccess: boolean
    isTimerError: boolean
    message: any
    changed: boolean
}

const initialState: TaskState = {
    tasks: [],
    tasksForSprint: [],
    tasksForStory: [],
    workLogs: [],
    currentlyWorkingOnTaskId: "",
    isLoading: false,
    isSuccess: false,
    isError: false,
    isTimerSuccess: false,
    isTimerError: false,
    message: '',
    changed: false
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

export const getTasksForStory = createAsyncThunk('/task/getTask2ForSprint', async (storyId: string, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await taskService.getTaskForStory(storyId, token);
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

export const getWorkLogs = createAsyncThunk('/task/getWorkLogs', async (taskId: string, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await taskService.getWorkLogs(taskId, token!);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
});

export const logWork = createAsyncThunk('/task/logWork', async (body: {date: string, userId: string, taskId: string, spent: number, remaining: number, description: string}, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await taskService.logWork(body, token!);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
});

export const startTime = createAsyncThunk('/task/startTime', async (taskId: string, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await taskService.startTime(taskId, token!);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
});

export const stopTime = createAsyncThunk('/task/stopTime', async (taskId: string, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await taskService.stopTime(taskId, token!);
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
            state.isTimerSuccess = false
            state.isTimerError = false
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
        .addCase(getTasksForStory.pending, (state) => {
            state.isLoading = true
        })
        .addCase(getTasksForStory.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.isError = false;
            state.message = '';
            state.tasksForStory = action.payload;
        })
        .addCase(getTasksForStory.rejected, (state, action) => {
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
        .addCase(getWorkLogs.pending, (state) => {
            state.isLoading = true
        })
        .addCase(getWorkLogs.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.isError = false;
            state.message = '';
            state.workLogs = action.payload;
        })
        .addCase(getWorkLogs.rejected, (state, action) => {
            state.isLoading = false
            state.isSuccess = false;
            state.isError = true
            state.message = action.payload
        })
        .addCase(logWork.pending, (state) => {
            state.isLoading = true
        })
        .addCase(logWork.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.isError = false;
            state.message = '';

            const newWorkLog = action.meta.arg;
            const index = state.workLogs.findIndex(log => log.date === newWorkLog.date);
            const newWorkLogs = [...state.workLogs];
            newWorkLogs[index] = newWorkLog;
            state.workLogs = newWorkLogs;
        })
        .addCase(logWork.rejected, (state, action) => {
            state.isLoading = false
            state.isSuccess = false;
            state.isError = true
            state.message = action.payload
        })
        .addCase(startTime.pending, (state) => {
            state.isLoading = true
        })
        .addCase(startTime.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isTimerSuccess = true;
            state.isTimerError = false;
            state.message = '';
            state.currentlyWorkingOnTaskId = action.meta.arg;
        })
        .addCase(startTime.rejected, (state, action) => {
            state.isLoading = false
            state.isTimerSuccess = false;
            state.isTimerError = true
            state.message = action.payload
        })
        .addCase(stopTime.pending, (state) => {
            state.isLoading = true
        })
        .addCase(stopTime.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isTimerSuccess = true;
            state.isTimerError = false;
            state.message = '';
            state.currentlyWorkingOnTaskId = "";
        })
        .addCase(stopTime.rejected, (state, action) => {
            state.isLoading = false;
            state.isTimerSuccess = false;
            state.isTimerError = true;
            state.message = action.payload;
        })
    }
})


export default taskSlice.reducer;
export const {reset} = taskSlice.actions