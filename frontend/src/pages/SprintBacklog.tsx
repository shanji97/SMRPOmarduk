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


const defaultItems = {
  [SprintBacklogItemStatus.UNALLOCATED]: [],
  [SprintBacklogItemStatus.ALLOCATED]: [],
  [SprintBacklogItemStatus.IN_PROGRESS]: [],
  [SprintBacklogItemStatus.DONE]: [],
  
};

type TaskboardData = Record<SprintBacklogItemStatus, StoryData[]>;




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


  const [itemsByStatus, setItemsByStatus] = useState<TaskboardData>(
    defaultItems
    //stories
  );

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
  

  const handleDragEnd: DragDropContextProps['onDragEnd'] = ({
    source,
    destination,
  }) => {
    setItemsByStatus((current) =>
      produce(current, (draft) => {
        // dropped outside the list
        if (!destination) {
          return;
        }
        const [removed] = draft[
          source.droppableId as SprintBacklogItemStatus
        ].splice(source.index, 1);
        draft[destination.droppableId as SprintBacklogItemStatus].splice(
          destination.index,
          0,
          removed
        );
      })
    );
  };
  
  

  type HandleDeleteFunc = (args: { status: SprintBacklogItemStatus; itemToDelete: StoryData }) => void;

  const handleDelete: HandleDeleteFunc = ({
    status,
    itemToDelete,
  }) =>
    setItemsByStatus((current) =>
      produce(current, (draft) => {
        draft[status] = draft[status].filter(
          (item) => item.id !== itemToDelete.id
        );
        setShow(false);
        dispatch(deleteStory(itemToDelete.id!));
        dispatch(getAllStory());
      })
    );

  //doda začetne elemnte
  
  useEffect(() => {
    //console.log(SprintBacklogItemStatus)
    //console.log(itemsByStatus)

    const isEmpty = Object.values(itemsByStatus).every(value => value.length === 0);
    console.log(isEmpty)
    if (isEmpty && isSuccess) {
      
          
          setItemsByStatus((current) =>
              produce(current, (draft) => {
                  //for (const status of Object.values(SprintBacklogItemStatus)) {
                  //  draft[status] = draft[status].filter(() => false);
                  //}

                  // Adding new item as "to do"
                  
                  stories.forEach((story: StoryData) => {
                    draft[SprintBacklogItemStatus.UNALLOCATED].push({ id: story.id?.toString(), 
                      title: story.title, 
                      description: story.description,
                      tests: story.tests,
                      priority: story.priority,
                      businessValue: story.businessValue,
                      sequenceNumber: story.sequenceNumber });
                      
                  })
              })
            );
          
    }

    
    
  }, [isSuccess]);


  

//{Object.values.map(([columnId, column], index) => {


  //modal za delete
  const [show, setShow] = useState(false);
 

  //modal za zgodbe
  const [showstory, setShowStory] = useState(false);
  
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
  const getDataStory = (item: StoryData) => {
    setTempDataStory(item);
    return setShowStory(true);
  }
 
  const [points, setPonts] = useState('');
  const [visiblePoints, setVisiblePonts] = useState(true);
  const handleSubmit = (e: any) => {
    e.preventDefault();
    setVisiblePonts((prev) => !prev);
    
  };
  const handleKeyDown = (e: any) => {
    const val = e.target.value;
    if (e.target.validity.valid) setPonts(e.target.value);
    else if (val === '') setPonts(val);   
  };

  
  return (
    <>
    
    <div className="row flex-row flex-sm-nowrap m-1 mt-3">
      
      <DragDropContext onDragEnd={handleDragEnd}>
        
        {Object.values(SprintBacklogItemStatus).map((status) => {
          //console.log(columns)
          return (
            <div className="col-sm-4 col-md-3 col-xl-3 mt-3" key={status}>
              <Card className="bg-light border-0 ">
                <div className="pt-3 hstack gap-2 mx-3">
                  <Card.Title className="fs-6 my-0">{status}</Card.Title>
                  <div className="vr my-0"></div>
                  <p className="fs-6 my-0">6</p>
                </div>
                <hr className="hr mx-3" />
                

                <Droppable droppableId={status} key={status}>
                  {(provided, snapshot) => {
                    return (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{
                          background: snapshot.isDraggingOver
                            ? "lightblue"
                            : "#f8f9fa",
                          borderRadius: "0px 0px 5px 5px",
                        }}
                      >
                        {itemsByStatus[status].map((item, index) => {
                          console.log(status)
                          
                          return (
                            
                            
                            
                            <Draggable
                              key={item.id}
                              draggableId={item.id!}
                              index={index}
                              isDragDisabled={status === SprintBacklogItemStatus.DONE}
                            >
                              
                              {(provided, snapshot) => {
                                return (
                                  <>

                                  <Card
                                    className="mb-3 mx-3"
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      userSelect: "none",
                                      ...provided.draggableProps.style,
                                    }}
                                  >
                                    
                                    <Card.Header className="hstack gap-2 align-items-center">
                                      <p className="fs-6 text-muted m-1">
                                        TSK-{item.sequenceNumber}
                                      </p>
                                      <p className="fs-6 text-muted m-1  text-truncate">
                                        sivar.lapajne@gmail.com
                                      </p>
                                      
                                      <Dropdown className="">
                                        
                                        <Dropdown.Toggle
                                          variant="link"
                                          id="dropdown-custom-components"
                                          bsPrefix="p-0"
                                        >
                                          
                                          <ThreeDots />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                          <Dropdown.Item>
                                            <Pencil /> Edit
                                          </Dropdown.Item>
                                          <Dropdown.Item onClick={() => setShow(true)}
                                            /* onClick={() =>
                                              Modal.confirm({
                                                title: 'Delete?',
                                                content: `Are you sure to delete "${item.title}"?`,
                                                onOk: () =>
                                                  onDelete({
                                                    status,
                                                    itemToDelete: item,
                                                  }),
                                              })
                                            } */
                                          >

                                            <Trash /> Delete
                                          </Dropdown.Item>
                                          <Dropdown.Item href="#/action-3">
                                            Something else
                                          </Dropdown.Item>
                                        </Dropdown.Menu>
                                      </Dropdown>
                                    </Card.Header>
                                    <Card.Body>
                                      
                                      <Card.Text onClick={() => getDataStory(item)} 
                                                  className="m-0"
                                                  
                                                  >
                                                    
                                                    <Button className="text-decoration-none" variant="link">{item.title}</Button>
                                                    
                                                  
                                      </Card.Text>
                                      
                                      
                                      <div className="text-end"><small className="custom-font-size text-muted mb-1 d-inline-block">25%</small></div>
                                      <ProgressBar
                                        style={{ height: "3px" }}
                                        now={60}
                                      />
                                     
              
                                      <div className="pt-3 hstack gap-2 ">
                                        

                                        <p className={`my-0 badge rounded-pill ${classes[stringPriority(item.priority)[1]]}`}>
                                         {stringPriority(item.priority)[0]}
                                          {" "}
                                        </p>

                                        
                                        
                                        
                                       

                                        
                                        <p className="  ms-auto fs-6  text-muted my-0">
                                          BV: {item.businessValue}
                                        </p>
                                        

                                        <div className="vr"></div>
                                        <p className="text-nowrap text-muted my-0">
                                          {" "}
                                         2h
                                        </p> 
          
                                        <Clock className=" text-muted" />
                                        
                                      </div>
                                    </Card.Body>
                                    <Card.Footer className="bg-transparent pb-0 px-2">
                                    
                                    <ListGroup className="pb-0 px-2"> 
                                      <ListGroup.Item
                                        className={`d-flex justify-content-between align-items-center border-0 mb-2 rounded ${classes["listItem-bg"]}`}>
                                        <div className="d-flex align-items-center">
                                          <input className="form-check-input me-2" type="checkbox" value="" aria-label="..." />
                                          Cras justo odio
                                        </div>
                                        <a href="#!" data-mdb-toggle="tooltip" title="Remove item">
                                          <X className="text-primary"/>
                                        </a>
                                        </ListGroup.Item>
                                        <ListGroup.Item
                                        className={`d-flex justify-content-between align-items-center border-0 mb-2 rounded ${classes["listItem-bg"]}`}>
                                        <div className="d-flex align-items-center">
                                          <input className="form-check-input me-2" type="checkbox" value="" aria-label="..." />
                                          Cras justo odio
                                        </div>
                                        <a href="#!" data-mdb-toggle="tooltip" title="Remove item">
                                          <X className="text-primary"/>
                                        </a>
                                        
                                        </ListGroup.Item>

                                    </ListGroup>                           
                                   

                                    </Card.Footer>
                                  
        
                                  </Card>
                          
                                  </>

                                );
                              }}
                              
                            </Draggable>
                            
                          );


                          


                        })}

                        {provided.placeholder}
                      </div>
                    );
                  }}
                </Droppable>
              </Card>

            </div>
          );
        })}
      </DragDropContext>
     
    </div>
       
    
       
        {
          showstory && <StoryModal item={tempDataStory} onCancel={() => setShowStory(false)} show={showstory}/>
        }
    
    
  </>
  );
}

export default Dashboard;
