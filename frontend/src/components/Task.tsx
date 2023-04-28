import { Fragment, useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import LogTimeModal from "./LogTimeModal";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getWorkLogs, startTime, stopTime } from "../features/tasks/taskSlice";

interface TaskProps {
  task: any;
}

const Task: React.FC<TaskProps> = ({task}) => {
  const dispatch = useAppDispatch();
  const {workLogs} = useAppSelector(state => state.tasks);
  const [showModal, setShowModal] = useState(false);

  const {
    currentlyWorkingOnTaskId,
  } = useAppSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(getWorkLogs(task.id!));
  }, []);

  const openLogTimeModal = () => {
    setShowModal(true);
  };

  const hideModal = () => {
      setShowModal(false);
  }

  const getStatusFromCategory = (category: number) => {
    switch(category) {
      case 0:
        return 'UNKNOWN';
      case 1:
        return 'UNASSIGNED';
      case 2:
        return 'ASSIGNED'
      case 3:
        return 'ACCEPTED'
      case 4:
        return 'ACTIVE'
      case 250:
        return 'ENDED'
      default:
        return 'UNKNOWN'
    }
  }

  const hoursSpentInTotal = useMemo(() => {
      let sum = 0;
      workLogs.forEach(log => {
          sum += log.spent;
      })
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

            >
                Accept
          </Button>
         <Button
              className="m-0 p-0 px-2"
              variant="danger"

            >
              Decline
            </Button>
            </div>
                )}

        </td>
        <td>{task.name}</td>
        <td>{getStatusFromCategory(task.category)}</td>
        <td>{hoursSpentInTotal}h</td>
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
    )
}

export default Task;
