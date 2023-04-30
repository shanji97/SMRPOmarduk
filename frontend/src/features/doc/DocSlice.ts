import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import docService from "./DocService";

let user = JSON.parse(localStorage.getItem('user')!);

interface DocState {
    isLoading: boolean
    isUploadSuccess: boolean
    isDownloadSuccess: boolean
    isUploadError: boolean
    isDownloadError: boolean
    message: any
    fileNames: string[]
    downloadedFile: string
}

const initialState: DocState = {
    isLoading: false,
    isUploadSuccess: false,
    isDownloadSuccess: false,
    isDownloadError: false,
    isUploadError: false,
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
            state.isUploadError = false
            state.isDownloadError = false
            state.isUploadSuccess = false
            state.isDownloadSuccess = false
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
                state.isUploadSuccess = true;
                state.isUploadSuccess = false;
                state.message = '';
            })
            .addCase(upload.rejected, (state, action) => {
                state.isLoading = false
                state.isUploadError = true
                state.isUploadSuccess = false;
                state.message = action.payload
            })
            .addCase(download.pending, (state) => {
                state.isLoading = true
            })
            .addCase(download.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isDownloadSuccess = true;
                state.isDownloadError = false;
                state.message = '';
                state.downloadedFile = action.payload;
            })
            .addCase(download.rejected, (state, action) => {
                state.isLoading = false
                state.isDownloadError = true
                state.isDownloadSuccess = false;
                state.message = action.payload
            })
            
    }
})

export default docSlice.reducer;
export const {reset} = docSlice.actions
