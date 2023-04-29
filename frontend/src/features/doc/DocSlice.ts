import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import docService from "./DocService";

let user = JSON.parse(localStorage.getItem('user')!);

interface DocState {
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    message: any
    fileNames: string[]
    downloadedFile: string
}

const initialState: DocState = {
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: '',
    fileNames: [],
    downloadedFile: ""
}

export const upload = createAsyncThunk('docs/upload', async ({ file, projectId }: { file: FormData, projectId: string }, thunkAPI) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await docService.uploadFile({file, projectId}, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});

export const getFilesList = createAsyncThunk('docs/getFilesList', async (projectId: string, thunkAPI) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await docService.getFilesList(projectId, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});

export const download = createAsyncThunk('docs/download', async ({fileName, projectId}: {fileName: string, projectId: string}, thunkAPI) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await docService.download({fileName, projectId}, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});



export const docSlice = createSlice({
    name: 'docs',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false
            state.isError = false
            state.isSuccess = false
            state.message = ''
        },
    },
    extraReducers: builder => {
        builder
            .addCase(upload.pending, (state) => {
                state.isLoading = true
            })
            .addCase(upload.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
            })
            .addCase(upload.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.isSuccess = false;
                state.message = action.payload
            })
            .addCase(getFilesList.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getFilesList.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
                state.fileNames = action.payload.files;
            })
            .addCase(getFilesList.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.isSuccess = false;
                state.message = action.payload
            })
            .addCase(download.pending, (state) => {
                state.isLoading = true
            })
            .addCase(download.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
                state.downloadedFile = action.payload;
            })
            .addCase(download.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.isSuccess = false;
                state.message = action.payload
            })
            
    }
})

export default docSlice.reducer;
export const {reset} = docSlice.actions
