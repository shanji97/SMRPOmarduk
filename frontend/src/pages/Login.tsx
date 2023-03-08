import Card from "../components/Card";
import { Button, Form } from "react-bootstrap";
import { BoxArrowInRight } from "react-bootstrap-icons";
import React, { useState } from "react";

import classes from './Login.module.css';
import useValidateForm from "../hooks/useValidateForm";

const Login = () => {
    const [userData, setUserData] = useState({
        username: '',
        password: ''
    });
    const formIsValid = useValidateForm(userData);

    const {username, password} = userData;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserData(prevData => ({
            ...prevData,
            [e.target.name]: e.target.value
        }));
    }

    const submitFormHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    }
    
    return (
        <Card>
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
                </Form.Group>

                <Button variant="primary" type="submit" disabled={!formIsValid}>Login</Button>
            </Form>
        </Card>
    );
}

export default Login;
