import {useAppDispatch, useAppSelector} from "../app/hooks";
import {useEffect, useState} from "react";
import AddUser from "./AddUser";
import Card from "../components/Card";
import {parseJwt} from "../helpers/helpers";
import {disable2fa, getUser} from "../features/users/userSlice";
import { Button } from "react-bootstrap";

import classes from './Profile.module.css';

const Profile = () => {
    const dispatch = useAppDispatch();
    const {userData} = useAppSelector(state => state.users);
    const [userId, setUserId] = useState('');

    useEffect(() => {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        const uid = parseJwt(token).sid;
        setUserId(uid);
        dispatch(getUser(uid));
    }, []);

    const handleDisable2fa = () => {
        dispatch(disable2fa(userId));
    }

    if (Object.keys(userData).length > 0) {
        const { id, firstName, lastName, username, email, isAdmin } = userData;
        return (
            <Card style={{ marginTop: '1rem' }}>
                <div className={classes.headingContainer}>
                    <h1 className='text-primary'>Edit profile</h1>
                    <Button 
                        onClick={handleDisable2fa} 
                        style={{ float: 'right' }}
                    >
                        Disable 2 Fa
                    </Button>
                </div>
                {userData && (
                    <AddUser
                        isEdit
                        editProfile
                        idInit={id}
                        firstNameInit={firstName || ''}
                        lastNameInit={lastName || ''}
                        usernameInit={username || ''}
                        emailInit={email || ''}
                        isAdminInit={isAdmin || false}
                        passwordInit=''
                        confirmPasswordInit=''
                        handleClose={() => {}}
                        passwordOldInit=''
                    />
                )}
            </Card>
        );
    }

    return <h1>Profile</h1>
}

export default Profile;