import {useAppDispatch, useAppSelector} from "../app/hooks";
import {Fragment, useEffect, useState} from "react";
import AddUser from "./AddUser";
import Card from "../components/Card";
import {parseJwt} from "../helpers/helpers";
import { toast } from "react-toastify";
import {disable2fa, getUser, setUp2FA, confirm2FA, get2faStatus} from "../features/users/userSlice";
import { Button, Form, Modal } from "react-bootstrap";

import classes from './Profile.module.css';
import QRCode from "react-qr-code";

const Profile = () => {
    const dispatch = useAppDispatch();
    const {userData, twofaConfirmed, qrUrl, isError, message, twoFaEnabled} = useAppSelector(state => state.users);
    const [userId, setUserId] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [codeText, setCodeText]   = useState('');

    const closeModal = () => {setShowModal(false)};


    useEffect(() => {
        if (isError) {
            toast.error(message);
        }

        const token = JSON.parse(localStorage.getItem('user')!).token;
        const uid = parseJwt(token).sid;
        setUserId(uid);
        dispatch(getUser(uid));
        dispatch(get2faStatus(uid));
    }, [isError, message]);

    useEffect(() => {}, [qrUrl])
    useEffect(() => {
        console.log(twoFaEnabled);
    }, [twoFaEnabled]);

    useEffect(() => {
        if (twofaConfirmed) {
            closeModal();
            toast.info('2 Factor Authentication enabled!')
        }
    }, [twofaConfirmed]);

    const handle2faState = () => {
        if (twoFaEnabled) {
            dispatch(disable2fa(userId));
            toast.info('2 Factor Authentication disabled!');
        } else {
            dispatch(setUp2FA(userId));
            setShowModal(true);
        }
    }

    const handleCodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCodeText(e.target.value);
    }

    const handleConfirm2FA = () => {
        const confirmData = {
            userId,
            code: codeText
        }
        console.log(confirmData);
        dispatch(confirm2FA(confirmData));
        closeModal();
    }

    const renderModal = () => {
        return (
            <Modal show={showModal} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>2 Step Authentication</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div style={{ height: "auto", margin: "0 auto", maxWidth: 128, width: "100%" }}>
                        <QRCode
                            size={256}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            value={qrUrl}
                            viewBox={`0 0 256 256`}
                        />
                    </div>

                    <p>Please scan the QR and enter your 6 digit code from Google authenticator</p>
                    <Form.Group className="mb-3" controlId="formBasicUserName">
                        <Form.Control
                            placeholder="Code on your authenticator"
                            name="codeText"
                            value={codeText}
                            onChange={handleCodeInputChange}
                            maxLength={6}
                        />
                    </Form.Group>
                </Modal.Body>
                
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>Close</Button>
                    <Button variant="primary" onClick={handleConfirm2FA}>Save</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    if (Object.keys(userData).length > 0) {
        const { id, firstName, lastName, username, email, isAdmin } = userData;
        return (
            <Fragment>
                <Card style={{ marginTop: '1rem' }}>
                    <div className={classes.headingContainer}>
                        <h1 className='text-primary'>Edit profile</h1>
                        <Button 
                            onClick={handle2faState} 
                            style={{ float: 'right' }}
                        >
                            {twoFaEnabled ? 'Disable' : 'Enable'} 2 Fa
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
                {showModal && renderModal()}
            </Fragment>
        );
    }

    return <h1>Profile</h1>
}

export default Profile;