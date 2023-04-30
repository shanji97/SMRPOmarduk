import React, {Fragment, useEffect, useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";

import classes from "./LogTimeModal.module.css";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { parseJwt } from "../helpers/helpers";
import {deleteWork, logWork, reset} from "../features/tasks/taskSlice";
import { toast } from "react-toastify";
import {Check, TrashFill} from "react-bootstrap-icons";

interface TimeInputsProps {
  taskId: string
  userId: string
  index: number
  onChange: (id: number, timeSpent: number, timeRemaining: number) => void
  date: string
  spentTimeInit: number
  remainingTimeInit: number
}
const TimeInputs: React.FC<TimeInputsProps> = ({
  taskId,
  index,
  onChange,
  date,
  spentTimeInit,
  remainingTimeInit,
  userId
}) => {
  const dispatch = useAppDispatch();
  const { isError, message, isSuccess } = useAppSelector(
    (state) => state.tasks
  );
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [spentTime, setSpentTime] = useState(spentTimeInit);
  const [remainingTime, setRemainingTime] = useState(remainingTimeInit);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    return () => {
      dispatch(reset());
    };
  }, [isSuccess, message, isError]);

  const handleSpentTimeChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpentTime(+e.currentTarget.value);
    onChange(index, +e.currentTarget.value, -1);
  };
  const handleRemainingChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRemainingTime(+e.currentTarget.value);
    onChange(index, -1, +e.currentTarget.value);
  };

  const handleOpenDeleteModal = () => {
    setOpenDeleteModal(true);
  }

  const handleDeleteLog = () => {
    const body = {
      taskId,
      userId,
      date
    }
    dispatch(deleteWork(body));
    setOpenDeleteModal(false);
  }

  const submitTimes = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = {
      taskId: taskId,
      userId: userId,
      date: date,
      spent: spentTime,
      remaining: remainingTime,
      description: "Log",
      type: 'update'
    };

    dispatch(logWork(body));
    toast.success("Work logged!");
  };

  const renderDeleteModal = () => {
    return (
      <Modal show={openDeleteModal} onHide={() => {setOpenDeleteModal(false)}}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this work log?</Modal.Body>
        <Modal.Footer>
          <Button variant="default" onClick={() => {setOpenDeleteModal(false)}}>
            Cancel
          </Button>
          <Button type='submit' variant="danger" onClick={handleDeleteLog}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return (
    <Fragment>
      <Form onSubmit={submitTimes}>
        <div className={classes.inputsContainer}>
          <p style={{ marginTop: ".9rem", paddingRight: "1rem" }}>{date}</p>
          <Form.Group
            className={classes.inputGroup}
            controlId="formBasicworkspent"
          >
            <div style={{ display: "inline-flex" }}>
              <Form.Label>Spent</Form.Label>
              <Form.Control
                name="spentTime"
                type="number"
                value={spentTime}
                onChange={handleSpentTimeChanged}
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
                name="remainingTime"
                value={remainingTime}
                onChange={handleRemainingChanged}
                step={0.1}
                style={{ width: '100px' }}
              />
            </div>
          </Form.Group>
          <Button type="submit" variant='success' style={{ height: "2.5rem", marginTop: ".5rem" }}>
            <Check />
          </Button>
          <Button onClick={handleOpenDeleteModal} variant='danger' style={{ height: "2.5rem", marginTop: ".5rem", marginLeft: '.3rem' }}>
            <TrashFill />
          </Button>
        </div>
      </Form>
      {openDeleteModal && renderDeleteModal()}
    </Fragment>
  );
};

export default TimeInputs;
