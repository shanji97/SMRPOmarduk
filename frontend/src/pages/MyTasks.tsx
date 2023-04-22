import React, { Component, useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
  DragDropContextProps,
} from "@hello-pangea/dnd";
import { v4 as uuid } from "uuid";
import { Button, Card, CloseButton, Col, Dropdown, Form, InputGroup, ListGroup, Modal, Nav, ProgressBar, Row, Tab, Table } from "react-bootstrap";
import {
  CircleFill,
  Clock,
  Pencil,
  ThreeDots,
  Trash,
  Stack,
  ConeStriped,
  X,
} from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.css";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { Link, useNavigate } from "react-router-dom";
import { StoryData, SprintBacklogItemStatus } from '../classes/storyData';

import produce from 'immer';
import  DeleteConfirmation  from './DeleteConfirmation'
import { getAllStory, deleteStory } from "../features/stories/storySlice";
import classes from './Dashboard.module.css';
import StoryModal from "./StoryModal";
import DropdownMenu from "react-bootstrap/esm/DropdownMenu";

//const token = JSON.parse(localStorage.getItem('user')!).token;


//StoryData
//installed packages:
//npm install @hello-pangea/dnd --save
//npm install uuidv4
//npm install react-bootstrap-icons --save
//npm install --save react-bootstrap
//npm install bootstrap --save



 




/*

const itemsFromBackend123 = [
  { id: uuid(), content: "First task" },
  { id: uuid(), content: "Second task" },
  { id: uuid(), content: "Third task" },
  { id: uuid(), content: "Fourth task" },
  { id: uuid(), content: "Fifth task" },
];




    

const columnsFromBackend = {
  [uuid()]: {
    name: "Requested",
    items: []
  },
  [uuid()]: {
    name: "To do",
    items: [],
  },
  [uuid()]: {
    name: "In Progress",
    items: [],
  },
  [uuid()]: {
    name: "Done",
    items: [],
  },
};
  

  

*/







function Dashboard() {
  const dispatch = useAppDispatch();
  
  //demo
  const initialList = [
    {
      id: 1,
      title: "title1",
      status: "Start Work",
      user: "matevz",
      workedTime: 3,
      remainingTime: 2,
      estimatedTime: 6
    },
    {
      id: 2,
      title: "title2",
      status: "Release task",
      user: "janez",
      workedTime: 4,
      remainingTime: 1,
      estimatedTime: 5
    },
  ];
  const [list, setList] = useState(initialList);


  useEffect(() => {
    dispatch(getAllStory())
  }, [])


  //let stories = useAppSelector((state) => state.stories);
  //console.log(stories)
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.users);

  
  useEffect(() => {
    if (user === null) {
      console.log("redirect");
      navigate("/login");
    }
  }, [user]);


 
  let { stories, isSuccess} = useAppSelector((state) => state.stories);


  const [itemsByStatus, setItemsByStatus] = useState<StoryData[]>([]);

  const stringPriority = (priority: number): string[] => {
    switch(priority) {
      case 0:
        return ['Must have', 'badge-light-must'];
      case 1:
        return ['Could have', 'badge-light-could'];
      case 2: 
        return ['Should have', 'badge-light-should'];
      case 3: 
        return ["Won\'t have this time", 'gray-wont'];
      default:
        return [];
    }
  }
  

 


  
  //doda začetne elemnte
  
  useEffect(() => {
    //console.log(SprintBacklogItemStatus)
    //console.log(itemsByStatus)
    if (isSuccess) {
      const isEmpty = Object.values(itemsByStatus).every(value => value);
      console.log(isEmpty)
      if (isEmpty && isSuccess) {
        
            
            setItemsByStatus(stories);
            
      }
    }

    
    
  }, [isSuccess]);

console.log(itemsByStatus)
  

//{Object.values.map(([columnId, column], index) => {


  
const initvalue: StoryData = {
  id: "",
  title: "",
  description: "",
  tests: [],
  priority: 0,
  businessValue: 0,
  sequenceNumber: 0,
  category: 0,
  timeComplexity: 0,
  isRealized: false
};


 
 

  
  return (
    <>
    <div className="row flex-row flex-sm-nowrap m-1 mt-3 justify-content-center">
    <div className="col-sm-10 col-md-8 col-xl-6 mt-3">
      
    {Object.values(itemsByStatus).map((item) => {
            console.log(item)
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

      {list.map((item) => (
        <tr key={item.id}>
          <td >{item.id}</td>
          <td >{item.title}</td>
          <td ><Button className="align-middle text-decoration-none" variant="link">{item.status}</Button></td>
          
          <td >{item.workedTime}</td>
          <td >{item.remainingTime}</td>
          <td >{item.estimatedTime}</td>
          <td ><Button variant="outline-primary" size="sm">Work History</Button></td>
        </tr>
      ))}
      
  
     

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
        
    
    
  </>
  );
}

export default Dashboard;
