import {Button, Form, Modal} from "react-bootstrap";
import React, {useEffect, useMemo, useState} from "react";

import TimeInputs from "./TimeInputs";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getWorkLogs, reset } from "../features/tasks/taskSlice";
import { toast } from "react-toastify";

interface LogTimeModalProps {
  taskId: string,
  showModal: boolean,
  hideModal: () => void
}

interface TimeLog {
  date: string,
  taskId?: string,
  userId?: string,
  spent: number,
  remaining: number,
  description?: string,
  dateCreated?: string,
  dateUpdated?: string,
}

const LogTimeModal: React.FC<LogTimeModalProps> = ({taskId, showModal, hideModal}) => {
  const dispatch = useAppDispatch();
  const {workLogs, isSuccess, isError, message} = useAppSelector(state => state.tasks);
  const [show, setShow] = useState(showModal);
  const [showTodayLog, setShowTodayLog] = useState(false);
  const [logs, setLogs] = useState<TimeLog[]>([]);

  const [initialLogs, setInitialLogs] = useState<React.ReactElement[]>([]);

  useEffect(() => {
    return () => {
      dispatch(reset());
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(getWorkLogs(taskId));
  }, []);

  useEffect(() => {
    setLogs(workLogs);
  }, [workLogs]);

  useEffect(() => {
    const timelogs = workLogs.map((log, i) => {
      return <TimeInputs 
                taskId={taskId}
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

  const today = useMemo(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }, []);

  const hasToday = useMemo(() => {
    return logs.some(log => {
      const today = new Date();
      const d = new Date(log.date);
      return d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate();
    });
  }, [logs]);

  const closeModal = () => {
    hideModal();
  };

  const handleShowTodayLog = () => {
    setLogs(prevLogs => {
      const newLog: TimeLog = {date: today, spent: 0, remaining: 0, }
      return [...prevLogs, newLog];
    });
    setInitialLogs(prevLogs => {
      const newLogComponent = <TimeInputs taskId={taskId} key={Math.random()} index={prevLogs.length} onChange={handleChange} date={today} spentTimeInit={0} remainingTimeInit={0} />
      const oldLogComponents = [...prevLogs];
      return [...oldLogComponents, newLogComponent];
    });

    setShowTodayLog(true);
  }

  const handleChange = (index: number, spentTime: number, remainingTime: number) => {
    setLogs(prevLogs => {
      let oldLogIndex = index;
      let oldLog = prevLogs[index];

      const newLog: TimeLog = {date: oldLog.date, spent: -1, remaining: -1, taskId: oldLog.taskId, userId: oldLog.userId};
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
          {!hasToday && !showTodayLog && <Button style={{marginLeft: '1rem'}} onClick={handleShowTodayLog}>Log today's work</Button>}
        </div>
      </Modal.Header>

      <Modal.Body>
          {initialLogs}
      </Modal.Body>
    </Modal>
  )
}

export default LogTimeModal;
