import { Fragment, useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import LogTimeModal from "./LogTimeModal";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  getWorkLogs,
  startTime,
  stopTime,
  releaseTask,
  acceptTask,
  reset,
  getTaskForUser,
} from "../features/tasks/taskSlice";
import { toast } from "react-toastify";

interface TaskProps {
  task: any;
}

const Task: React.FC<TaskProps> = ({ task }) => {
  const dispatch = useAppDispatch();
  const {
    workLogs,
    currentlyWorkingOnTaskId,
    isError,
    isSuccess,
    isLoading,
    message,
    isMyTaskError,
    isMyTaskSuccess,
    isMyTaskLoading
  } = useAppSelector((state) => state.tasks);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isSuccess && !isLoading) {
      if (currentlyWorkingOnTaskId !== "") {
        toast.success("Started timer!");
      } else {
        toast.success("Stopped timer!");
      }
      toast.error(message);

      dispatch(reset());

    }
    if (isSuccess && !isLoading) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isSuccess, isError, isLoading]);


  useEffect(() => {
    if (isMyTaskSuccess && !isMyTaskLoading) {
     
      dispatch(getTaskForUser());
      dispatch(reset());
    }
  
  }, [isMyTaskSuccess, isMyTaskError, isMyTaskLoading]);

  useEffect(() => {
    dispatch(getWorkLogs(task.id!));
  }, []);

  const openLogTimeModal = () => {
    setShowModal(true);
  };

  const hideModal = () => {
    setShowModal(false);
  };

  const getStatusFromCategory = (category: number) => {
    switch (category) {
      case 0:
        return "UNKNOWN";
      case 1:
        return "UNASSIGNED";
      case 2:
        return "ASSIGNED";
      case 3:
        return "ACCEPTED";
      case 4:
        return "ACTIVE";
      case 250:
        return "ENDED";
      default:
        return "UNKNOWN";
    }
  };

  const hoursSpentInTotal = useMemo(() => {
    let sum = 0;
    workLogs.forEach((log) => {
      sum += log.spent;
    });
    return sum;
  }, [workLogs]);

  const handleStartWork = () => {
    dispatch(startTime(task.id));
  };

  const handleStopWork = () => {
    dispatch(stopTime(task.id));
  };

  return (
    <Fragment>
      <tr key={task.id}>
        <td>
          {task.category === 2 && (
            <div className="flex-row">
              <Button
                className="m-0 p-0 px-2"
                variant="primary"
                onClick={() =>
                  dispatch(acceptTask({ taskId: task.id, confirm: true }))
                }
              >
                Accept
              </Button>
              <Button
                className="m-0 p-0 px-2"
                variant="danger"
                onClick={() =>
                  dispatch(acceptTask({ taskId: task.id, confirm: false }))
                }
              >
                Release
              </Button>
            </div>
          )}
          {task.category === 3 && (
            <Button
              className="m-0 p-0 px-2"
              variant="primary"
              onClick={() => dispatch(releaseTask(task.id))}
            >
              Decline
            </Button>
          )}
        </td>
        <td>{task.name}</td>
        <td>{getStatusFromCategory(task.category)}</td>

        <td>{hoursSpentInTotal}h</td>
        <td>{`${workLogs?.[workLogs.length - 1]?.remaining}h` ?? "/"}</td>
        <td>{task.estimatedTime}</td>
        <td>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={openLogTimeModal}
          >
            Work History
          </Button>
        </td>
        <td>
          {currentlyWorkingOnTaskId === "" && (
            <Button variant="primary" size="sm" onClick={handleStartWork}>
              Start work
            </Button>
          )}
          {currentlyWorkingOnTaskId === task.id && (
            <Button variant="primary" size="sm" onClick={handleStopWork}>
              Stop work
            </Button>
          )}
        </td>
      </tr>
      {showModal && (
        <LogTimeModal
          taskId={task.id}
          showModal={showModal}
          hideModal={hideModal}
        />
      )}
    </Fragment>
  );
};

export default Task;
