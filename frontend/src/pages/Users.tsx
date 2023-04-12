import {DropdownButton, Table, Dropdown, Modal, Form, Button, Spinner} from "react-bootstrap";
import {Check, PencilFill, TrashFill, X} from "react-bootstrap-icons";
import Card from "../components/Card";
import React, {Fragment, useEffect, useState} from "react";
import {useNavigate} from 'react-router-dom';
import AddUser from "./AddUser";

import classes from './Users.module.css';
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { deleteUser, getAllUsers, getUser } from "../features/users/userSlice";
import { parseJwt } from "../helpers/helpers";
import {toast} from "react-toastify";

const Users = () => {
    const dispatch = useAppDispatch(); 
    const navigate = useNavigate();
    let {users, isAdmin, isLoading, userData} = useAppSelector(state => state.users);
    const [userId, setUserId]       = useState('');
    const [deleteUserId, setDeleteUserId]  = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editIndex, setEditIndex] = useState(-1);

    useEffect(() => {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        const isAdmin = parseJwt(token).isAdmin;
        const id = parseJwt(token).sid;
        setUserId(id);
        dispatch(getUser(id));
        if (!isAdmin) {
            navigate('/');
            return;
        }

        dispatch(getAllUsers());
    }, [isAdmin]);

    useEffect(() => {
        if (!userData.isAdmin) {
            navigate('/');
        }
    }, []);

    const openEditUserModal = (index: number) => {
        setEditIndex(index);
        setShowModal(true);
    }

    const closeModal = () => {
        setShowModal(false);
    }
    const closeDeleteModal = () => {setShowDeleteModal(false)}
    const handleDeleteUser = (uid: string) => {
        dispatch(deleteUser(uid));
        setShowDeleteModal(false);
        toast.success('User deleted!');
    }

    const renderDeleteModal = () => {
        return (
            <Modal show={showDeleteModal} onHide={closeDeleteModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmation</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p>Do you really want to delete this user?</p>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={closeDeleteModal}>No</Button>
                    <Button variant="primary" onClick={() => {handleDeleteUser(deleteUserId)}}>Yes</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    const openDeleteModal = (uid: string) => {
        setShowDeleteModal(true);
        setDeleteUserId(uid)
        if (userId === uid) {
            alert("Can't delete yourself");
            return;
        }
        renderDeleteModal()
    }

    if (isLoading) {
        return <Spinner animation="border" />;
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
                                            <Dropdown.Item onClick={() => {openDeleteModal(user.id!)}}>Delete <TrashFill /></Dropdown.Item>
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
            {showDeleteModal && renderDeleteModal()}
        </Fragment>
    );
}

export default Users;
