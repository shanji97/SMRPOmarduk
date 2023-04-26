import { Fragment, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { Button } from "react-bootstrap";
import { getTasksForStory } from "../features/tasks/taskSlice";
import LogTimeModal from "./LogTimeModal";
import Task from "./Task";

interface TasksProps {
    storyId: string
}

const Tasks: React.FC<TasksProps> = ({storyId}) => {
    const dispatch = useAppDispatch();
    const {tasksForStory} = useAppSelector(state => state.tasks);
    const [tasks, setTasks] = useState<any[]>([]);

    useEffect(() => {
        dispatch(getTasksForStory(storyId));
    }, [storyId]);

    useEffect(() => {
        if (tasksForStory.length > 0) {
            setTasks(tasksForStory);
        }
    }, [tasksForStory]);

    return (
        <Fragment>
            {tasks.map(task => {
                return <Task key={task.id} task={task} />
            })}
        </Fragment>
    )
}

export default Tasks;