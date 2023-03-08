import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "./userService";

const initialState = {

}

export const login = createAsyncThunk('auth/addUser', async () => {
    // TODO    
});

export const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {

    },
    extraReducers: builder => {

    }
})

export default userSlice.reducer;