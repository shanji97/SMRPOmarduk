import { useMemo, useState } from "react";
import Card from "../components/Card";
import { Button, Form } from "react-bootstrap";
import ValidationError from "../components/ValidationError";
import { editUser } from "../features/users/userSlice";
import { UserDataEdit } from "../classes/userData";
import { useAppDispatch } from "../app/hooks";
import { parseJwt } from "../helpers/helpers";
import { useNavigate } from "react-router-dom";

const MIN_PASSWORD_LENGTH = 12;

const ChangePassword = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [passwords, setPasswords] = useState({
        oldPassword:       '',
        newPassword:       '',
        repeatNewPassword: ''
    });
    const userId = useMemo(() => {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        const userId = parseJwt(token).sid;
        return userId;
    }, []);
    const [currentPassType, setCurrentPassType] = useState('password');
    const [newPassType, setNewPassType]         = useState('password');
    const [error, setError]                     = useState('');

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

    const handleShowCurrPassword = () => {
        currentPassType === 'password' ? setCurrentPassType('text') : setCurrentPassType('password');
    }

    const handleShowNewPassword = () => {
        newPassType === 'password' ? setNewPassType('text') : setNewPassType('password');
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
        const editBody: UserDataEdit = {
            id: userId, 
            password: newPassword,
            passwordOld: oldPassword
        }
        dispatch(editUser(editBody));
        setPasswords({
            newPassword: '',
            oldPassword: '',
            repeatNewPassword: ''
        });
        navigate('/login');
    }

    return (
        <Card>
            <h1>Change password</h1>
            <Form onSubmit={submitFormHandler}>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Current password</Form.Label>
                    <Form.Control 
                        type={currentPassType}
                        name='oldPassword'
                        value={oldPassword}
                        onChange={handlePasswordChange}
                    />
                    <Form.Check type='checkbox' id='showPassword1' label='Show password' onClick={handleShowCurrPassword} />
                </Form.Group>
                <hr/>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>New password</Form.Label>
                    <Form.Control 
                        type={newPassType}
                        name='newPassword'
                        value={newPassword}
                        onChange={handlePasswordChange}
                    />
                    <Form.Check type='checkbox' id='showPassword2' label='Show password' onClick={handleShowNewPassword} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Repeat password</Form.Label>
                    <Form.Control 
                        type='password'
                        name='repeatNewPassword'
                        value={repeatNewPassword}
                        onChange={handlePasswordChange}
                    />
                    {error !== '' && <ValidationError>{error}</ValidationError>}
                </Form.Group>
                <Button variant="primary" type="submit" disabled={!formIsValid}>Change password</Button>
            </Form>
        </Card>
    );
}

export default ChangePassword;
