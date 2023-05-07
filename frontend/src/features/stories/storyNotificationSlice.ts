import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { NotificationData, StoryData, PostDataNotification } from "../../classes/storyData";
import storyService from "./storyNotificationService";

let user = JSON.parse(localStorage.getItem('user')!);

interface StoryState {
    storiesNotification: any[]
    rejectMessage: string
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    message: any
    isNotificationLoading: boolean
    isNotificationSuccess: boolean
    isNotificationError: boolean
    isGetNotLoading: boolean
    isGetNotSuccess: boolean
    isGetNotError: boolean
}

const initialState: StoryState = {
    storiesNotification: [],
    isLoading: false,
    isSuccess: false,
    isError: false,
    isNotificationLoading: false,
    isNotificationSuccess: false,
    isNotificationError: false,
    message: '',
    rejectMessage: '',
    isGetNotLoading: false,
    isGetNotSuccess: false,
    isGetNotError: false,
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
        return await storyService.getNotifications(storyId, token);
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
            state.isNotificationLoading = false
            state.isNotificationError = false
            state.isNotificationSuccess = false
            state.isGetNotLoading = false
            state.isGetNotError = false
            state.isGetNotSuccess = false
           
        }
    },
    extraReducers: builder => {
        builder
            .addCase(createNotification.pending, (state) => {
<<<<<<< HEAD
=======
                state.isLoading = true
            })
            .addCase(createNotification.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
                const bodyComment = action.meta.arg;

                const newComment: PostDataNotification = {
                    approved: false,
                    authorName: bodyComment.authorName!,
                    notificationText: bodyComment.description,
                    notificationType: 0,
                    created: bodyComment.created,
                }

                state.storiesNotification.push(newComment)
            })
            .addCase(createNotification.rejected, (state, action) => {
                state.isLoading = false
                state.isSuccess = false;
                state.isError = true
                state.message = action.payload
            })
            .addCase(getNotifications.pending, (state) => {
>>>>>>> c31d7c3baa73d52f090b0c8e473387800df94f1a
                state.isNotificationLoading = true
            })
            .addCase(createNotification.fulfilled, (state, action) => {
                state.isNotificationLoading = false;
                state.isNotificationSuccess = true;
                state.isNotificationError = false;
                state.message = '';
            })
            .addCase(createNotification.rejected, (state, action) => {
                state.isNotificationLoading = false;
                state.isNotificationSuccess = false;
                state.isNotificationError = true;
                state.message = action.payload
            })
            .addCase(getNotifications.pending, (state) => {
                state.isGetNotLoading = true;
            })
            .addCase(getNotifications.fulfilled, (state, action) => {
                state.isGetNotLoading = false;
                state.isGetNotSuccess = true;
                state.isGetNotError = false;
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
                state.isGetNotLoading = false
                state.isGetNotSuccess = false;
                state.isGetNotError = true
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