import {Button, Modal} from "react-bootstrap";
import React, {useEffect, useMemo, useState} from "react";

import TimeInputs from "./TimeInputs";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getWorkLogs, reset } from "../features/tasks/taskSlice";
import { toast } from "react-toastify";
import CustomTimeLog from "./CustomTimeLog";
import {parseJwt} from "../helpers/helpers";

interface LogTimeModalProps {
  task: any,
  showModal: boolean,
  hideModal: () => void
  updateTimeValues: (logs: any) => void
}

export interface TimeLog {
  date: string,
  taskId?: string,
  userId?: string,
  spent: number,
  remaining: number,
  description?: string,
  dateCreated?: string,
  dateUpdated?: string,
  user: {
    dateCreated?: string,
    dateUpdated?: string,
    deleted: boolean,
    description?: string,
    email: string,
    firstName: string,
    id: string,
    isAdmin: boolean,
    lastName: string,
    username: string
  }
}

const LogTimeModal: React.FC<LogTimeModalProps> = ({task, showModal, hideModal, updateTimeValues}) => {
  const dispatch = useAppDispatch();
  const {user} = useAppSelector(state => state.users);
  const [userId, setUserId] = useState('');
  const {workLogs, isSuccess, isError, message} = useAppSelector(state => state.tasks);
  const [show, setShow] = useState(showModal);
  const [showTodayLog, setShowTodayLog] = useState(false);
  const [logs, setLogs] = useState<TimeLog[]>([]);

  const [initialLogs, setInitialLogs] = useState<React.ReactElement[]>([]);

  useEffect(() => {
    if (user === null) {
      return;
    }
    const token = JSON.parse(localStorage.getItem("user")!).token;
    const userData = parseJwt(token);

    setUserId(userData.sid);
  }, [user]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    return () => {
      dispatch(reset());
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(getWorkLogs(task.id!));
  }, []);

  useEffect(() => {
    setLogs(workLogs);
  }, [workLogs]);

  useEffect(() => {
    const timelogs = workLogs.map((log, i) => {
      return <TimeInputs
                taskId={task.id!}
                userId={userId}
                key={i} 
                index={i} 
                onChange={handleChange} 
                date={log.date} 
                spentTimeInit={log.spent} 
                remainingTimeInit={log.remaining} 
             />
    })
    setInitialLogs(timelogs);
  }, [workLogs]);

  const lastRemaining = useMemo(() => {
    if (workLogs.length === 0) {
      return task.remaining;
    }

    const latestIndex = workLogs.reduce((latestIndex, log, currentIndex) => {
      const latestDate = new Date(workLogs[latestIndex].date);
      const currentDate = new Date(log.date);
      return currentDate > latestDate ? currentIndex : latestIndex;
    }, 0);

    return workLogs[latestIndex].remaining;
  }, [workLogs]);

  const closeModal = () => {
    //updateTimeValues(logs);
    hideModal();
  };

  const handleShowTodayLog = () => {
    setShowTodayLog(true);
  }

  const handleHideTodayLog = () => {
    setShowTodayLog(false);
  }

  const handleChange = (index: number, spentTime: number, remainingTime: number) => {
    setLogs(prevLogs => {
      let oldLogIndex = index;
      let oldLog = prevLogs[index];

      const newLog: TimeLog = {
        date: oldLog.date, 
        spent: -1, 
        remaining: -1, 
        taskId: oldLog.taskId, 
        userId: oldLog.userId,
        user: oldLog.user
      };

      if (spentTime === -1) {
        newLog.spent = oldLog.spent;
        newLog.remaining = remainingTime;
      } else if (remainingTime === -1) {
        newLog.spent = spentTime;
        newLog.remaining = oldLog.remaining;
      }
      const newHours = [...prevLogs];
      newHours[oldLogIndex] = newLog;
      return newHours;
    });
  }

  return (
    <Modal show={show} onHide={closeModal} dialogClassName="modal-lg">
      <Modal.Header closeButton>
        <div style={{display: 'inline-flex'}}>
          <Modal.Title>Log work</Modal.Title>
          {!showTodayLog && <Button style={{marginLeft: '1rem'}} onClick={handleShowTodayLog}>New log</Button>}
        </div>
      </Modal.Header>

      <Modal.Body>
          {showTodayLog && <CustomTimeLog lastRemaining={lastRemaining} userId={userId} taskId={task.id!} hide={handleHideTodayLog} />}
          {initialLogs}
      </Modal.Body>
    </Modal>
  )
}

export default LogTimeModal;
