import React, { Component, useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
  DragDropContextProps,
} from "@hello-pangea/dnd";
import { v4 as uuid } from "uuid";
import { Button, Card, CloseButton, Col, Dropdown, Form, InputGroup, ListGroup, Modal, Nav, ProgressBar, Row, Tab } from "react-bootstrap";
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


 
  const { stories, isSuccess} = useAppSelector((state) => state.stories);


  const [itemsByStatus, setItemsByStatus] = useState<StoryData[]>([]);

  const stringPriority = (priority: number): string[] => {
    switch(priority) {
      case 1:
        return ['Must have', 'badge-light-must'];
      case 2:
        return ['Could have', 'badge-light-could'];
      case 3: 
        return ['Should have', 'badge-light-should'];
      case 4: 
        return ["Won\'t have this time", 'gray-wont'];
      default:
        return [];
    }
  }
  

 


  
  //doda začetne elemnte
  
  useEffect(() => {
    //console.log(SprintBacklogItemStatus)
    //console.log(itemsByStatus)

    const isEmpty = Object.values(itemsByStatus).every(value => value);
    console.log(isEmpty)
    if (isEmpty && isSuccess) {
      
          
          setItemsByStatus(stories);
          
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
    sequenceNumber: 0
};


  const [tempDataStory, setTempDataStory] = useState<StoryData>(initvalue);
 
 

  
  return (
    <>
    
    <div className="row flex-row flex-sm-nowrap m-1 mt-3">
      
  
        
       
   
     
    </div>
       
    
       
        
         {/* showstory && <StoryModal item={tempDataStory} } />*/}
        
    
    
  </>
  );
}

export default Dashboard;
