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
  }, []);

  return (
    <Fragment>
      {tasksForStory.map((task) => {
        return <Task task={task} />;
      })}
    </Fragment>
  );

  return <h1>asd</h1>;
};

export default Tasks;
