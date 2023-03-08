import { useMemo, useState } from "react";
import {Button} from "react-bootstrap";
import Card from "../components/Card";
import {Form} from "react-bootstrap";

import classes from './AddUser.module.css';
import useValidateForm from "../hooks/useValidateForm";
import ValidationError from "../components/ValidationError";

const MIN_USERNAME_LENGTH = 4;
const MIN_PASSWORD_LENGTH = 12;

const AddUser = () => {
    const [userData, setUserData] = useState({
        username: '',
        password: '',
        name:     '',
        surname:  '',
        email:    '',
    });       
    const [isAdmin, setIsAdmin]             = useState(false);
    const [isUser, setIsUser]               = useState(true);
    const [passwordError, setPasswordError] = useState(false);
    const [passwordType, setPasswordType]   = useState('password');
    const formIsValid = useValidateForm(userData);
    
    const {username, password, name, surname, email} = userData;

    let validCredentials = useMemo(() => {
        return  username.length >= MIN_USERNAME_LENGTH &&
                password.length >= MIN_PASSWORD_LENGTH &&
                email.includes('@');
    }, [username, password, email]);  

    const userDataChangedHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserData(prevUserData => ({
            ...prevUserData,
            [e.target.name]: e.target.value
        }))
    }

    const adminChangeHandler = () => {
        setIsAdmin(isAdmin => !isAdmin);
        setIsUser(false);
    }

    const userChangeHandler = () => {
        setIsUser(isUser => !isUser);
        setIsAdmin(false);
    }

    const checkPasswordLength = () => {
        password.length < MIN_PASSWORD_LENGTH ? setPasswordError(true) : setPasswordError(false);
    }

    const handleShowPassword = () => {
        passwordType === 'password' ? setPasswordType('text') : setPasswordType('password');
    }

    const submitFormHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUserData({
            username: '',
            password: '',
            name: '',
            surname: '',
            email: '',

        })
        setIsUser(true);
        setIsAdmin(false);
        // TODO send data to backend
        console.log(userData);
    }

    return (
        <Card>
            <h1 className='text-primary'>Dodajanje uporabnika</h1>
            <Form onSubmit={submitFormHandler}>
                <Form.Group className="mb-3" controlId="formBasicUserName">
                    <Form.Label>Uporabniško ime</Form.Label>
                    <Form.Control 
                        placeholder="Vnesite uporabniško ime" 
                        name="username"
                        value={username} 
                        onChange={userDataChangedHandler} 
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Geslo</Form.Label>
                    <Form.Control 
                        type={passwordType} 
                        placeholder="Vnesite geslo" 
                        name='password'
                        value={password}
                        onChange={userDataChangedHandler}
                        onBlur={checkPasswordLength}
                    />
                    <Form.Check type='checkbox' id='showPassword' label='Show password' onClick={handleShowPassword} />
                    {passwordError && <ValidationError>Geslo mora biti dolgo vsaj 12 znakov</ValidationError>}
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="formBasicName">
                    <Form.Label>Ime</Form.Label>
                    <Form.Control 
                        placeholder="Vnesite ime" 
                        name='name'
                        value={name}
                        onChange={userDataChangedHandler}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicSurname">
                    <Form.Label>Priimek</Form.Label>
                    <Form.Control 
                        placeholder="Vnesite priimek" 
                        name='surname'
                        value={surname}
                        onChange={userDataChangedHandler}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>E-pošta</Form.Label>
                    <Form.Control 
                        placeholder="Vnesite e-pošto" 
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
                        checked={isAdmin}
                        onClick={adminChangeHandler}
                    />
                    <Form.Check 
                        type='radio'
                        id='user'
                        label='User'
                        checked={isUser}
                        onClick={userChangeHandler}
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
