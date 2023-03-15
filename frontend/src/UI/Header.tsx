import {Container, Nav, Navbar, NavDropdown, } from 'react-bootstrap';
import { HouseDoorFill, PersonCircle, Bell, QuestionCircle, Calendar } from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.css";


function Header() {
   


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

                        <NavDropdown title={<span><PersonCircle className="mb-1"></PersonCircle> Account</span>} id="basic-nav-dropdown">
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
                    </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        )
    }
    
    export default Header