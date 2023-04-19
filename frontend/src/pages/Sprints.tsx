import React, {Fragment, useState} from "react";
import Card from "../components/Card";
import {Dropdown, DropdownButton, Modal, Table} from "react-bootstrap";
import classes from "./Users.module.css";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {PencilFill, Trash} from "react-bootstrap-icons";
import {deleteSprint} from "../features/sprints/sprintSlice";
import AddSprint from "./AddSprint";
import {toast} from "react-toastify";

const Sprints = () => {
  const dispatch = useAppDispatch();
  const {sprints} = useAppSelector(state => state.sprints);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setIndex] = useState(-1);
  const [sprintId, setSprintId] = useState('');

  const openEditModal = (index: number, sprintId: string) => {
    setIndex(index);
    setSprintId(sprintId);
    setShowModal(true);
  }

  const handleDeleteSprint = (sprintId: string) => {
    dispatch(deleteSprint(sprintId));
    toast.success('Sprint deleted!');
  }

  const closeModal = () => {
    setShowModal(false);
  }

  return (
    <Fragment>
      <Card style={{ width: "70%", marginTop: "1rem" }}>
        <Table striped bordered hover>
          <thead>
          <tr>
            <th>#</th>
            <th>Sprint name</th>
            <th>Velocity (hours)</th>
            <th>Date range</th>
          </tr>
          </thead>
          <tbody>
          {sprints.map((sprint, i) => {
            return (
              <tr key={i}>
                <td>{sprint.id}</td>
                <td>{sprint.name}</td>
                <td>{sprint.velocity}</td>
                <td>
                  <div className={classes.usernameContainer}>
                    {`${sprint.startDate} - ${sprint.endDate}`}
                    <DropdownButton id="dropdown-basic-button" title="Options">
                      <Dropdown.Item>Make active</Dropdown.Item>
                      <Dropdown.Item onClick={() => {openEditModal(i, sprint.id!)}}>Edit <PencilFill /></Dropdown.Item>
                      <Dropdown.Item onClick={() => {handleDeleteSprint(sprint.id!)}}>Delete <Trash /></Dropdown.Item>
                    </DropdownButton>
                  </div>
                </td>
              </tr>
            );
          })}
          </tbody>
        </Table>
      </Card>
      {showModal && <Modal
          show={showModal}
          onHide={closeModal}
          dialogClassName={classes.modal}
      >
          <Modal.Header closeButton>
              <Modal.Title>Edit sprint</Modal.Title>
          </Modal.Header>

          <Modal.Body>
              <AddSprint
                  isEdit
                  sprintId={sprintId}
                  nameInit={sprints[editIndex].name}
                  velocityInit={sprints[editIndex].velocity}
                  dateRangeInit={{
                    startDate: new Date(sprints[editIndex].startDate),
                    endDate: new Date(sprints[editIndex].endDate),
                    key: 'selection'
                  }}
              />
          </Modal.Body>
      </Modal>}
    </Fragment>
  );
}

export default Sprints;