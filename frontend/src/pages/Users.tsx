import {DropdownButton, Table, Dropdown, Modal} from "react-bootstrap";
import {Check, PencilFill, TrashFill, X} from "react-bootstrap-icons";
import Card from "../components/Card";
import React, {Fragment, useState} from "react";
import AddUser from "./AddUser";

import classes from './Users.module.css';

const DUMMY_USERS = [
    {
        username: 'tinec',
        password: '123123',
        name: 'Tine',
        surname: 'Crnugelj',
        email: 'tine.crnugelj@gmail.com',
        isAdmin: false
    },
    {
        username: 'martind',
        password: '123123',
        name: 'Martin',
        surname: 'Dagarin',
        email: 'martin.dagarin@gmail.com',
        isAdmin: true
    },
    {
        username: 'simonk',
        password: '123123',
        name: 'Simon',
        surname: 'Klavzar',
        email: 'simon.klavzar@gmail.com',
        isAdmin: false
    },
    {
        username: 'matevzl',
        password: '123123',
        name: 'Matevz',
        surname: 'Lapajne',
        email: 'matevz.lapajne@gmail.com',
        isAdmin: true
    },
];

const Users = () => {
    const [showModal, setShowModal] = useState(false);
    const [editIndex, setEditIndex] = useState(-1);

    const openEditUserModal = (index: number) => {
        setEditIndex(index);
        setShowModal(true);
    }

    const closeModal = () => {
        setShowModal(false);
    }

    const handleDeleteUser = (i: number) => {
        console.log(i);
    }

    return (
        <Fragment>
            <Card style={{ width: '70%' }}>
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Username</th>
                        <th>Password</th>
                        <th>Name</th>
                        <th>Surname</th>
                        <th>Email</th>
                        <th>Admin</th>
                    </tr>
                    </thead>
                    <tbody>
                    {DUMMY_USERS.map((user, i) => {
                        return (
                            <tr key={i}>
                                <td>{i+1}</td>
                                <td>
                                    <div className={classes.usernameContainer}>
                                        {user.username}
                                        <DropdownButton id='dropdown-basic-button' title=''>
                                            <Dropdown.Item onClick={() => {openEditUserModal(i)}}>Edit <PencilFill className={classes.pencilBtn} /></Dropdown.Item>
                                            <Dropdown.Item onClick={() => {handleDeleteUser(i)}}>Delete <TrashFill /></Dropdown.Item>
                                        </DropdownButton>
                                    </div>
                                </td>
                                <td>{user.password}</td>
                                <td>{user.name}</td>
                                <td>{user.surname}</td>
                                <td>{user.email}</td>
                                <td>{user.isAdmin ? <Check size={30} color='green' /> : <X size={30} color='red' />}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </Table>
            </Card>
            <Fragment>
                {showModal && <Modal
                    show={showModal}
                    onHide={closeModal}
                    dialogClassName={classes.modal}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Edit user</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <AddUser
                            isEdit
                            usernameInit={DUMMY_USERS[editIndex].username}
                            passwordInit={DUMMY_USERS[editIndex].password}
                            nameInit={DUMMY_USERS[editIndex].name}
                            surnameInit={DUMMY_USERS[editIndex].surname}
                            emailInit={DUMMY_USERS[editIndex].email}
                            isAdminInit={DUMMY_USERS[editIndex].isAdmin}
                            handleClose={closeModal}
                        />
                    </Modal.Body>
                </Modal>}
            </Fragment>
        </Fragment>
    );
}

export default Users;
