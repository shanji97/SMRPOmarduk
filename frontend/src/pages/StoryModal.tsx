import React, { useEffect, useState } from 'react'
import { Modal, Button, Tab, Card, Nav, CloseButton, FormControl, Table, ListGroup, Row, Form, Col } from "react-bootstrap";
import { StoryData } from '../classes/storyData';
import classes from './Dashboard.module.css';
import { X } from 'react-bootstrap-icons';
import { useAppDispatch, useAppSelector } from "../app/hooks";
import Users from './Users';
import { getAllUsers} from "../features/users/userSlice";
import { UserData } from '../classes/userData';
import { parseJwt } from '../helpers/helpers';


export interface StoryModalProps {
    onCancel: VoidFunction
    show: boolean
    item: StoryData
}

function StoryModal({ 
    onCancel,
    show,
    item,
}: StoryModalProps) {
  

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getAllUsers())
  }, [])




  //demo
  const initialList = [
    {
      id: 1,
      title: "title1",
      status: "asigned",
      user: "matevz",
      workedTime: 3,
      remainingTime: 2,
      estimatedTime: 6
    },
    {
      id: 2,
      title: "title2",
      status: "unasigned",
      user: "janez",
      workedTime: 4,
      remainingTime: 1,
      estimatedTime: 5
    },
  ];
  const [list, setList] = useState(initialList);
  function handleChange() {
    // track input field's state
  }


  const handleAdd = (e: any) => {
    e.preventDefault();

  };

  let {users, user} = useAppSelector(state => state.users);
  const [allUsers, setAllUsers] = useState<String[]>([]);

useEffect(() => {
  if (!(users.length === 0)){
    const usernames = users.map(user => user.username);
    setAllUsers(usernames)
  }
}, [users]);

const [isAdmin, setIsAdmin]   = useState(false);
const [userName, setUserName] = useState('');
useEffect(() => {
  if (user === null) {
      return;
  }
  const token = JSON.parse(localStorage.getItem('user')!).token;
  const userData = parseJwt(token);
  setIsAdmin(userData.isAdmin);
  setUserName(userData.sub);

}, [user, ]);




    return (
    
        <Modal
        
        show={show} 
        
        onHide={onCancel}
        backdrop="static"
        keyboard={false}
        size="xl"
        centered>
      <Tab.Container id="left-tabs-example" defaultActiveKey="first">
        <Card>
          <Card.Header className="d-flex align-items-center">
            <Nav variant="tabs" defaultActiveKey="first">
              <Nav.Item>
                <Nav.Link eventKey="first">Details</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="second">Comments</Nav.Link>
              </Nav.Item>
            </Nav>
            <CloseButton className="ms-auto" onClick={onCancel}/>
          </Card.Header>
          <Card.Body>
            <Tab.Content>
              <Tab.Pane eventKey="first">
                <Card.Title>{item.title}</Card.Title>
                <Card.Text>
                  {item.description}
                </Card.Text>
                
      {isAdmin && 
          (  
                                        
      <Table responsive="lg"   className={` ${classes["gfg"]} small`}>
      <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Status</th>
            <th>User</th>
            <th>workedTime</th>
            <th>Remaining time</th>
            <th>Estimated time</th>
          </tr>
        </thead>
        
      <tbody>

      {list.map((item) => (
        <tr key={item.id}>
          <td >{item.id}</td>
          <td >{item.title}</td>
          <td >{item.status}</td>
          <td >{item.user}</td>
          <td >{item.workedTime}</td>
          <td >{item.remainingTime}</td>
          <td >{item.estimatedTime}</td>
        </tr>
      ))}
      
  
      <tr className="align-middle">
            <th><Button form='my_form' size="sm" type="button" onClick={handleAdd}>
          Add
        </Button></th>
            <th>
         
         <Form.Control form='my_form' size="sm" placeholder="Title"/>
       </th>
            <th>Status</th>
            <th>
        
        <Form.Select form='my_form' size="sm" defaultValue="Choose..." >
        <option>/</option>
        {allUsers.map((user) => (
          <option key={allUsers.indexOf(user)}>{user}</option>

           ))}
        
        </Form.Select>
            </th>
            <th >/</th>
            <th>/</th>
            <th>
         
         <Form.Control form='my_form' size="sm" placeholder="Title"/>
      </th>
          </tr>

</tbody>




      </Table>
     
     )
    }

                
              </Tab.Pane>
              <Tab.Pane eventKey="second">
                dfvdf
              </Tab.Pane>
            </Tab.Content>
            </Card.Body>
        </Card>
      </Tab.Container>
    </Modal>
    
    )
}




export default StoryModal;