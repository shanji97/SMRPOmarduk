import {Button, Form, Modal} from "react-bootstrap";
import React, {useEffect, useMemo, useState} from "react";

import TimeInputs from "./TimeInputs";

interface LogTimeModalProps {
  showModal: boolean,
  hideModal: () => void
}

interface TimeLog {
  date: string,
  spentTime: number,
  remainingTime: number
}

const DUMMY_LOGS: TimeLog[] = [
  {
    date: new Date('2023-04-19').toString(),
    spentTime: 6,
    remainingTime: 5
  },
  {
    date: new Date('2023-04-20').toString(),
    spentTime: 5,
    remainingTime: 2
  },
  {
    date: new Date('2023-04-21').toString(),
    spentTime: 5,
    remainingTime: 1
  },
];

const LogTimeModal: React.FC<LogTimeModalProps> = ({showModal, hideModal}) => {
  const [show, setShow] = useState(showModal);
  const [showTodayLog, setShowTodayLog] = useState(false);
  const [logs, setLogs] = useState<TimeLog[]>(DUMMY_LOGS);

  const [initialLogs, setInitialLogs] = useState<React.ReactElement[]>([]);

  useEffect(() => {
    const timelogs = DUMMY_LOGS.map((log, i) => {
      return <TimeInputs key={i} index={i} onChange={handleChange} date={log.date} spentTimeInit={log.spentTime} remainingTimeInit={log.remainingTime} />
    })
    setInitialLogs(timelogs);
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
      const newLog: TimeLog = {date: Date.now().toString(), spentTime: 0, remainingTime: 0}
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

      const newLog: TimeLog = {date: oldLog.date, spentTime: -1, remainingTime: -1};
      if (spentTime === -1) {
        newLog.spentTime = oldLog.spentTime;
        newLog.remainingTime = remainingTime;
      } else if (remainingTime === -1) {
        newLog.spentTime = spentTime;
        newLog.remainingTime = oldLog.remainingTime;
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
