import {useEffect, useMemo, useState} from "react";
import {Button, Form, Spinner} from "react-bootstrap";
import Card from "../components/Card";

import classes from './AddUser.module.css';
import useValidateForm from "../hooks/useValidateForm";
import useMatchingPasswords from "../hooks/useMatchingPasswords";
import ValidationError from "../components/ValidationError";
import {UserData, UserDataEdit} from "../classes/userData";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { createUser, editUser, getAllUsers, commonPassword, reset } from "../features/users/userSlice";
import { parseJwt} from "../helpers/helpers";
import {useNavigate} from 'react-router-dom';
import PasswordStrengthBar from "react-password-strength-bar";
import {toast} from "react-toastify";

const MIN_USERNAME_LENGTH = 4;
const MIN_PASSWORD_LENGTH = 12;

interface AddUserProps {
    isEdit:              boolean,
    idInit?:             string,
    usernameInit:        string,
    passwordOldInit?:    string,
    passwordInit:        string,
    confirmPasswordInit: string,
    firstNameInit:       string,
    lastNameInit:        string,
    emailInit:           string,
    isAdminInit:         boolean,
    editProfile?:        boolean,
    handleClose:         () => void
}


const AddUser: React.FC<AddUserProps> = (
    {
        isEdit,
        idInit,
        usernameInit,
        passwordInit,
        passwordOldInit,
        confirmPasswordInit,
        firstNameInit,
        lastNameInit,
        emailInit,
        isAdminInit,
        handleClose,
        editProfile,
    }) => {
    
    const dispatch = useAppDispatch();

    const {isCommonPassword, isError, message, isLoading, isSuccess} = useAppSelector(state => state.users);
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        id: idInit,
        username: usernameInit,
        passwordOld: passwordOldInit,
        confirmPassword: confirmPasswordInit,
        firstName: firstNameInit,
        lastName: lastNameInit,
        email: emailInit,
    });

    const {id, username, passwordOld, confirmPassword, firstName, lastName, email} = userData;

    const [isAdminRadio, setIsAdminRadio]     = useState(false);
    const [showChecked, setShowChecked]       = useState(false);
    const [isUserRadio, setIsUserRadio]       = useState(true);
    const [passwordError, setPasswordError]   = useState(false);
    const [passwordType, setPasswordType]       = useState('password');
    const [oldPasswordType, setOldPasswordType] = useState('password');
    const [password, setPassword]               = useState(passwordInit);
    const passwordsMatch                      = useMatchingPasswords(password, confirmPassword);

    useEffect(() => {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        const isAdmin = parseJwt(token).isAdmin;
        if (!isAdmin && !editProfile) {
            navigate('/');
            return;
        }
        if (isAdminInit) {
            setIsAdminRadio(true);
            setIsUserRadio(false);
        }
    }, []);

    useEffect(() => {
        if (message !== '') {
            alert(message);
            dispatch(reset());
        }
    }, [isError, message]);

    const formIsValid = useMemo(() => {
        return username !== '' && password !== '' && confirmPassword !== '' && firstName !== '' && lastName !== '' && email !== '';
    }, [userData]);

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
        setShowChecked(showChecked => !showChecked);
        passwordType === 'password' ? setPasswordType('text') : setPasswordType('password');
    }

    const handleShowOldPassword = () => {
        oldPasswordType === 'password' ? setOldPasswordType('text') : setOldPasswordType('password');
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    }

    const handleClipboardEvent = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
    };

    const submitFormHandler = async (e: React.FormEvent<HTMLFormElement>) => {
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
                const userDataEdit: UserDataEdit = {
                    id,
                    firstName,
                    lastName,
                    username,
                    email,
                    passwordOld,
                    password,
                    isAdmin: isAdminRadio
                }  
                dispatch(editUser(userDataEdit));
            } else {
                const userDataEdit: UserDataEdit = {
                    id,
                    firstName,
                    lastName,
                    username,
                    email,
                    isAdmin: isAdminRadio,
                }
                dispatch(editUser(userDataEdit));
            }
            handleClose();
            toast.success('Profile successfully updated!');
            return;
        }
        dispatch(commonPassword({password: newUser.password}));
        if (isCommonPassword) {
            return;
        }
        dispatch(createUser(newUser));
        toast.success('User successfully created!')
    }

    if (isLoading) {
        return <Spinner animation="border" />;
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
                
                <Form.Group className="mb-3" controlId="formBasicOldPassword">
                    <Form.Label>Old password</Form.Label>
                    <Form.Control
                        type={oldPasswordType}
                        placeholder="Enter old password"   
                        name='passwordOld'
                        value={passwordOld}
                        onChange={userDataChangedHandler}
                    />
                    <Form.Check type='checkbox' id='showOldPassword' label='Show password' onClick={handleShowOldPassword} />              
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword1">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type={passwordType}
                        placeholder="Enter password"
                        name='password'
                        value={password}
                        onCopy={handleClipboardEvent}
                        onChange={handlePasswordChange}
                        onBlur={checkPasswordLength}
                        maxLength={128}
                    />
                    <PasswordStrengthBar password={password} minLength={MIN_PASSWORD_LENGTH} />
                    <Form.Check type='checkbox' id='showPassword' label='Show password' onClick={handleShowPassword} />
                    {passwordError && <ValidationError>Password must be at least 12 characters long</ValidationError>}
                    {isCommonPassword && <ValidationError>Password is common, please choose a different one!</ValidationError>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword2">
                    <Form.Label>Confirm password</Form.Label>
                    <Form.Control
                        type='password'
                        placeholder="Repeat password"
                        name='confirmPassword'
                        value={confirmPassword}
                        onChange={userDataChangedHandler}
                        onBlur={checkPasswordLength}
                    />
                    {!passwordsMatch && <ValidationError>Passwords don't match</ValidationError>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicName">
                    <Form.Label>Firstname</Form.Label>
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
                        disabled={editProfile && !isAdminRadio}
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
                <Button variant="primary" type="submit" disabled={!validCredentials}>
                    Save
                </Button>
            </Form>
        );
    }

    return (
        <Card style={{ marginTop: '1rem' }}>
            <h1 className='text-primary'>Add a new user</h1>
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
                        onCopy={handleClipboardEvent}
                        onChange={handlePasswordChange}
                        onBlur={checkPasswordLength}
                        maxLength={128}
                    />
                    <PasswordStrengthBar password={password} minLength={MIN_PASSWORD_LENGTH} />
                    <Form.Check type='checkbox' id='showPassword' label='Show password' onClick={handleShowPassword} />
                    {passwordError && <ValidationError>Password must be at least 12 characters long</ValidationError>}
                    {isCommonPassword && <ValidationError>Password is common, please choose a different one!</ValidationError>}                
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Confirm password</Form.Label>
                    <Form.Control
                        type='password'
                        placeholder="Repeat password"
                        name='confirmPassword'
                        value={confirmPassword}
                        onChange={userDataChangedHandler}
                        onBlur={checkPasswordLength}
                    />
                    {!passwordsMatch && <ValidationError>Passwords don't match</ValidationError>}
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
                    Save
                </Button>
            </Form>
        </Card>
    )
}

export default AddUser;
