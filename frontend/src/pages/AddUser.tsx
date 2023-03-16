import {useEffect, useMemo, useState} from "react";
import {Button, Form} from "react-bootstrap";
import Card from "../components/Card";

import classes from './AddUser.module.css';
import useValidateForm from "../hooks/useValidateForm";
import ValidationError from "../components/ValidationError";
import {UserData} from "../../classes/userData";
import { useAppDispatch } from "../app/hooks";
import { createUser } from "../features/users/userSlice";

const MIN_USERNAME_LENGTH = 4;
const MIN_PASSWORD_LENGTH = 12;

interface AddUserProps {
    isEdit:       boolean,
    usernameInit: string,
    passwordInit: string,
    firstNameInit:string,
    lastNameInit: string,
    emailInit:    string,
    isAdminInit:  boolean,
    handleClose:  () => void
}


const AddUser: React.FC<AddUserProps> = (
    {
        isEdit,
        usernameInit,
        passwordInit,
        firstNameInit,
        lastNameInit,
        emailInit,
        isAdminInit,
        handleClose
    }) => {
    
    const dispatch = useAppDispatch();
    const [userData, setUserData] = useState({
        username: usernameInit,
        password: passwordInit,
        firstName: firstNameInit,
        lastName: lastNameInit,
        email: emailInit,
    });

    const {username, password, firstName, lastName, email} = userData;
    console.log(userData);

    const [isAdminRadio, setIsAdminRadio]   = useState(false);
    const [isUserRadio, setIsUserRadio]     = useState(true);
    const [passwordError, setPasswordError] = useState(false);
    const [passwordType, setPasswordType]   = useState('password');
    const formIsValid = useValidateForm(userData);

    useEffect(() => {
        if (isAdminInit) {
            setIsAdminRadio(true);
            setIsUserRadio(false);
        }
    }, []);

    let validCredentials = useMemo(() => {
        if (isEdit) {
            return  username.length >= MIN_USERNAME_LENGTH &&
                email.includes('@');
        } else {
            return  username.length >= MIN_USERNAME_LENGTH &&
                    password.length >= MIN_PASSWORD_LENGTH &&
                    email.includes('@');
        }
    }, [username, password, email]);  

    const userDataChangedHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserData(prevUserData => ({
            ...prevUserData,
            [e.target.name]: e.target.value
        }))
    }

    const adminChangeHandler = () => {
        setIsAdminRadio(isAdminRadio => !isAdminRadio);
        setIsUserRadio(false);
    }

    const userChangeHandler = () => {
        setIsUserRadio(isUserRadio => !isUserRadio);
        setIsAdminRadio(false);
    }

    const checkPasswordLength = () => {
        password.length < MIN_PASSWORD_LENGTH ? setPasswordError(true) : setPasswordError(false);
    }

    const handleShowPassword = () => {
        passwordType === 'password' ? setPasswordType('text') : setPasswordType('password');
    }

    const submitFormHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newUser: UserData = {
            username,
            password,
            firstName,
            lastName,
            email,
            isAdmin: isAdminRadio
        }

        if (isEdit) { 
            if (password) {
                const body = {
                    firstName,
                    lastName,
                    username,
                    email,
                    password
                }  
                // dispatch
            } else {
                const body = {
                    firstName,
                    lastName,
                    username,
                    email,
                } 
                // dispatch
            }
        }

        setUserData({
            username: '',
            password: '',
            firstName: '',
            lastName: '',
            email: '',
        })
        setIsUserRadio(true);
        setIsAdminRadio(false);
        if (isEdit) {
            handleClose();
        }
        // TODO send data to backend
    }

    if (isEdit) {
        return (
            <Form onSubmit={submitFormHandler}>
                <Form.Group className="mb-3" controlId="formBasicUserName">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        placeholder="Enter username"
                        name="username"
                        value={username}
                        onChange={userDataChangedHandler}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type={passwordType}
                        placeholder="Enter password"
                        name='password'
                        value={password}
                        onChange={userDataChangedHandler}
                        onBlur={checkPasswordLength}
                    />
                    <Form.Check type='checkbox' id='showPassword' label='Show password' onClick={handleShowPassword} />
                    {passwordError && <ValidationError>Password must be at least 12 characters long</ValidationError>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        placeholder="Enter your name"
                        name='firstName'
                        value={firstName}
                        onChange={userDataChangedHandler}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicSurname">
                    <Form.Label>Lastname</Form.Label>
                    <Form.Control
                        placeholder="Enter your lastname"
                        name='lastName'
                        value={lastName}
                        onChange={userDataChangedHandler}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>E-mail</Form.Label>
                    <Form.Control
                        placeholder="Enter your e-mail"
                        name='email'
                        value={email}
                        onChange={userDataChangedHandler}
                    />
                </Form.Group>

                <div className={classes.radioButtonContainer}>
                    <Form.Check
                        type='radio'
                        id='admin'
                        label='Administrator'
                        checked={isAdminRadio}
                        onClick={adminChangeHandler}
                    />
                    <Form.Check
                        type='radio'
                        id='user'
                        label='User'
                        checked={isUserRadio}
                        onClick={userChangeHandler}
                    />
                </div>
                <Button variant="primary" type="submit" disabled={!validCredentials}>
                    Save
                </Button>
            </Form>
        );
    }

    return (
        <Card>
            <h1 className='text-primary'>Dodajanje uporabnika</h1>
            <Form onSubmit={submitFormHandler}>
                <Form.Group className="mb-3" controlId="formBasicUserName">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        placeholder="Enter username"
                        name="username"
                        value={username}
                        onChange={userDataChangedHandler}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type={passwordType}
                        placeholder="Enter password"
                        name='password'
                        value={password}
                        onChange={userDataChangedHandler}
                        onBlur={checkPasswordLength}
                    />
                    <Form.Check type='checkbox' id='showPassword' label='Show password' onClick={handleShowPassword} />
                    {passwordError && <ValidationError>Password must be at least 12 characters long</ValidationError>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        placeholder="Enter your name"
                        name='firstName'
                        value={firstName}
                        onChange={userDataChangedHandler}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicSurname">
                    <Form.Label>Lastname</Form.Label>
                    <Form.Control
                        placeholder="Enter your lastname"
                        name='lastName'
                        value={lastName}
                        onChange={userDataChangedHandler}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>E-mail</Form.Label>
                    <Form.Control
                        placeholder="Enter your e-mail"
                        name='email'
                        value={email}
                        onChange={userDataChangedHandler}
                    />
                </Form.Group>

                <div className={classes.radioButtonContainer}>
                    <Form.Check
                        type='radio'
                        id='admin'
                        label='Administrator'
                        checked={isAdminRadio}
                        onChange={adminChangeHandler}
                    />
                    <Form.Check
                        type='radio'
                        id='user'
                        label='User'
                        checked={isUserRadio}
                        onChange={userChangeHandler}
                    />
                </div>

                <Button variant="primary" type="submit" disabled={!formIsValid || !validCredentials}>
                    Dodaj
                </Button>
            </Form>
        </Card>
    )
}

export default AddUser;
