import { configureStore } from '@reduxjs/toolkit'

import projectSlice from '../features/projects/projectSlice';
import storySlice from '../features/stories/storySlice';
import userSlice from "../features/users/userSlice";

export const store = configureStore({
    reducer: {
        users: userSlice,
        projects: projectSlice
        stories: storySlice
    },
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch