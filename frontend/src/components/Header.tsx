import {Container, Nav, Navbar, NavDropdown, } from 'react-bootstrap';
import { HouseDoorFill, PersonCircle, Bell, QuestionCircle, Calendar } from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.css";
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/users/userSlice';
import { useEffect, useState } from 'react';
import { parseJwt } from '../helpers/helpers';
import { useNavigate } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const {user} = useAppSelector(state => state.users);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        if (user === null) {
            navigate('/login');
            return;
        }
        const token = JSON.parse(localStorage.getItem('user')!).token;
        const userData = parseJwt(token);
        setUserName(userData.sub);
    }, [user]);

    const handleLoginAndLogout = () => {
        if (user !== null) {
            dispatch(logout());
        }
        navigate('/login');
    }

    return (
        <Navbar collapseOnSelect expand="lg" bg="light" variant="light">
            <Container >
                <Navbar.Brand  href="#home" className="hstack"><HouseDoorFill className="me-2"></HouseDoorFill> Dashboard</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="ms-auto">
                    <Nav.Link  href="#features"><Calendar className="mb-1" ></Calendar> Calendar</Nav.Link>
                    <Nav.Link href="#pricing"><QuestionCircle className="mb-1"/> Documentation</Nav.Link>
                    <NavDropdown title={<span><Bell className="mb-1"></Bell> Notifications</span>} id="basic-nav-dropdown">
                    <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.2">
                        Another action
                    </NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="#action/3.4">
                        Separated link
                    </NavDropdown.Item>
                    </NavDropdown>

                    <NavDropdown title={user !== null ? 
                                            <span><PersonCircle className="mb-1"></PersonCircle> {userName}</span> : 
                                            <span><PersonCircle className="mb-1"></PersonCircle> Account</span>} id="basic-nav-dropdown">
                    <NavDropdown.Item onClick={handleLoginAndLogout}>{user === null ? 'Log in' : 'Logout'}</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.2">
                        Change password
                    </NavDropdown.Item>
                    </NavDropdown>    
                </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
        )
    }
    
export default Header;