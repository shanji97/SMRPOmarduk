import React, { Fragment, useEffect } from "react";
import { Card, Nav, Tab, Table } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.css";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { useNavigate } from "react-router-dom";

import { getStoriesForUser } from "../features/stories/storySlice";
import classes from './Dashboard.module.css';
import Tasks from "../components/Tasks";


function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.users);
  let { storiesForUser } = useAppSelector((state) => state.stories);


  useEffect(() => {
    dispatch(getStoriesForUser())
  }, [])


  useEffect(() => {
    if (user === null) {
      navigate("/login");
    }
  }, [user]);

  if (storiesForUser.length === 0) {
    return <h2>No stories</h2>
  }

  return (

    <Fragment>
    <div className="row flex-row flex-sm-nowrap m-1 mt-3 justify-content-center">
    <div className="col-sm-10 col-md-8 col-xl-6 mt-3">
      
    {storiesForUser.map((item) => {
            return (
            
           <Card className="mt-3">


            
      <Tab.Container id="left-tabs-example" defaultActiveKey="first">
        
          <Card.Header className="d-flex align-items-center">
            <Nav variant="tabs" defaultActiveKey="first">
              <Nav.Item>
                <Nav.Link eventKey="first">Details</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="second">Comments</Nav.Link>
              </Nav.Item>
            </Nav>
            
          </Card.Header>
          <Card.Body>
            <Tab.Content>
              <Tab.Pane eventKey="first">
                <Card.Title>{item.title}</Card.Title>
                <Card.Text>
                  {item.description}
                </Card.Text>
                
      
                                        
      <Table borderless responsive="lg"   className={` ${classes["gfg"]} small align-middle`}>
      <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Status</th>            
            <th>Work Done</th>
            <th>Remaining time</th>
            <th>Estimated time</th>
          </tr>
        </thead>
        
      <tbody>
        <Tasks storyId={item.id!} />
      </tbody>




      </Table>
              </Tab.Pane>
              <Tab.Pane eventKey="second">
                dfvdf
              </Tab.Pane>
            </Tab.Content>
            </Card.Body>
        
      </Tab.Container>
      </Card> 
            
      )
    })}
    
       
   
     
    </div>
       
    </div>
       
        
         {/* showstory && <StoryModal item={tempDataStory} } />*/}
        
    
    
  </Fragment>
  );
}

export default Dashboard;
