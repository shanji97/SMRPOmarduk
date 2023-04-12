import {useAppDispatch, useAppSelector} from "../app/hooks";
import {useEffect, useState} from "react";
import AddUser from "./AddUser";
import Card from "../components/Card";
import {parseJwt} from "../helpers/helpers";
import {getUser} from "../features/users/userSlice";

const Profile = () => {
    const dispatch = useAppDispatch();
    const {userData} = useAppSelector(state => state.users);

    useEffect(() => {
        const token = JSON.parse(localStorage.getItem('user')!).token;
        const uid = parseJwt(token).sid;
        dispatch(getUser(uid));
    }, []);

    if (Object.keys(userData).length > 0) {
        const { id, firstName, lastName, username, email, isAdmin } = userData;
        return (
            <Card style={{ marginTop: '1rem' }}>
                <h1 className='text-primary'>Edit profile</h1>
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