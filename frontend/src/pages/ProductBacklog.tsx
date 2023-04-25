import React, { Component, useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
  DragDropContextProps,
  DraggableLocation,
} from "@hello-pangea/dnd";
import { v4 as uuid } from "uuid";
import {
  Button,
  Card,
  CloseButton,
  Col,
  Dropdown,
  Form,
  InputGroup,
  ListGroup,
  Modal,
  Nav,
  ProgressBar,
  Row,
  Tab,
} from "react-bootstrap";
import {
  CircleFill,
  Clock,
  Pencil,
  ThreeDots,
  Trash,
  Stack,
  ConeStriped,
  X,
  Eraser,
  Stickies,
} from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.css";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { Link, useNavigate } from "react-router-dom";
import { StoryData, ProductBacklogItemStatus } from "../classes/storyData";

import produce from "immer";
import DeleteConfirmation from "./DeleteConfirmation";
import {
  getAllStory,
  deleteStory,
  reset,
  updateStoryCategory,
  updateTimeComplexity,
} from "../features/stories/storySlice";
import classes from "./Dashboard.module.css";
import StoryModal from "./StoryModal";
import DropdownMenu from "react-bootstrap/esm/DropdownMenu";
import StoryForm from "../components/StoryForm";
import { getActiveProject } from "../features/projects/projectSlice";
import {
  addStoryToSprint,
  getActiveSprint,
  getAllSprints,
  updateSprint,
} from "../features/sprints/sprintSlice";
import { StorySprint } from "../classes/sprintData";
import Projects from "./Projects";
import { getProjectUserRoles } from  "../features/projects/projectSlice";
import { parseJwt } from "../helpers/helpers";

import { toast } from "react-toastify";
import RejectStoryModal from "./RejectStoryModal";


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
  [ProductBacklogItemStatus.WONTHAVE]: [],
  [ProductBacklogItemStatus.UNALLOCATED]: [],
  [ProductBacklogItemStatus.ALLOCATED]: [],
  [ProductBacklogItemStatus.DONE]: [],
};



type TaskboardData = Record<ProductBacklogItemStatus, StoryData[]>;

function ProductBacklog() {
  const dispatch = useAppDispatch();
  const { activeProject, userRoles } = useAppSelector((state) => state.projects);
  
  //dispatch(getActiveProject());
  //helper funkcija za updatat useState
  const [sgs, setSgs] = useState("undefined");

  let { stories, isSuccess, isLoading, isError, message } = useAppSelector(
    (state) => state.stories
  );
  let projectroles = useAppSelector((state) => state.projects);
  let SprintSelector = useAppSelector((state) => state.sprints);
  
  useEffect(() => {
    if (SprintSelector.isStoryInSprint && !SprintSelector.isLoading) {
      toast.success("Story successfully created!");
      dispatch(reset());
    }
    if (SprintSelector.isNotStoryInSprint && !SprintSelector.isLoading) {
      toast.error(SprintSelector.message);
    }
  }, [
    SprintSelector.isStoryInSprint,
    SprintSelector.isNotStoryInSprint ,
    SprintSelector.isLoading,
  ]);

  //console.log(SprintSelector)
  useEffect(() => {
    if (isSuccess && !isLoading) {
      dispatch(reset);
      console.log("kul");
    }
    if (isError && !isLoading) {
      dispatch(reset);
      toast.error(message);
      console.log("error");
    }
  }, [isSuccess, isError, isLoading]);

  useEffect(() => {
    dispatch(getAllStory());
    dispatch(getActiveProject());
    
    
  }, []);

  useEffect(() => {
    
    if (activeProject.id) {
      dispatch(getAllSprints(activeProject.id!));
      dispatch(getProjectUserRoles(activeProject.id!))
      dispatch(getActiveSprint(activeProject.id!))
    }
  }, [activeProject]);

  useEffect(() => {
    
    if (activeProject.id) {
      const dataArray = Object.values(userRoles);
      const filteredData = dataArray.filter(item => item.role === 1);
      if (filteredData) {
        setScrumMasterId(filteredData[0].userId)
      }
      
    }
  }, [userRoles]);

//console.log(projectroles.userRoles)


  //uporabniki
  let { users, user } = useAppSelector((state) => state.users);
  const [allUsers, setAllUsers] = useState<String[]>([]);

  useEffect(() => {
    if (!(users.length === 0)) {
      const usernames = users.map((user) => user.username);
      setAllUsers(usernames);
    }
  }, [users]);

  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState();
  const [scrumMasterId, setScrumMasterId] = useState();
  useEffect(() => {
    if (user === null) {
      return;
    }
    const token = JSON.parse(localStorage.getItem("user")!).token;
    const userData = parseJwt(token);
    setIsAdmin(userData.isAdmin);
    setUserName(userData.sub);
    setUserId(userData.sid)
  }, [user]);

  const isUserScramMaster = () => {
    if (scrumMasterId === userId && userId && scrumMasterId)
    return true;
    else return false;
    
  };


  
//console.log(isUserScramMaster())



  // NOTE: temporary fix, change this if needed
  /*
  useEffect(() => {
    if (isSuccess && !isLoading) {
      dispatch(reset());
    }
    if (isError && !isLoading) {
      dispatch(reset());
    }
  }, [isSuccess, isError, isLoading]);

  */
  //let stories = useAppSelector((state) => state.stories);
  //console.log(stories)
  const navigate = useNavigate();

  

  useEffect(() => {
    if (user === null) {
      console.log("redirect");
      navigate("/login");
    }
  }, [user]);

  const [itemsByStatus, setItemsByStatus] = useState<TaskboardData>(
    defaultItems
    //stories
  );
  const resetState = () => {
    setItemsByStatus(defaultItems);
  };

  const stringPriority = (priority: number): string[] => {
    switch (priority) {
      case 0:
        return ["Won't have this time", "badge-light-wont"];
      case 1:
        return ["Could have", "badge-light-could"];
      case 2:
        return ["Should have", "badge-light-should"];
      default:
        return ["Must have", "badge-light-must"];
    }
  };
  const category = (category: number): string => {
    switch (category) {
      case 0:
        return "WONTHAVE";
      case 1:
        return "UNALLOCATED";
      case 2:
        return "ALLOCATED";
      default:
        return "DONE";
    }
  };

  const categoryChange = (category: string): number => {
    switch (category) {
      case "Won't have this time":
        return 0;
      case "Unallocated":
        return 1;
      case "Allocated":
        return 2;
      default:
        return 3;
    }
  };

  type HandrejectFunc = (args: {
    status: ProductBacklogItemStatus;
    itemToDelete: StoryData;
  }) => void;

  /* 
  const handleReject: HandrejectFunc = ({ status, itemToDelete }) =>
    setItemsByStatus((current) =>
      produce(current, (draft) => {
        

       
        const niki = draft[
                  source.droppableId as ProductBacklogItemStatus
                ][source.index];
                
        const [removed] = draft[
          itemToDelete.id as ProductBacklogItemStatus
        ].splice(source.index, 1);

        draft[destination.droppableId as ProductBacklogItemStatus].splice(
          destination.index,
          0,
          removed
        );
        let projectRoleData = {
          projectId: parseInt(activeProject?.id || ""),
          category: categoryChange(destination.droppableId),
          storyId: removed.id || "",
        };
        dispatch(updateStoryCategory(projectRoleData));
      })
    );

    */
  const handleDragEnd: DragDropContextProps["onDragEnd"] = ({
    source,
    destination,
  }) => {
    setItemsByStatus((current) =>
      produce(current, (draft) => {
        // dropped outside the list
        if (!destination) {
          return;
        }

        /*
        const niki = draft[
                  source.droppableId as ProductBacklogItemStatus
                ][source.index];
                */
        const [removed] = draft[
          source.droppableId as ProductBacklogItemStatus
        ].splice(source.index, 1);

        draft[destination.droppableId as ProductBacklogItemStatus].splice(
          destination.index,
          0,
          removed
        );
        let projectRoleData = {
          projectId: parseInt(activeProject?.id || ""),
          category: categoryChange(destination.droppableId),
          storyId: removed.id || "",
        };
        dispatch(updateStoryCategory(projectRoleData));

        if (destination.droppableId === "Allocated" && destination.droppableId != source.droppableId) {
          const storySprint: StorySprint = {
            sprintId: parseInt(SprintSelector.activeSprint?.id || ""),
            storyId: parseInt(removed.id || "")
          
        };
        dispatch(addStoryToSprint(storySprint)); 
        } 
        //itemsByStatus[destination.droppableId].length
        console.log(typeof destination.droppableId)
        console.log(destination.droppableId === "")
        if (source.droppableId === "Allocated" && destination.droppableId != "Done") {
          
        };
      })
    );
  };

  type HandleDeleteFunc = (args: {
    status: ProductBacklogItemStatus;
    itemToDelete: StoryData;
  }) => void;

  const handleDelete: HandleDeleteFunc = ({ status, itemToDelete }) =>
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

  //za beleženje časa
  const [itemVisibility, setItemVisibility] = useState<{
    [itemId: string]: boolean;
  }>({});
  //za beleženje vnosačasa
  const [itemTime, setItemTime] = useState<{
    [itemId: string]: number;
  }>({});

  const handleFormToggle = (itemId: string) => {
    setItemVisibility((prev) => {
      const newState = { ...prev };
      newState[itemId] = !newState[itemId];
      return newState;
    });
  };
  const handleSubmit =
    (itemId: string) => (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      handleFormToggle(itemId);

      

      let projectRoleData = {
        timeComplexity: itemTime[itemId],
        storyId: itemId,
      };
      dispatch(updateTimeComplexity(projectRoleData));

    };
  const handleKeyDown = (e: any) => {
    e.preventDefault();

    const val = e.target.value;
    const targetId = e.target.id
    
    if (val.length > 0 && /^\d+$/.test(val)) {
      setItemTime((prev) => {
        const newState = { ...prev };
        newState[targetId] = val;
        return newState;
      });
  }

    
    
    //else if (e.target.value == '') dispatch(updateTimeComplexity(projectRoleData2));
    //dispatch(getAllStory());
  };
  //const handleChangeTime:
  //doda začetne elemnte

  useEffect(() => {
    //console.log(ProductBacklogItemStatus)
    //console.log(itemsByStatus)

    //console.log("doblejni podatki1")
    if (isSuccess) {
      resetState();
      setItemsByStatus((current) =>
        produce(current, (draft) => {
          //for (const status of Object.values(ProductBacklogItemStatus)) {
          //  draft[status] = draft[status].filter(() => false);
          //}

          const isEmpty = Object.values(current).every(
            (value) => value.length === 0
          );

          // Adding new item as "to do"
          //console.log("zgodbice ob updatu")
          //console.log(stories)
          const visibilityObject: { [itemId: string]: boolean } = {};
          const insertTimeObject: { [itemId: string]: number } = {};
          if (stories) {
          stories.forEach((story: StoryData) => {
            //za beleženje časa init values

            visibilityObject[story.id!] = false;
            //za beleženje vnosa časa
            insertTimeObject[story.id!] = story.timeComplexity;
           
            
            //storyi
            let cat;
            if (story.priority === 0) {
              cat = category(0);
            } else {
              cat = category(story.category);
            }

            draft[
              ProductBacklogItemStatus[
                cat as keyof typeof ProductBacklogItemStatus
              ]
            ].push({
              id: story.id?.toString(),
              title: story.title,
              description: story.description,
              tests: story.tests,
              priority: story.priority,
              businessValue: story.businessValue,
              sequenceNumber: story.sequenceNumber,
              category: story.category,
              timeComplexity: story.timeComplexity,
              isRealized: story.isRealized,
            });
          });

          setItemVisibility(visibilityObject);
          setItemTime(insertTimeObject);
        }
        })
      );
    }
  }, [isSuccess]);

  //{Object.values.map(([columnId, column], index) => {

  //modal za delete
  const [show, setShow] = useState(false);

  //modal za zgodbe
  const [showstory, setShowStory] = useState(false);

  const [showNewStoryModal, setShowNewStoryModal] = useState(false);

  // modal za edit story
  const [showEditStoryModal, setShowEditStoryModal] = useState(false);

  // modal za reject
  const [showRejectStoryModal, setShowRejectStoryModal] = useState(false);

  const openNewStoryModal = () => {
    setShowNewStoryModal(true);
  };

  const hideNewStoryModal = () => {
    setShowNewStoryModal(false);
  };

  const openEditStoryModal = (item: StoryData) => {
    setTempDataStory(item);
    setShowEditStoryModal(true);
  };

  const hideEditStoryModal = () => {
    setShowEditStoryModal(false);
  };
  const openRejectStoryModal = (item: StoryData) => {
    setTempDataStory(item);
    setShowRejectStoryModal(true);
  };
  const hideRejectStoryModal = () => {
    setShowRejectStoryModal(false);
  };
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
    isRealized: false,
  };

  const [tempDataStory, setTempDataStory] = useState<StoryData>(initvalue);
  const getDataStory = (item: StoryData) => {
    setTempDataStory(item);
    //console.log(item);
    return setShowStory(true);
  };

  // utility function for edit story
  function getTestsForEdit(items: any): string[] {
    return items.map((item: any) => item.description);
  }

  //{if Object.keys(defaultItems).includes(status)}

  return (
    <>
      <div className="row flex-row flex-sm-nowrap m-1 mt-3">
        <DragDropContext onDragEnd={handleDragEnd}>
          {Object.values(ProductBacklogItemStatus).map((status) => {
            return (
              <div className="col-sm-4 col-md-3 col-xl-3 mt-3" key={status}>
                <Card className="bg-light border-0 ">
                  <div className="pt-3 hstack gap-2 mx-3">
                    <Card.Title className="fs-6 my-0  text-truncate">{status}</Card.Title>
                    <div className="vr my-0"></div>
                    <p className="fs-6 my-0">{itemsByStatus[status].length}</p>
                    {status === ProductBacklogItemStatus.UNALLOCATED && (
                      <Button
                        className="ms-auto m-0 p-0"
                        variant="light"
                        onClick={() => openNewStoryModal()}
                      >
                        New Story
                      </Button>
                    )}
                    {status === ProductBacklogItemStatus.ALLOCATED && (
                      <p className="fs-6 my-0">/   {SprintSelector.activeSprint?.velocity}</p>
                    )}
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
                            return (
                              <Draggable
                                key={item.id}
                                draggableId={item.id!}
                                index={index}
                                isDragDisabled={
                                  status ===
                                    ProductBacklogItemStatus.WONTHAVE ||
                                  !Boolean(itemTime[item.id!]) || !isUserScramMaster()
                                }
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
                                          {status !==
                                                ProductBacklogItemStatus.WONTHAVE && (
                                          <Dropdown className="ms-auto">
                                            <Dropdown.Toggle
                                              variant="link"
                                              id="dropdown-custom-components"
                                              bsPrefix="p-0"
                                            >
                                              <ThreeDots />

                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                            {status !==
                                                ProductBacklogItemStatus.UNALLOCATED && (
                                                <Dropdown.Item
                                                  onClick={() =>
                                                    openRejectStoryModal(item)
                                                  }
                                                >
                                                  <Eraser /> Reject
                                                </Dropdown.Item>
                                              )}
                                              {status ===
                                                ProductBacklogItemStatus.UNALLOCATED && (
                                                <Dropdown.Item
                                                  onClick={() =>
                                                    openEditStoryModal(item)
                                                  }
                                                >
                                                  <Pencil /> Edit
                                                </Dropdown.Item>
                                              )}
                                              {status ===
                                                ProductBacklogItemStatus.UNALLOCATED && (
                                                <Dropdown.Item
                                                  onClick={() => setShow(true)}
                                                >
                                                  <Trash /> Delete
                                                </Dropdown.Item>
                                              )}
                                              <DeleteConfirmation
                                                item={item}
                                                status={status}
                                                onCancel={() => setShow(false)}
                                                show={show}
                                              />
                                            </Dropdown.Menu>
                                          </Dropdown>
                                          )}
                                        </Card.Header>
                                        <Card.Body>
                                          <Card.Text
                                            onClick={() => getDataStory(item)}
                                            className="m-0  text-truncate"
                                          >
                                            <Button
                                              className="text-decoration-none "
                                              variant="link"
                                            >
                                              {item.title}
                                            </Button>
                                          </Card.Text>

                                          <div className="text-end">
                                            <small className="custom-font-size text-muted mb-1 d-inline-block">
                                              25%
                                            </small>
                                          </div>
                                          <ProgressBar
                                            style={{ height: "3px" }}
                                            now={60}
                                          />

                                          <div className="pt-3 hstack gap-2 ">
                                            <p
                                              className={`my-0 badge rounded-pill ${
                                                classes[
                                                  stringPriority(
                                                    item.priority
                                                  )[1]
                                                ]
                                              }`}
                                            >
                                              {stringPriority(item.priority)[0]}{" "}
                                            </p>

                                            <p className="  ms-auto fs-6  text-muted my-0">
                                              Business Value:{" "}
                                              {item.businessValue}
                                            </p>
                                          </div>
                                        </Card.Body>

                                        <ListGroup variant="flush">
                                          <ListGroup.Item>
                                            <Row>
                                              <Col sm={7}>
                                                Time complexity:{" "}
                                              </Col>
                                              <Col sm={5}>
                                                {itemVisibility[item.id!] && (
                                                  <Form
                                                    onSubmit={handleSubmit(
                                                      item.id!
                                                    )}
                                                    className=" ms-auto"
                                                  >
                                                    <InputGroup size="sm">
                                                      <Form.Control
                                                        className="mobileBox"
                                                        size="sm"
                                                        pattern="[0-9]*"
                                                        //value={itemTime[item.id!]}
                                                        placeholder={itemTime[item.id!].toString()}
                                                        id={item.id}
                                                        onChange={handleKeyDown}
                                                        type="tel"
                                                        maxLength={2}
                                                      />
                                                      <InputGroup.Text className="">
                                                        PT
                                                      </InputGroup.Text>
                                                    </InputGroup>
                                                  </Form>
                                                )}
                                                {!itemVisibility[item.id!] && isUserScramMaster() &&   (
                                                  <Button
                                                    id={item.id}

                                                    //isUserScramMaster
                                                    onClick={() =>
                                                      handleFormToggle(item.id!)
                                                    }
                                                    variant="link"
                                                    className="m-0 p-0 float-end text-decoration-none"
                                                  >
                                                    {itemTime[item.id!]}
                                                    
                                                  </Button>
                                                )}
                                                {!isUserScramMaster() && (
                                                <p className="m-0 p-0 float-end text-decoration-none">{itemTime[item.id!]}</p>
                                                )}
                                              </Col>
                                            </Row>
                                          </ListGroup.Item>
                                        </ListGroup>
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
      {showNewStoryModal && (
        <Modal show={showNewStoryModal} onHide={hideNewStoryModal}>
          <Modal.Body>
            <StoryForm
              projectId={activeProject.id}
              isEdit={false}
              sequenceNumberInit=""
              titleInit=""
              descriptionInit=""
              testsInit={[""]}
              priorityInit=""
              businessValueInit=""
              closeModal={hideNewStoryModal}
            />
          </Modal.Body>
        </Modal>
      )}
      {showstory && (
        <StoryModal
          item={tempDataStory}
          onCancel={() => setShowStory(false)}
          show={showstory}
        />
      )}
      {showEditStoryModal && (
        <Modal show={showEditStoryModal} onHide={hideEditStoryModal}>
          <Modal.Body>
            <StoryForm
              id={tempDataStory.id}
              isEdit={true}
              sequenceNumberInit={tempDataStory.sequenceNumber.toString()}
              titleInit={tempDataStory.title}
              descriptionInit={tempDataStory.description}
              testsInit={getTestsForEdit(tempDataStory.tests)}
              priorityInit={tempDataStory.priority.toString()}
              businessValueInit={tempDataStory.businessValue.toString()}
              closeModal={hideEditStoryModal}
            />
          </Modal.Body>
        </Modal>
      )}
      {showRejectStoryModal && (
        <RejectStoryModal
          item={tempDataStory}
          onCancel={() => setShowRejectStoryModal(false)}
          show={showRejectStoryModal}
        />
      )}
    </>
  );
}

export default ProductBacklog;

