import React, { useEffect, useState } from 'react'
import { Modal, Button, Tab, Card, Nav, CloseButton, FormControl, Table, ListGroup, Row, Form, Col } from "react-bootstrap";
import { NotificationData, StoryData } from '../classes/storyData';


import { useAppDispatch, useAppSelector } from "../app/hooks";

import { getAllUsers} from "../features/users/userSlice";
import { parseJwt } from '../helpers/helpers';
import { useParams } from 'react-router-dom';
import { getActiveProject } from '../features/projects/projectSlice';
import { createNotification, getNotifications, getRejectMessage, reset } from '../features/stories/storyNotificationSlice';
import { toast } from 'react-toastify';
import PostNotification from '../components/PostNotification';


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










const [isAdmin, setIsAdmin]   = useState(false);
const [userName, setUserName] = useState('');

//comments

const params = useParams();
const {message, isError, storiesNotification, rejectMessage} = useAppSelector(state => state.storyNotifications);
const {activeProject} = useAppSelector(state => state.projects);
const [postContent, setPostContent] = useState('');
const [currentUser, setUser] = useState({
  sub: '',
  sid: ''
});

useEffect(() => {
  if (user === null) {
    return;
  }
  const token = JSON.parse(localStorage.getItem("user")!).token;
  const userData = parseJwt(token);

  setUser(userData);
  setIsAdmin(userData.isAdmin);
  setUserName(userData.sub);
  dispatch(getActiveProject());
}, []);

useEffect(() => {
  dispatch(getNotifications(item.id!));
  dispatch(getRejectMessage(item.id!));
}, [activeProject]);

useEffect(() => {
  if (isError) {
    toast.error(message);
  }

  return () => {
    dispatch(reset());
  }
}, [isError, message]);

const postContentChanged = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  setPostContent(e.currentTarget.value);
}


const submitNewPost = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const newPost: NotificationData = {
    description: postContent,
    storyId: item.id!
  };
  dispatch(createNotification(newPost));
  toast.info('Post created!');
  setPostContent('');
}



/*

 <Card border={"info"}>
                    <Card.Body>
                      <Row>
                        <Col>
                          <Card.Text>{content}</Card.Text>
                        </Col>
                        
                        
                      </Row>
                      </Card.Body>
                    </Card>


                {rejectMessage.map((post, i) => {
                    return <PostNotification
                  key={i}
                  id={post.id!}
                  content={post.notificationText}
                  author={post.authorName}
                  created={post.created!}
                  user={currentUser}
                  approved={post.approved}
  
              />
      })} 

      */
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
              </Tab.Pane>
              <Tab.Pane eventKey="second">

              
     

       {storiesNotification.map((post, i) => {
        return <PostNotification
                  key={i}
                  id={post.id!}
                  content={post.notificationText}
                  author={post.authorName}
                  created={post.created!}
                  user={currentUser}
                  approved={post.approved}
  
              />
      })} 

      <Form onSubmit={submitNewPost}>
        <Form.Group className="mb-3" controlId="postContent" >
          <Form.Label>Write a new post</Form.Label>
          <Form.Control
            as='textarea'
            
            value={postContent}
            onChange={postContentChanged}
          />
          <Button type='submit' disabled={postContent === ''} style={{ marginTop: '.5rem' }}>Post</Button>
        </Form.Group>
      </Form>
 
                

                
              </Tab.Pane>
            </Tab.Content>
            </Card.Body>
        </Card>
      </Tab.Container>
    </Modal>
    
    )
}




export default StoryModal;