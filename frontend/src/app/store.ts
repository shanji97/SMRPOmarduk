import { configureStore } from '@reduxjs/toolkit'

import projectSlice from '../features/projects/projectSlice';
import storySlice from '../features/stories/storySlice';
import userSlice from "../features/users/userSlice";
import sprintSlice from "../features/sprints/sprintSlice";
import projectRoleSlice from '../features/projects/projectRoleSlice';
import projectWall from "../features/projects/projectWallSlice";
import taskSlice from '../features/tasks/taskSlice';
import storyNotificationSlice from '../features/stories/storyNotificationSlice';
import planningPokerSlice from "../features/planningPoker/planningPokerSlice";
import docSlice from '../features/doc/DocSlice';

export const store = configureStore({
    reducer: {
        users: userSlice,
        projects: projectSlice,
        projectRoles: projectRoleSlice,
        projectWall: projectWall,
        stories: storySlice,
        sprints: sprintSlice,
        tasks: taskSlice,
        storyNotifications: storyNotificationSlice,
        poker: planningPokerSlice,
        docs: docSlice
    },
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch