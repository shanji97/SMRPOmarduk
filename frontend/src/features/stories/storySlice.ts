import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { StoryData } from "../../classes/storyData";
import storyService from "./storyService";

let user = JSON.parse(localStorage.getItem('user')!);

interface StoryState {
    // user: string | null,
    // editId?: string
    // isAdmin: boolean,
    stories: StoryData[]
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    message: any
}

const initialState: StoryState = {
    // user: user ? user : null,
    // editId: '',
    // isAdmin: false,
    stories: [],
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: ''
}

// export const login = createAsyncThunk('auth/login', async (userData: LoginData, thunkAPI) => {
//     try {
//         return await userService.login(userData);
//     } catch (error: any) {
//         const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
//         return thunkAPI.rejectWithValue(message)
//     }  
// });

// export const logout = createAsyncThunk('auth/logout', async () => {
//     await userService.logout();
// });

export const createStory = createAsyncThunk('story/create', async (storyData: StoryData, thunkAPI: any) => { // auth/create ?????
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await storyService.create(storyData, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});

// export const editUser = createAsyncThunk('auth/edit', async (userData: UserDataEdit, thunkAPI: any) => {
//     try {
//         const token = JSON.parse(localStorage.getItem('user')!).token;
//         return await userService.editUser(userData, token);
//     } catch (error: any) {
//         const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
//         return thunkAPI.rejectWithValue(message)
//     }  
// });

// export const getAllUsers = createAsyncThunk('auth/getAllUsers', async (_, thunkAPI: any) => {
//     try {
//         const token = JSON.parse(localStorage.getItem('user')!).token;
//         return await userService.getAllUsers(token!);
//     } catch (error: any) {
//         const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
//         return thunkAPI.rejectWithValue(message)
//     }
// });

// export const deleteUser = createAsyncThunk('auth/deleteUser', async (userId: string, thunkAPI: any) => {
//     try {
//         const token = thunkAPI.getState().users.user.token; 
//         return await userService.deleteUser(userId, token);
//     } catch (error: any) {
//         const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
//         return thunkAPI.rejectWithValue(message)
//     }
// });

export const storySlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false
            state.isError = false
            state.isSuccess = false
            state.message = ''
        }
    },
    // extraReducers: builder => {
    //     builder
    //         .addCase(login.pending, (state) => {
    //             state.isLoading = true
    //         })
    //         .addCase(login.fulfilled, (state, action) => {
    //             state.isLoading = false;
    //             state.isSuccess = true;
    //             state.isError = false;
    //             state.message = '';
    //             state.user = action.payload.token
    //         })
    //         .addCase(login.rejected, (state, action) => {
    //             state.isLoading = false
    //             state.isError = true
    //             state.message = action.payload
    //             state.user = null
    //         })
    //         .addCase(getAllUsers.pending, (state) => {
    //             state.isLoading = true
    //         })
    //         .addCase(getAllUsers.fulfilled, (state, action) => {
    //             state.isLoading = false;
    //             state.isSuccess = true;
    //             state.isError = false;
    //             state.message = '';
    //             state.users = action.payload

    //         })
    //         .addCase(getAllUsers.rejected, (state, action) => {
    //             state.isLoading = false
    //             state.isError = true
    //             state.message = action.payload
    //             state.user = null
    //         })
    //         .addCase(deleteUser.pending, (state) => {
    //             state.isLoading = true
    //         })
    //         .addCase(deleteUser.fulfilled, (state, action) => {
    //             state.isLoading = false;
    //             state.isSuccess = true;
    //             state.isError = false;
    //             state.message = '';
    //             // @ts-ignore
    //             state.users = state.users.filter(user => user.id !== action.payload)
    //         })
    //         .addCase(deleteUser.rejected, (state, action) => {
    //             state.isLoading = false
    //             state.isError = true
    //             state.message = action.payload
    //             state.user = null
    //         })
    //         .addCase(logout.fulfilled, (state) => {
    //             state.user = null;
    //         })
    // }
})


export default storySlice.reducer;