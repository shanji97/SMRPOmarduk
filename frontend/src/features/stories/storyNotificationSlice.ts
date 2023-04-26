import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { NotificationData, StoryData, PostDataNotification } from "../../classes/storyData";
import storyService from "./storyNotificationService";

let user = JSON.parse(localStorage.getItem('user')!);

interface StoryState {
    storiesNotification: PostDataNotification[]
    rejectMessage: string
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    message: any
 
    
}

const initialState: StoryState = {
    storiesNotification: [],
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: '',
    rejectMessage: ''
  
}




export const createNotification = createAsyncThunk('story/createNotification', async (notificationData: NotificationData, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await storyService.createNotification(notificationData, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message)  || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
});
export const getNotifications = createAsyncThunk('/story/getNotifications', async (storyId: string, thunkAPI: any) => { 
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await storyService.getNotifications(storyId, token!);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        console.log(message);
        return thunkAPI.rejectWithValue(message)
    }  
});

export const getrejectionNotification = createAsyncThunk('/story/getrejectionNotification', async (storyId: string, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await storyService.getrejectionNotification(storyId, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});
export const approveNotification = createAsyncThunk('/story/approveNotification', async (notificationId: string, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await storyService.approveNotification(notificationId, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});
export const getRejectMessage = createAsyncThunk('/story/getRejectMessage', async (storyId: string, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await storyService.getRejectMessage(storyId, token);
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
            state.message = ''
           
        }
    },
    extraReducers: builder => {
        builder
            .addCase(createNotification.pending, (state) => {
                state.isLoading = true
            })
            .addCase(createNotification.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
            })
            .addCase(createNotification.rejected, (state, action) => {
                state.isLoading = false
                state.isSuccess = false;
                state.isError = true
                state.message = action.payload
            })
            .addCase(getNotifications.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getNotifications.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
                state.storiesNotification = action.payload

                /* 
                const newPost: PostDataNotification = {
                    id: action.payload, 
                    authorName: action.meta.arg.author,
                    notificationText: action.meta.arg.notificationText,
                    userId: action.meta.arg.userId,
                    created: new Date().toString(),
                    notificationType: action.meta.arg.notificationType,
                    approved: action.meta.arg.approved,
                    storyId: action.meta.arg.storyId
                  }
                  state.storiesNotification.push(newPost); */
            })

            .addCase(getNotifications.rejected, (state, action) => {
                state.isLoading = false
                state.isSuccess = false;
                state.isError = true
                state.message = action.payload
            })
            .addCase(getrejectionNotification.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getrejectionNotification.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
            })
            .addCase(getrejectionNotification.rejected, (state, action) => {
                state.isLoading = false
                state.isSuccess = false;
                state.isError = true
                state.message = action.payload
            })
            .addCase(approveNotification.pending, (state) => {
                state.isLoading = true
            })
            .addCase(approveNotification.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
            })
            .addCase(approveNotification.rejected, (state, action) => {
                state.isLoading = false
                state.isSuccess = false;
                state.isError = true
                state.message = action.payload
            })
            .addCase(getRejectMessage.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getRejectMessage.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.rejectMessage = action.payload
            })
            .addCase(getRejectMessage.rejected, (state, action) => {
                state.isLoading = false
                state.isSuccess = false;
                state.isError = true
                state.message = action.payload
            })
    }
})


export default storySlice.reducer;
export const {reset} = storySlice.actions