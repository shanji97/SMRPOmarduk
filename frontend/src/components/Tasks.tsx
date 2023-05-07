import { Fragment, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { Button } from "react-bootstrap";
import { getTaskForUser, getTasksForStory, reset } from "../features/tasks/taskSlice";
import LogTimeModal from "./LogTimeModal";
import Task from "./Task";
import { toast } from "react-toastify";

interface TasksProps {
  tasks: any;
}

const Tasks: React.FC<TasksProps> = ({ tasks }) => {
  const dispatch = useAppDispatch();
  
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

    return (
        <Fragment>
          <Task key={tasks.id} task={tasks} />
        </Fragment>
    )
}

export default Tasks;
