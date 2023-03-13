import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { LoginData, UserData } from "../../../classes/userData";
import userService from "./userService";

const user = JSON.parse(localStorage.getItem('user')!);

interface UserState {
    user: string | null
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    message: any
}

const initialState: UserState = {
    user: user ? user : null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: ''
}

export const login = createAsyncThunk('auth/login', async (userData: LoginData, thunkAPI) => {
    try {
        return await userService.login(userData);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});

export const createUser = createAsyncThunk('auth/create', async (userData: UserData, thunkAPI) => {
    try {
        console.log(userData);
        return await userService.create(userData);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});

export const userSlice = createSlice({
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
    extraReducers: builder => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
                state.user = action.payload
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
                state.user = null
            })
    }
})

export default userSlice.reducer;