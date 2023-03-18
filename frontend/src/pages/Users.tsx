import {DropdownButton, Table, Dropdown, Modal} from "react-bootstrap";
import {Check, PencilFill, TrashFill, X} from "react-bootstrap-icons";
import Card from "../components/Card";
import React, {Fragment, useEffect, useState} from "react";
import {useNavigate} from 'react-router-dom';
import AddUser from "./AddUser";

import classes from './Users.module.css';
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { deleteUser, getAllUsers } from "../features/users/userSlice";
import { parseJwt } from "../helpers/helpers";

const Users = () => {
    const dispatch = useAppDispatch(); 
    const navigate = useNavigate();
    let {users, isAdmin} = useAppSelector(state => state.users);
    const [showModal, setShowModal] = useState(false);
    const [editIndex, setEditIndex] = useState(-1);

    useEffect(() => {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        const isAdmin = parseJwt(token).isAdmin;
        if (!isAdmin) {
            navigate('/');
            return;
        }

        dispatch(getAllUsers());
    }, [isAdmin]);

    const openEditUserModal = (index: number) => {
        setEditIndex(index);
        setShowModal(true);
    }

    const closeModal = () => {
        setShowModal(false);
    }

    const handleDeleteUser = (userId: string) => {
        dispatch(deleteUser(userId));
        dispatch(getAllUsers());
    }

    return (
        <Fragment>
            <Card style={{ width: '70%', marginTop: '1rem' }}>
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Username</th>
                        <th>Name</th>
                        <th>Surname</th>
                        <th>Email</th>
                        <th>Admin</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user, i) => {
                        return (
                            <tr key={i}>
                                <td>{user.id}</td>
                                <td>
                                    <div className={classes.usernameContainer}>
                                        {user.username}
                                        <DropdownButton id='dropdown-basic-button' title=''>
                                            <Dropdown.Item onClick={() => {openEditUserModal(i)}}>Edit <PencilFill className={classes.pencilBtn} /></Dropdown.Item>
                                            <Dropdown.Item onClick={() => {handleDeleteUser(user.id!)}}>Delete <TrashFill /></Dropdown.Item>
                                        </DropdownButton>
                                    </div>
                                </td>
                                <td>{user.firstName}</td>
                                <td>{user.lastName}</td>
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
                            idInit={users[editIndex].id}
                            usernameInit={users[editIndex].username}
                            passwordInit={users[editIndex].password}
                            passwordOldInit=''
                            confirmPasswordInit=''
                            firstNameInit={users[editIndex].firstName}
                            lastNameInit={users[editIndex].lastName}
                            emailInit={users[editIndex].email}
                            isAdminInit={users[editIndex].isAdmin}
                            handleClose={closeModal}
                        />
                    </Modal.Body>
                </Modal>}
            </Fragment>
        </Fragment>
    );
}

export default Users;
