import Card from "../components/Card";
import { Button, Form, Modal } from "react-bootstrap";
import { BoxArrowInRight } from "react-bootstrap-icons";
import React, {Fragment, useEffect, useState} from "react";
import ValidationError from "../components/ValidationError";
import useValidateForm from "../hooks/useValidateForm";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {useNavigate} from "react-router-dom";

import { login, setUp2FA } from "../features/users/userSlice";
import { LoginData } from "../classes/userData";

import classes from './Login.module.css';
import { parseJwt } from "../helpers/helpers";

const Login = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const {user, isError, message, isSuccess} = useAppSelector(state => state.users);
    const [userData, setUserData] = useState<LoginData>({
        username: '',
        password: ''
    });

    const [url, setUrl] = useState('');
    const [codeText, setCodeText]   = useState('');
    const [showModal, setShowModal] = useState(false);
    const formIsValid               = useValidateForm(userData);

    const {username, password} = userData;

    useEffect(() => {
        if (isSuccess || user !== null) {
            navigate('/');
        } 
    }, [isError, navigate, user, isSuccess]);

    const closeModal = () => {setShowModal(false)};

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserData(prevData => ({
            ...prevData,
            [e.target.name]: e.target.value
        }));
    }

    const handleCodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCodeText(e.target.value);
    }

    const handle2FALogin = () => {
        // TODO send to backend

        dispatch(login(userData));
        console.log(userData, codeText);
    }

    const renderModal = () => {
        return (
            <Modal show={showModal} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>2 Step Authentication</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p>Please enter your 6 digit code which was sent to your email</p>
                    <Form.Group className="mb-3" controlId="formBasicUserName">
                        <Form.Control
                            placeholder="Code on your email"
                            name="codeText"
                            value={codeText}
                            onChange={handleCodeInputChange}
                            maxLength={6}
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>Close</Button>
                    <Button variant="primary" onClick={handle2FALogin}>Login</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    const submitFormHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dispatch(login(userData));

        setShowModal(true);
    }
    
    return (
        <Card style={{ marginTop: '10rem' }}>
            <div className={classes.header}>
                <BoxArrowInRight size={50} color='royalblue' style={{ marginRight: '.5rem' }} />
                <h1 className='text-primary'>Login</h1>
            </div>
            <p className="text-secondary">Please log in</p>
            <Form onSubmit={submitFormHandler}>
                <Form.Group className="mb-3" controlId="formBasicUserName">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        placeholder="Enter your username"
                        name="username"
                        value={username}
                        onChange={handleInputChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type='password'
                        name='password'
                        placeholder="Enter your password"
                        value={password}
                        onChange={handleInputChange}
                    />
                    {message !== '' && <ValidationError>Invalid credentials</ValidationError>}
                </Form.Group>
                <Button variant="primary" type="submit" disabled={!formIsValid}>Login</Button>
            </Form>
            <Fragment>
                {/* NOTE TO SELF: SET false BACK TO showModal WHEN BACKEND 2FA IS IMPLEMENTED */}
                {false && renderModal()}
            </Fragment>
        </Card>
    );
}

export default Login;
