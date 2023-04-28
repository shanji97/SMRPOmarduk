import {Button, Form} from "react-bootstrap";
import classes from "./LogTimeModal.module.css";
import React, {useState} from "react";
import {logWork} from "../features/tasks/taskSlice";
import {toast} from "react-toastify";
import {useAppDispatch} from "../app/hooks";

interface CustomTimeLogProps {
  taskId: string
  userId: string
  hide: () => void
}

const CustomTimeLog: React.FC<CustomTimeLogProps> = ({hide, taskId, userId}) => {
  const dispatch = useAppDispatch();
  const [newTimeLogData, setNewTimeLogData] = useState({
    date: '',
    spent: 0,
    remaining: 0
  });

  const {date, spent, remaining} = newTimeLogData;

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTimeLogData(prevData => ({
      ...prevData,
      [e.target.name]: e.target.value
    }));
  }

  const submitTime = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const body = {
      taskId,
      userId,
      date,
      spent,
      remaining,
      description: "Log",
      type: 'new'
    };

    dispatch(logWork(body));
    toast.success("Work logged!");
    hide();
  }

  return (
    <Form onSubmit={submitTime}>
      <div className={classes.inputsContainer}>
        <Form.Group
          className={classes.inputGroup}
          controlId="formBasicworkspent"
        >
          <div style={{ display: "inline-flex" }}>
            <Form.Control
              name="date"
              type="text"
              placeholder='2023-29-04'
              value={date}
              onChange={handleFormDataChange}
              style={{ width: '120px' }}
            />
          </div>
        </Form.Group>
        <Form.Group
          className={classes.inputGroup}
          controlId="formBasicworkspent"
        >
          <div style={{ display: "inline-flex" }}>
            <Form.Label>Spent</Form.Label>
            <Form.Control
              name="spent"
              type="number"
              value={spent}
              onChange={handleFormDataChange}
              min={0}
              style={{ width: '100px' }}
            />
          </div>
        </Form.Group>
        <span style={{ marginTop: ".9rem" }}>hours,&nbsp;</span>
        <Form.Group
          className={classes.inputGroup}
          controlId="formBasicremaining"
        >
          <div style={{ display: "inline-flex" }}>
            <Form.Label>Remaining</Form.Label>
            <Form.Control
              className={classes.input}
              type="number"
              name="remaining"
              value={remaining}
              onChange={handleFormDataChange}
              min={0}
              style={{ width: '100px' }}
            />
          </div>
        </Form.Group>
        <Button type="submit" style={{ height: "2.5rem", marginTop: ".5rem" }}>
          Save
        </Button>
        <Button onClick={hide} variant='danger' style={{ height: "2.5rem", marginTop: ".5rem", marginLeft: '.5rem' }}>
          Discard
        </Button>
      </div>
    </Form>
  );
}

export default CustomTimeLog;