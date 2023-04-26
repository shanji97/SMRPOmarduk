import { Fragment, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import LogTimeModal from "./LogTimeModal";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { reset, startTime, stopTime } from "../features/tasks/taskSlice";
import { toast } from "react-toastify";

interface TaskProps {
  task: any;
}

const Task: React.FC<TaskProps> = ({ task }) => {
  // console.log(task);
  const dispatch = useAppDispatch();
  const [showModal, setShowModal] = useState(false);

  const {
    currentlyWorkingOnTaskId,
    isTimerSuccess,
    isTimerError,
    isLoading,
    message,
  } = useAppSelector((state) => state.tasks);

  const openLogTimeModal = () => {
    setShowModal(true);
  };

  const hideModal = () => {
    setShowModal(false);
  };

  const handleStartWork = () => {
    dispatch(startTime(task.id));
  };

  const handleStopWork = () => {
    dispatch(stopTime(task.id));
  };

  return (
    <Fragment>
      <tr key={task.id}>
        <td>{task.id}</td>
        <td>{task.name}</td>
        <td>
          <Button className="align-middle text-decoration-none" variant="link">
            {task.status}
          </Button>
        </td>

        <td>{task.spent}</td>
        <td>{task.remaining}</td>
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
