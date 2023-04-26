import { Fragment, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { Button } from "react-bootstrap";
import { getTasksForStory, reset } from "../features/tasks/taskSlice";
import LogTimeModal from "./LogTimeModal";
import Task from "./Task";
import { toast } from "react-toastify";

interface TasksProps {
  storyId: string;
}

const Tasks: React.FC<TasksProps> = ({ storyId }) => {
  const dispatch = useAppDispatch();
  const { tasksForStory } = useAppSelector((state) => state.tasks);
  const [tasks, setTasks] = useState<any[]>([]);
  const {
    currentlyWorkingOnTaskId,
    isTimerSuccess,
    isTimerError,
    isLoading,
    message,
  } = useAppSelector((state) => state.tasks);

  // error/success messages for timer
  useEffect(() => {
    if (isTimerSuccess && !isLoading) {
      if (currentlyWorkingOnTaskId !== "") {
        toast.success("Started timer!");
      } else {
        toast.success("Stopped timer!");
      }
      dispatch(reset());
    }
    if (isTimerError && !isLoading) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isTimerSuccess, isTimerError, isLoading]);

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
            {tasksForStory.map(task => {
                return <Task key={task.id} task={task} />
            })}
        </Fragment>
    )
}

export default Tasks;
