import { useMemo, useState } from "react";
import Card from "../components/Card";
import { Button, Form } from "react-bootstrap";
import ValidationError from "../components/ValidationError";

const MIN_PASSWORD_LENGTH = 12;

const ChangePassword = () => {
    const [passwords, setPasswords] = useState({
        oldPassword:       '',
        newPassword:       '',
        repeatNewPassword: ''
    });
    const [passwordType, setPasswordType] = useState('password');
    const [error, setError]               = useState('');

    const {oldPassword, newPassword, repeatNewPassword} = passwords;
    
    const formIsValid = useMemo(() => {
        return newPassword.length >= MIN_PASSWORD_LENGTH && 
                                     repeatNewPassword.length >= 12 && 
                                     oldPassword.length >= 12;
    }, [newPassword, repeatNewPassword, oldPassword.length]);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords(prevPasswords => ({
            ...prevPasswords,
            [e.target.name]: e.target.value
        }));
    }

    const handleShowPassword = () => {
        passwordType === 'password' ? setPasswordType('text') : setPasswordType('password');
    }

    const submitFormHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newPassword !== repeatNewPassword) {
            setError('Passwords don\'t match');
            return;
        } else if (newPassword.length < MIN_PASSWORD_LENGTH || 
                   repeatNewPassword.length < MIN_PASSWORD_LENGTH) {
            setError('Password must be at least 12 characters long!');
            return;
        }
        
        console.log(passwords);
    }

    return (
        <Card>
            <h1>Change password</h1>
            <Form onSubmit={submitFormHandler}>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Current password</Form.Label>
                    <Form.Control 
                        type={passwordType}
                        name='oldPassword'
                        value={oldPassword}
                        onChange={handlePasswordChange}
                    />
                </Form.Group>
                <hr/>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>New password</Form.Label>
                    <Form.Control 
                        type={passwordType}
                        name='newPassword'
                        value={newPassword}
                        onChange={handlePasswordChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Repeat password</Form.Label>
                    <Form.Control 
                        type={passwordType}
                        name='repeatNewPassword'
                        value={repeatNewPassword}
                        onChange={handlePasswordChange}
                    />
                    {error !== '' && <ValidationError>{error}</ValidationError>}
                    <Form.Check type='checkbox' id='showPassword' label='Show passwords' onClick={handleShowPassword} />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={!formIsValid}>Change password</Button>
            </Form>
        </Card>
    );
}

export default ChangePassword;
