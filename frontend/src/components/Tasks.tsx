import { Fragment, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { Button } from "react-bootstrap";
import { getTaskForUser, getTasksForStory, reset } from "../features/tasks/taskSlice";
import LogTimeModal from "./LogTimeModal";
import Task from "./Task";
import { toast } from "react-toastify";

interface TasksProps {
  stories: any;
}

const Tasks: React.FC<TasksProps> = ({ stories }) => {
  const dispatch = useAppDispatch();

  //const [tasks, setTasks] = useState<any[]>([]);
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

  /*
    useEffect(() => {
        if (tasksForStory.length > 0) {
            setTasks(tasksForStory);
        }
    }, [tasksForStory]);
*/
  return (
    <Fragment>
      <Task key={stories.id} task={stories} />
    </Fragment>
  );
};

export default Tasks;
