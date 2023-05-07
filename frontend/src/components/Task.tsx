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
  closeTask,
  reopenTask,
} from "../features/tasks/taskSlice";
import { toast } from "react-toastify";
import {getBaseUrl, parseJwt} from "../helpers/helpers";

interface TaskProps {
  task: any;
}

const Task: React.FC<TaskProps> = ({ task }) => {
  const dispatch = useAppDispatch();
  const {
    // workLogs,
    currentlyWorkingOnTaskId,
    isError,
    isSuccess,
    isLoading,
    message,
    isMyTaskError,
    isMyTaskSuccess,
    isMyTaskLoading,
    timerStarted
  } = useAppSelector((state) => state.tasks);
  const [showModal, setShowModal] = useState(false);
  const [workLogs, setWorkLogs] = useState<any[]>([]);
  const [workStarted, setWorkStarted] = useState(false);

  //uporabniki
  const usersState = useAppSelector((state) => state.users);
  const [currentUser, setUserName] = useState("");

  useEffect(() => {
    if (usersState.user === null) {
      return;
    }
    const token = JSON.parse(localStorage.getItem("user")!).token;
    const userData = parseJwt(token);
    setUserName(userData.sub);

  }, [usersState.user]);


const fetchData = async () => {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        const response = await fetch(`${getBaseUrl()}/api/task/${task.id}/time`, {
          method: 'GET',
          headers: {
            'Authorization': `JWT ${token}`
          }
        })
  
        const json = await response.json();
        setWorkLogs(json);
      };

  useEffect(() => {
    if (isMyTaskSuccess && !isMyTaskLoading) {
     
      dispatch(getTaskForUser());
      dispatch(reset());
      fetchData();
    }  if (isMyTaskError && !isMyTaskLoading) {
      toast.error(message);
      dispatch(reset());
    }
  
  }, [isMyTaskSuccess, isMyTaskError, isMyTaskLoading]);

  useEffect(() => {
    fetchData();
  }, [timerStarted]);

  const updateTimeValue = (logs: any) => {
    setWorkLogs(logs);
  }

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

  type UserSpent = {
    [username: string]: number;
  };

  const hoursSpentInTotal = useMemo(() => {

    const userSpent: UserSpent = {};
    // Loop through the data and populate the userSpent object
    workLogs.forEach(entry => {
      const { user: { username }, spent } = entry;
      
      if (!userSpent[username]) {
        userSpent[username] = spent;
      } else {
        userSpent[username] += spent;
      }
    });
  
    const userSpentList = [];

    if (Object.keys(userSpent).length !== 0) {
    for (const username in userSpent) {
      if (username === currentUser) {
        userSpentList.push(
          <p className="m-0 p-0" key={username}>{`${userSpent[username].toFixed(2)}h`}</p>
        );
        }
      else {
        userSpentList.push(
          <p className="m-0 p-0" key={username}>{`${username}: ${userSpent[username].toFixed(2)}h`}</p>
        );
      }
      
    }
  } else {
    userSpentList.push(<p className="m-0 p-0">0h</p>)
  }
    return userSpentList
  }, [workLogs]);

  const handleStartWork = () => {
    dispatch(startTime(task.id));
    setWorkStarted(true);
  };

  const handleStopWork = () => {
    dispatch(stopTime(task.id));
    setWorkStarted(false);
  };
  const handleClose = () => {
    dispatch(closeTask(task.id));
  };
  const handleReopen = () => {
    dispatch(reopenTask(task.id));
  };

  let Remainingtime = workLogs.length > 0 ? workLogs?.[workLogs.length - 1]?.remaining ?? undefined : task.remaining

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
                Decline
              </Button>
            </div>
          )}
          {task.category === 3 && (
            <Button
              className="m-0 p-0 px-2"
              variant="primary"
              onClick={() => dispatch(releaseTask(task.id))}
            >
              Release 
            </Button>
          )}
        </td>
        <td>{task.name}</td>
        <td>{getStatusFromCategory(task.category)}</td>

        <td>{hoursSpentInTotal}</td>
        <td>{Remainingtime}h</td>
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
          {task.category === 3 && (
            workStarted ?
              <Button variant="primary" size="sm" onClick={handleStopWork}>
                Stop work
              </Button> :
              <Button variant="primary" size="sm" onClick={handleStartWork}>
                Start work
              </Button>
          )}
          {task.category === 4 && (
            <Button variant="primary" size="sm" onClick={handleStopWork}>
              Stop work
            </Button>
          )}
          {task.category !== 250 && Remainingtime === 0 && workLogs.length > 0 && (
            <Button variant="primary" size="sm" onClick={handleClose}>
              Close task
            </Button>
          )}
          {task.category === 250 && (
            <Button variant="primary" size="sm" onClick={handleReopen}>
              Reopen task
            </Button>
          )}
        </td>
      </tr>
      {showModal && (
        <LogTimeModal
          task={task}
          showModal={showModal}
          hideModal={hideModal}
          updateTimeValues={updateTimeValue}
        />
      )}
    </Fragment>
  );
};

export default Task;

