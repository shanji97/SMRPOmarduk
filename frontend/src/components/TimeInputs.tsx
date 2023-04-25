import React, {useState} from "react";
import {Form} from "react-bootstrap";

import classes from "./LogTimeModal.module.css";

interface TimeInputsProps {
  index: number,
  onChange: (id: number, timeSpent: number, timeRemaining: number) => void,
  date: string,
  spentTimeInit: number,
  remainingTimeInit: number
}
const TimeInputs: React.FC<TimeInputsProps> = ({index, onChange, date, spentTimeInit, remainingTimeInit}) => {
  const [spentTime, setSpentTime] = useState(spentTimeInit);
  const [remainingTime, setRemainingTime] = useState(remainingTimeInit);

  const handleSpentTimeChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpentTime(+e.currentTarget.value);
    onChange(index, +e.currentTarget.value, -1);
  }
  const handleRemainingChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRemainingTime(+e.currentTarget.value);
    onChange(index, -1, +e.currentTarget.value);
  }

  return (
    <div className={classes.inputsContainer}>
      <p>{date}</p>
      <Form.Group className={classes.inputGroup} controlId="formBasicworkspent">
        <div style={{display: 'inline-flex'}}>
          <Form.Label>Spent</Form.Label>
          <Form.Control
            name='spentTime'
            type='number'
            value={spentTime}
            onChange={handleSpentTimeChanged}
            min={0}
          />
        </div>
      </Form.Group>
      <span>hours,&nbsp;</span>
      <Form.Group className={classes.inputGroup} controlId="formBasicremaining">
        <div style={{display: 'inline-flex'}}>
          <Form.Label>Remaining</Form.Label>
          <Form.Control
            className={classes.input}
            type='number'
            name='remainingTime'
            value={remainingTime}
            onChange={handleRemainingChanged}
            min={0}
          />
        </div>
      </Form.Group>
    </div>
  );
}

export default TimeInputs;
