import React, {Component, Fragment, useEffect, useState} from "react";
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
  Stickies, SuitSpadeFill,
} from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.css";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { Link, useNavigate, useParams } from "react-router-dom";
import { StoryData, ProductBacklogItemStatus } from "../classes/storyData";

import produce from "immer";
import DeleteConfirmation from "./DeleteConfirmation";
import {
  getAllStoryById,
  deleteStory,
  reset,
  updateStoryCategory,
  updateTimeComplexity,
  confirmStory,
} from "../features/stories/storySlice";
import classes from "./Dashboard.module.css";
import StoryModal from "./StoryModal";
import DropdownMenu from "react-bootstrap/esm/DropdownMenu";
import StoryForm from "../components/StoryForm";
import {
  getActiveProject,
  getProject,
} from "../features/projects/projectSlice";
import {
  addStoryToSprint,
  getActiveSprint,
  getAllSprints,
  getUnrealizedStoriesForSprint,
  updateSprint,
} from "../features/sprints/sprintSlice";
import { StorySprint } from "../classes/sprintData";
import Projects from "./Projects";
import { getProjectUserRoles } from "../features/projects/projectSlice";
import { parseJwt } from "../helpers/helpers";

import { toast } from "react-toastify";
import RejectStoryModal from "./RejectStoryModal";
import PlanningPokerModal from "../components/PlanningPokerModal";
import DropdownStory from "../components/dropdownStory";

//const token = JSON.parse(localStorage.getItem('user')!).token;

//StoryData
//installed packages:
//npm install @hello-pangea/dnd --save
//npm install uuidv4
//npm install react-bootstrap-icons --save
//npm install --save react-bootstrap
//npm install bootstrap --save

const defaultItems = {
  [ProductBacklogItemStatus.WONTHAVE]: [],
  [ProductBacklogItemStatus.UNALLOCATED]: [],
  [ProductBacklogItemStatus.ALLOCATED]: [],
  [ProductBacklogItemStatus.DONE]: [],
};

type TaskboardData = Record<ProductBacklogItemStatus, StoryData[]>;

function ProductBacklog() {
  const dispatch = useAppDispatch();

  
  const { userRoles } = useAppSelector((state) => state.projects);
  const [showPlanningPokerModal, setShowPlanningPokerModal] = useState(false);
  const [storyIdForPoker, setStoryIdForPoker] = useState('');
  //dispatch(getActiveProject());
  //helper funkcija za updatat useState
  

  let {
    stories,
    isSuccess,
    isLoading,
    isError,
    message,
    isStoriesSuccess,
    isStoriesLoading,
    isStoriesError,
    isStoryUpdateError,
    isStoryUpdateSuccess,
    isStoryUpdateLoading,
  } = useAppSelector((state) => state.stories);
  let SprintSelector = useAppSelector((state) => state.sprints);
  let projectsState = useAppSelector((state) => state.projects);
  useEffect(() => {
    if (SprintSelector.isStoryInSprint && !SprintSelector.isLoading) {
      toast.success(SprintSelector.message);
      //dispatch(reset());
    }
    if (SprintSelector.isNotStoryInSprint && !SprintSelector.isLoading) {
      toast.error(SprintSelector.message);
    }
  }, [
    SprintSelector.isStoryInSprint,
    SprintSelector.isNotStoryInSprint,
    SprintSelector.isLoading,
  ]);

  useEffect(() => {
    if (SprintSelector.isSuccessActive && !SprintSelector.isLoadingActive) {
      toast.success(SprintSelector.message);
      if (SprintSelector.activeSprint !== undefined) {
        dispatch(getUnrealizedStoriesForSprint(SprintSelector.activeSprint.id!))
      } 
      //dispatch(reset());
    }
    if (SprintSelector.isErrorActive && !SprintSelector.isLoadingActive) {
      toast.error(SprintSelector.message);
      console.log("active sprint not")
      if (SprintSelector.sprints) {
        SprintSelector.sprints.map((item) => {
        const endDate = new Date(item.endDate);
        const todayDate = new Date();
        if (endDate < todayDate) {
          dispatch(getUnrealizedStoriesForSprint(item.id!))
        }})
      }
    }
  }, [
    SprintSelector.isSuccessActive,
    SprintSelector.isErrorActive,
    SprintSelector.isLoadingActive,
  ]);

  //console.log(SprintSelector)
  useEffect(() => {
    if (isSuccess && !isLoading) {
      toast.success(message)
    }
    if (isError && !isLoading) {
      toast.error(message);
    }
  }, [isSuccess, isError, isLoading]);

  useEffect(() => {

    if (isStoryUpdateSuccess && !isStoryUpdateLoading && projectsState.activeProject.id) {
      dispatch(reset());
      dispatch(getAllStoryById(projectsState.activeProject.id!));
   
      dispatch(getActiveSprint(projectsState.activeProject.id!));
      toast.success(message)
    }
    if (isStoryUpdateError && !isStoryUpdateLoading) {
      toast.error(message);
    }
  }, [isStoryUpdateError, isStoryUpdateLoading, isStoryUpdateSuccess]);

  useEffect(() => {
    if (projectsState.activeProject.id === "") {
      dispatch(getActiveProject());
    }
  }, []);

  useEffect(() => {
    if (projectsState.isActiveProjectSuccess && !projectsState.isActiveProjectLoading) {
      dispatch(getAllStoryById(projectsState.activeProject.id!));
      dispatch(getAllSprints(projectsState.activeProject.id!));
      dispatch(getProjectUserRoles(projectsState.activeProject.id!));
      if (SprintSelector.activeSprint === undefined && projectsState.activeProject !== undefined) {
        dispatch(getActiveSprint(projectsState.activeProject.id!));
      }
      
    }
    if (projectsState.isActiveProjectError && !projectsState.isActiveProjectLoading) {
      toast.error(projectsState.message);
    }
  }, [projectsState.isActiveProjectSuccess, projectsState.isActiveProjectLoading, projectsState.isActiveProjectError]);








  useEffect(() => {
    if (projectsState.activeProject.id) {
      const dataArray = Object.values(projectsState.userRoles);
      const filteredDataScramMaster = dataArray.filter(
        (item) => item.role === 1
      );
      const filteredDataProductOwner = dataArray.filter(
        (item) => item.role === 2
      );
      if (filteredDataScramMaster) {
        setScrumMasterId(filteredDataScramMaster[0].userId);
      }
      if (filteredDataProductOwner) {
        setScrumProductOwnerId(filteredDataProductOwner[0].userId);
      }
    }
  }, [projectsState.userRoles]);







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
  const [productOwnerId, setScrumProductOwnerId] = useState();

  useEffect(() => {
    if (user === null) {
      return;
    }
    const token = JSON.parse(localStorage.getItem("user")!).token;
    const userData = parseJwt(token);
    setIsAdmin(userData.isAdmin);
    setUserName(userData.sub);
    setUserId(userData.sid);
  }, [user]);

  const isUserScramMaster = () => {
    if (scrumMasterId === userId && userId && scrumMasterId) return true;
    else return false;
  };
  const isUserProductOwn = () => {
    if (productOwnerId === userId && userId && productOwnerId) return true;
    else return false;
  };


  //console.log(stories)
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) {
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
      case ProductBacklogItemStatus.WONTHAVE:
        return 0;
      case ProductBacklogItemStatus.UNALLOCATED:
        return 1;
      case ProductBacklogItemStatus.ALLOCATED:
        return 2;
      default:
        return 3;
    }
  };

  type HandrejectFunc = (args: {
    status: string;
    //itemToDelete: StoryData;
    index: number;
    destination: string;
  }) => void;

  //console.log(SprintSelector.activeSprint)
  const allocatedItems = itemsByStatus[ProductBacklogItemStatus.ALLOCATED];
  const totalComplexity = allocatedItems.map((item) => item.timeComplexity).reduce((acc, curr) => acc + curr, 0);

  const handleDragEnd: DragDropContextProps["onDragEnd"] = ({
    source,
    destination,
  }) => {
    setItemsByStatus((current) =>
      produce(current, (draft) => {
        // dropped outside the list
        dispatch(getActiveProject());
        dispatch(getAllStoryById(projectsState.activeProject.id!));
        if (!destination || destination.droppableId === source.droppableId) {
          return;
        }

        if (destination.droppableId === ProductBacklogItemStatus.ALLOCATED) {
          if (SprintSelector.activeSprint?.velocity !== undefined &&
            SprintSelector.activeSprint?.velocity < totalComplexity
          ) {
            toast.error("Sprint Velocity is full");

            return;
          }
        }
        if (
          source.droppableId === ProductBacklogItemStatus.UNALLOCATED &&
          destination.droppableId === ProductBacklogItemStatus.DONE
        ) {
          if (
            SprintSelector.activeSprint?.velocity ==
            itemsByStatus[ProductBacklogItemStatus.ALLOCATED].length
          ) {
            toast.error("Story is not in active Sprint and is not realised");
            return;
          }
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
          projectId: parseInt(projectsState.activeProject?.id || ""),
          category: categoryChange(destination.droppableId),
          storyId: removed.id || "",
        };
        dispatch(updateStoryCategory(projectRoleData));

        if (
          destination.droppableId === ProductBacklogItemStatus.ALLOCATED &&
          destination.droppableId != source.droppableId
        ) {
          const storySprint: StorySprint = {
            sprintId: parseInt(SprintSelector.activeSprint?.id || ""),
            storyId: parseInt(removed.id || ""),
          };
          dispatch(addStoryToSprint(storySprint));
        }
        //itemsByStatus[destination.droppableId].length

        if (
          source.droppableId === ProductBacklogItemStatus.ALLOCATED &&
          destination.droppableId != ProductBacklogItemStatus.DONE
        ) {
        }
      })
    );
  };




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
    const targetId = e.target.id;

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
      //dispatch(getAllStoryById(projectsState.activeProject.id!));
      console.log("se to slploh štarta")
      resetState();
      if (SprintSelector.isUnrealizedSuccess && !SprintSelector.isUnrealizedLoading) {
      

        //dispatch(reset());
        //dispatch(getAllStoryById(projectsState.activeProject.id!));

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

          //sprint zgodbice
          //  const uniquePrintStoryIds = Array.from(new Set(SprintSelector.unrealizedStories.map((item) => item.id)));
          if (stories) {
            stories.forEach((story: StoryData) => {
              
              if (story.category === 2) {
                //if (SprintSelector.activeSprint === undefined) { return; }
                const storyInSprint = SprintSelector.unrealizedStories.find((item) => item.id === story.id);
                if (storyInSprint === undefined) {
                  return;
                }
                
              }
              
              
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
              //ce je category 2 potem dodaj elemnte iz sprint trenutnega oz lahko bi primerjal
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
                tasks: story.tasks
              });
            });

            setItemVisibility(visibilityObject);
            setItemTime(insertTimeObject);
          }
        })
      );
      }
      if (SprintSelector.isUnrealizedError && !SprintSelector.isUnrealizedLoading) {
        toast.error("Sprint ni Aktiviran");
        
    }
  
  }, [SprintSelector.isUnrealizedSuccess, SprintSelector.isUnrealizedLoading, SprintSelector.isUnrealizedError]);

  //{Object.values.map(([columnId, column], index) => {

  //modal za delete
  const [show, setShow] = useState(false);

  const [showContextMenu, setShowContextMenu] = useState(false);

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
  const openRejectStoryModal = (item: StoryData, status: string, index: number) => {
    setTempDataReject({item, status, index});
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
    tasks: []
  };

  const [tempDataStory, setTempDataStory] = useState<StoryData>(initvalue);
  const getDataStory = (item: StoryData) => {
    setTempDataStory(item);
    console.log('call');
    //console.log(item);
    return setShowStory(true);
  };
  const [tempDataReject, setTempDataReject] = useState<{
    item: StoryData;
    status: string;
    index: number;
  }>();
  const getDataReject = (item: StoryData, status: string, index: number) => {
    setTempDataReject({ item, status, index });
    //console.log(item);
    return setShowRejectStoryModal(true);
  };

  const getDataApproved = (item: StoryData, status: string, index: number) => {
    //setTempDataApproved({ item, status, index });
    //console.log(item);
    dispatch(confirmStory(item.id!));
    let projectRoleData = {
      projectId: parseInt(projectsState.activeProject?.id || ""),
      category: categoryChange(ProductBacklogItemStatus.DONE),
      storyId: item.id || "",
    };
    console.log(projectRoleData)
    dispatch(updateStoryCategory(projectRoleData));
    dispatch(reset());
  };

  // utility function for edit story
  function getTestsForEdit(items: any): string[] {
    return items.map((item: any) => item.description);
  }

  function handleShowPlanningPokerModal(story: StoryData) {
    setStoryIdForPoker(story.id!)
    setShowPlanningPokerModal(true);
  }

  function closePlanningPokerModal() {
    setShowPlanningPokerModal(false);
  }
  
  
  //console.log(totalComplexity)
  return (
    <><div className="col-sm-8 col-md-6 col-xl-6 p-3 pb-0">
        <div className="d-flex align-items-end justify-content-center bg-light">Product Backlog</div>

      </div>
      <div className="row flex-row flex-sm-nowrap m-1">
        <DragDropContext onDragEnd={handleDragEnd}>
          {Object.values(ProductBacklogItemStatus).map((status) => {
            return (
              <div className="col-sm-4 col-md-3 col-xl-3 mt-3" key={status}>
                <Card className="bg-light border-0 ">
                  <div className="pt-3 hstack gap-2 mx-3">
                    <Card.Title className="fs-6 my-0  text-truncate">
                      {status}
                    </Card.Title>
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
                      <p className="fs-6 my-0 ms-auto">
                    Velocity: {totalComplexity}  / {SprintSelector.activeSprint?.velocity} PT
                      </p>
                     
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
                              //{if (item.category !== 2) { } }
                              <Draggable
                                key={item.id}
                                draggableId={item.id!}
                                index={index}
                                isDragDisabled={
                                  status ===
                                    ProductBacklogItemStatus.WONTHAVE ||
                                  !Boolean(itemTime[item.id!]) ||
                                  !isUserScramMaster()
                                    ? true
                                    : status === ProductBacklogItemStatus.DONE
                                    ? true
                                    : status ===
                                      ProductBacklogItemStatus.ALLOCATED
                                    ? true
                                    : SprintSelector.activeSprint?.velocity! < (totalComplexity + item.timeComplexity)
                                    ? true
                                    : undefined
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
                                          {status ===
                                            ProductBacklogItemStatus.ALLOCATED &&
                                            isUserProductOwn() && item.tasks.every(item => item.category === 250) && (
                                              <>
                                                <p className="fs-6 text-muted m-1 mx-auto">
                                                  Task Finished:{" "}
                                                </p>
                                                <Button
                                                  className="m-0 p-0 px-2"
                                                  variant="danger"
                                                  onClick={() =>
                                                    getDataReject(
                                                      item,
                                                      status,
                                                      index
                                                    )
                                                  }
                                                >
                                                  Reject
                                                </Button>
                                                <Button
                                                  className="m-0 p-0 px-2"
                                                  variant="primary"
                                                  onClick={() =>
                                                    getDataApproved(
                                                      item,
                                                      status,
                                                      index
                                                    )
                                                  }
                                                >
                                                  Accept
                                                </Button>
                                              </>
                                            )}
                                          {status !==
                                            ProductBacklogItemStatus.WONTHAVE &&  (
                                              <DropdownStory
                                                item={item}
                                                status={status}
                                                index={index}
                                                openEditStoryModal={({item}) => openEditStoryModal(item)}
                                                setShow={setShow}
                                                getDataReject={({ item, status, index }) => getDataReject(item, status, index)}
                                                show={show}
                                                handleShowPlanningPokerModal={handleShowPlanningPokerModal}
                                                isUserProductOwn={isUserProductOwn}
                                              />
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
                                                        placeholder={itemTime[
                                                          item.id!
                                                        ].toString()}
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
                                                {!itemVisibility[item.id!] &&
                                                  isUserScramMaster() && (
                                                    <Button
                                                      id={item.id}
                                                      //isUserScramMaster
                                                      onClick={() =>
                                                        handleFormToggle(
                                                          item.id!
                                                        )
                                                      }
                                                      variant="link"
                                                      className="m-0 p-0 float-end text-decoration-none"
                                                    >
                                                      {itemTime[item.id!]}
                                                    </Button>
                                                  )}
                                                {!isUserScramMaster() && (
                                                  <p className="m-0 p-0 float-end text-decoration-none">
                                                    {itemTime[item.id!]}
                                                  </p>
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
        
            <StoryForm
              projectId={projectsState.activeProject.id}
              isEdit={false}
              sequenceNumberInit=""
              titleInit=""
              descriptionInit=""
              testsInit={[""]}
              priorityInit=""
              businessValueInit=""
              closeModal={hideNewStoryModal}
              show={showNewStoryModal}
            />
        
      )}
      {showstory && (
        <StoryModal
          item={tempDataStory}
          onCancel={() => setShowStory(false)}
          show={showstory}
        />
      )}
      {showEditStoryModal && (
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
              show={showEditStoryModal}
            />
      )}
      {showRejectStoryModal && (
        <RejectStoryModal
          elements={tempDataReject!}
          onCancel={() => setShowRejectStoryModal(false)}
          show={showRejectStoryModal}
        />
      )}
      {showPlanningPokerModal && <PlanningPokerModal projectId={projectsState.activeProject.id!} storyIdForPoker={storyIdForPoker} isUserScrumMaster={isUserScramMaster()} showModal={showPlanningPokerModal} closeModal={closePlanningPokerModal} />}
    </>
  );
}

export default ProductBacklog;
