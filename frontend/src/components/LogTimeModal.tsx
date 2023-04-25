import {Button, Form, Modal} from "react-bootstrap";
import React, {useEffect, useMemo, useState} from "react";

import TimeInputs from "./TimeInputs";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getWorkLogs } from "../features/tasks/taskSlice";

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
  const {workLogs} = useAppSelector(state => state.tasks);
  const [show, setShow] = useState(showModal);
  const [showTodayLog, setShowTodayLog] = useState(false);
  const [logs, setLogs] = useState<TimeLog[]>([]);

  const [initialLogs, setInitialLogs] = useState<React.ReactElement[]>([]);

  useEffect(() => {
    dispatch(getWorkLogs(taskId));
  }, []);

  useEffect(() => {
    setLogs(workLogs);
  }, [workLogs]);

  useEffect(() => {
    const timelogs = workLogs.map((log, i) => {
      return <TimeInputs 
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
      const newLog: TimeLog = {date: Date.now().toString(), spent: 0, remaining: 0, }
      return [...prevLogs, newLog];
    });
    setInitialLogs(prevLogs => {
      const newLogComponent = <TimeInputs key={Math.random()} index={prevLogs.length} onChange={handleChange} date={(new Date()).toString()} spentTimeInit={0} remainingTimeInit={0} />
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

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(logs);
    hideModal();
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
        <Form onSubmit={handleSave}>
          {initialLogs}
          <Button type='submit' variant="primary">Save</Button>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

export default LogTimeModal;
