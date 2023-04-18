import Card from "../components/Card";
import { Button, Form, Modal } from "react-bootstrap";
import { BoxArrowInRight } from "react-bootstrap-icons";
import React, {Fragment, useEffect, useState} from "react";
import ValidationError from "../components/ValidationError";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {useNavigate} from "react-router-dom";
import { login, reset } from "../features/users/userSlice";
import { LoginData } from "../classes/userData";
import classes from './Login.module.css';
import { toast } from "react-toastify";

const Login = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const {
        user, 
        isError, 
        message, 
        isSuccess, 
    } = useAppSelector(state => state.users);
    const [userData, setUserData] = useState<LoginData>({
        username: '',
        password: '',
        twoFa: ''
    });

    const {username, password, twoFa} = userData;
    const formIsValid                 = username !== '' && password !== '';

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
        if (user !== null || isSuccess) {
            navigate('/');
            return () => {
                dispatch(reset());
            }
        }
    }, [isError, navigate, user, isSuccess]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserData(prevData => ({
            ...prevData,
            [e.target.name]: e.target.value
        }));
    }

    const submitFormHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dispatch(login(userData));
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
                    {message === 'Unauthorized' && <ValidationError>Invalid credentials</ValidationError>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>2-Factor Authentication code</Form.Label>
                    <Form.Control
                        name='twoFa'
                        placeholder="Enter your code"
                        value={twoFa}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={!formIsValid}>Login</Button>
            </Form>
        </Card>
    );
}

export default Login;
