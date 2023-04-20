import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { LoginData, UserData, UserDataEdit } from "../../classes/userData";
import userService from "./userService";

let user = JSON.parse(localStorage.getItem('user')!);

interface UserState {
    user: string | null,
    userData: UserDataEdit,
    editId?: string
    isAdmin: boolean,
    users: UserData[]
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    isCommonPassword: boolean
    message: any
    qrUrl: string
    lastLogin: string
    firstLogin: boolean
    finalLogin: boolean
    twofaConfirmed: boolean
    twofaAuthenticatedUsers: string[]
    twoFaEnabled: boolean
}

const initialState: UserState = {
    user: user ? user : null,
    userData: {},
    editId: '',
    isAdmin: false,
    users: [],
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: '',
    isCommonPassword: false,
    qrUrl: '',
    lastLogin: '',
    firstLogin: false,
    finalLogin: false,
    twofaConfirmed: false,
    twofaAuthenticatedUsers: [],
    twoFaEnabled: false,
}

export const login = createAsyncThunk('auth/login', async (userData: LoginData, thunkAPI) => {
    try {
        return await userService.login(userData);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});

export const login2fa = createAsyncThunk('auth/2falogin', async (userData: LoginData, thunkAPI) => {
    try {
        return await userService.login(userData);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});

export const disable2fa = createAsyncThunk('auth/disable2falogin', async (userId: string, thunkAPI) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await userService.disable2fa(userId, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});


export const logout = createAsyncThunk('auth/logout', async () => {
    await userService.logout();
});

export const createUser = createAsyncThunk('auth/create', async (userData: UserData, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await userService.create(userData, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});

export const editUser = createAsyncThunk('auth/edit', async (userData: UserDataEdit, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await userService.editUser(userData, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }  
});

export const getAllUsers = createAsyncThunk('auth/getAllUsers', async (_, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await userService.getAllUsers(token!);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
});

export const getUser = createAsyncThunk('auth/getUser', async (id: string, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await userService.getUser(id, token!);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
});

export const deleteUser = createAsyncThunk('auth/deleteUser', async (userId: string, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await userService.deleteUser(userId, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
});

export const commonPassword = createAsyncThunk('/auth/commonPassword', async (password: {password: string}, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await userService.commonPassword(password, token!);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
});

export const setUp2FA = createAsyncThunk('/auth/setUp2FA', async (userId: string, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await userService.setUp2FA(userId, token!);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
});

export const confirm2FA = createAsyncThunk('/auth/confirm2FA', async (confirmData: {userId: string, code: string}, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await userService.confirm2FA(confirmData, token!);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
});

export const get2faStatus = createAsyncThunk('/auth/get2faStatus', async (userId: string, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await userService.get2faStatus(userId, token!);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
});

export const getLastLogin = createAsyncThunk('/auth/lastLogin', async (userId: string, thunkAPI: any) => {
    try {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        return await userService.getLastLogin(userId, token!);
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
            state.twofaConfirmed = false;
        },
        setUserAs2faAuthenticated: (state, action) => {
            state.twofaAuthenticatedUsers.push(action.payload);
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
                state.user = action.payload.token
                state.firstLogin = true
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
                state.user = null
                state.firstLogin = false;
                state.finalLogin = false;
            })
            .addCase(login2fa.pending, (state) => {
                state.isLoading = true
            })
            .addCase(login2fa.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
                state.user = action.payload.token
                state.firstLogin = false;
                state.finalLogin = true;
            })
            .addCase(login2fa.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
                state.user = null
                state.firstLogin = false;
                state.finalLogin = false;
            })
            .addCase(get2faStatus.pending, (state) => {
                state.isLoading = true
            })
            .addCase(get2faStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
                state.twoFaEnabled = action.payload.status;
            })
            .addCase(get2faStatus.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            .addCase(disable2fa.pending, (state) => {
                state.isLoading = true
            })
            .addCase(disable2fa.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
                state.twoFaEnabled = false;
            })
            .addCase(disable2fa.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            .addCase(confirm2FA.pending, (state) => {
                state.isLoading = true
            })
            .addCase(confirm2FA.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
                state.twofaConfirmed = true;
                state.twoFaEnabled = true;
            })
            .addCase(confirm2FA.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            .addCase(getAllUsers.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getAllUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
                state.users = action.payload

            })
            .addCase(getAllUsers.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
                state.user = null
            })
            .addCase(getUser.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
                state.userData = action.payload
            })
            .addCase(getUser.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
                state.user = null
            })
            .addCase(deleteUser.pending, (state) => {
                state.isLoading = true
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
                // @ts-ignore
                state.users = state.users.filter(user => user.id !== action.meta.arg)
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
                state.user = null
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
            })
            .addCase(commonPassword.pending, (state) => {
                state.isLoading = true
            })
            .addCase(commonPassword.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.isCommonPassword = action.payload.isCommon;
            })
            .addCase(commonPassword.rejected, (state, action: any) => {
                state.isLoading = false
                state.isError = true
                state.isCommonPassword = true;
                state.message = '';
                state.user = null;
                state.isCommonPassword = action.payload.isCommon;
            })
            .addCase(setUp2FA.pending, (state) => {
                state.isLoading = true
            })
            .addCase(setUp2FA.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.qrUrl = action.payload.url;
            })
            .addCase(setUp2FA.rejected, (state, action: any) => {
                state.isLoading = false
                state.isError = true
                state.isCommonPassword = true;
                state.message = '';
            })
            .addCase(getLastLogin.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getLastLogin.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.lastLogin = action.payload.date;
            })
            .addCase(getLastLogin.rejected, (state, action: any) => {
                state.isLoading = false
                state.isError = true
                state.isCommonPassword = true;
                state.message = '';
            })
            .addCase(createUser.pending, (state) => {
                state.isLoading = true
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = ''
            })
            .addCase(createUser.rejected, (state, action: any) => {
                state.isLoading = false
                state.isError = true
                state.isSuccess = false
                state.message = action.payload;
            })
            .addCase(editUser.pending, (state) => {
                state.isLoading = true
            })
            .addCase(editUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = ''
                const payloadUser = action.meta.arg;
                const updatedUser: UserData = {
                    id: payloadUser.id!,
                    email: payloadUser.email!,
                    firstName: payloadUser.firstName!,
                    lastName: payloadUser.lastName!,
                    isAdmin: payloadUser.isAdmin!,
                    password: '',
                    username: payloadUser.username!
                }
                const index = state.users.findIndex(user => user.id === updatedUser.id);
                const newUsers: UserData[] = [...state.users];
                newUsers[index] = updatedUser;
                state.users = newUsers;
            })
            .addCase(editUser.rejected, (state, action: any) => {
                state.isLoading = false
                state.isError = true
                state.isSuccess = false
                state.message = 'User already exists!';
            })
    }
})

export default userSlice.reducer;
export const {reset, setUserAs2faAuthenticated} = userSlice.actions
