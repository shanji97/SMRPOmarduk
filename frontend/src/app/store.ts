import { configureStore } from '@reduxjs/toolkit'
import projectSlice from '../features/projects/projectSlice';
import userSlice from "../features/users/userSlice";

export const store = configureStore({
    reducer: {
        users: userSlice,
        projects: projectSlice
    },
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch