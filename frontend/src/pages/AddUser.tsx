import { useState } from "react";
import {Button} from "react-bootstrap";
import {Form} from "react-bootstrap";
import { useAppDispatch } from "../app/hooks";

import classes from './AddUser.module.css';

const MIN_USERNAME_LENGTH = 4;
const MIN_PASSWORD_LENGTH = 6;

const AddUser = () => {
    const dispatch = useAppDispatch();
    const [userName, setUserName]     = useState('');
    const [password, setPassword]     = useState('');
    const [name, setName]             = useState('');
    const [surname, setSurname]       = useState('');
    const [email, setEmail]           = useState('');
    const [adminRadio, setAdminRadio] = useState(false);
    const [userRadio, setUserRadio]   = useState(true);          

    const userNameChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserName(e.target.value);
    }

    const passwordChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    }

    const nameChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    }

    const surnameChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSurname(e.target.value);
    }

    const emailChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    }

    const adminChangeHandler = () => {
        setAdminRadio(adminRadio => !adminRadio);
        setUserRadio(false);
    }

    const userChangeHandler = () => {
        setUserRadio(userRadio => !userRadio);
        setAdminRadio(false);
    }

    const submitFormHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUserName('');
        setPassword('');
        setName('');
        setSurname('');
        setEmail('');

        // TODO send data to backend
        console.log(userName, password, name, surname, email, adminRadio, userRadio);
        // dispatch();
    }

    let formIsValid = userName.length >= MIN_USERNAME_LENGTH && 
                      password.length >= MIN_PASSWORD_LENGTH &&
                      name !== '' &&
                      surname !== '' &&
                      email.includes('@');


    return (
        <div className={classes.formContainer}>
            <h1 className='text-primary'>Dodajanje uporabnika</h1>
            <Form onSubmit={submitFormHandler}>
                <Form.Group className="mb-3" controlId="formBasicUserName">
                    <Form.Label>Uporabniško ime</Form.Label>
                    <Form.Control 
                        placeholder="Vnesite uporabniško ime" 
                        value={userName} 
                        onChange={userNameChangeHandler} 
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Geslo</Form.Label>
                    <Form.Control 
                        type="password" 
                        placeholder="Vnesite geslo" 
                        value={password}
                        onChange={passwordChangeHandler}
                    />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="formBasicName">
                    <Form.Label>Ime</Form.Label>
                    <Form.Control 
                        placeholder="Vnesite ime" 
                        value={name}
                        onChange={nameChangeHandler}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicSurname">
                    <Form.Label>Priimek</Form.Label>
                    <Form.Control 
                        placeholder="Vnesite priimek" 
                        value={surname}
                        onChange={surnameChangeHandler}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>E-pošta</Form.Label>
                    <Form.Control 
                        placeholder="Vnesite e-pošto" 
                        value={email}
                        onChange={emailChangeHandler}
                    />
                </Form.Group>

                <div className={classes.radioButtonContainer}>
                    <Form.Check 
                        type='radio'
                        id='admin'
                        label='Administrator'
                        checked={adminRadio}
                        onClick={adminChangeHandler}
                    />
                    <Form.Check 
                        type='radio'
                        id='user'
                        label='User'
                        checked={userRadio}
                        onClick={userChangeHandler}
                    />
                </div>

                <Button variant="primary" type="submit" disabled={!formIsValid}>
                    Dodaj
                </Button>
            </Form>
        </div>
    )
}

export default AddUser;