import React, {Component, useEffect, useMemo, useState} from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
  DragDropContextProps,
} from "@hello-pangea/dnd";
import { v4 as uuid } from "uuid";
import {
  Badge,
  Button,
  ButtonGroup,
  ButtonToolbar,
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
  Table,
  ToggleButton,
  ToggleButtonGroup,
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
  Person,
} from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.css";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { Link, useNavigate, useParams } from "react-router-dom";
import { StoryData, SprintBacklogItemStatus } from "../classes/storyData";

import classesSprint from "./SprintBacklog.module.css";

import produce from "immer";
import DeleteConfirmation from "./DeleteConfirmation";
import {
  getAllStoryById,
  deleteStory,
  getStoriesForSprint,
} from "../features/stories/storySlice";
import classes from "./Dashboard.module.css";
import StoryModal from "./StoryModal";
import DropdownMenu from "react-bootstrap/esm/DropdownMenu";
import { parseJwt } from "../helpers/helpers";
import TaskModal from "./TaskModal";
import TaskForm from "../components/TaskForm";
import EditTaskForm from "../components/EditTaskForm";
import DeleteTaskModal from "../components/DeleteTaskModal";
import AssignUserForm from "../components/AssignUserForm";
import { getTasksForSprint } from "../features/tasks/taskSlice";
import { reset } from "../features/tasks/taskSlice";
import { getProjectUserRoles } from "../features/projects/projectRoleSlice";
import {
  getActiveSprint,
  getAllSprints,
} from "../features/sprints/sprintSlice";
import { getActiveProject, getProject } from "../features/projects/projectSlice";
import { getAllUsers } from "../features/users/userSlice";
import { UserRole } from "../classes/projectData";
import { toast } from "react-toastify";

function SprintBacklog() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  let { activeSprint } = useAppSelector((state) => state.sprints);
  let taskState = useAppSelector((state) => state.tasks);

  const projectsState = useAppSelector((state) => state.projects);
  const projectRolesState = useAppSelector((state) => state.projectRoles);
  let { users, user } = useAppSelector((state) => state.users);
  let { stories, storiesForSprint, isSuccess } = useAppSelector(
    (state) => state.stories
  );

  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [developersOnProject, setDevelopersOnProject] = useState<string[]>([]);
  const [itemsByStatus, setItemsByStatus] = useState<StoryData[]>([]);

  useEffect(() => {
    if (users.length === 0) {
      dispatch(getAllUsers());
    }
  }, []);

  useEffect(() => {
    if (taskState.isSuccess || taskState.isError) {
      dispatch(reset());
    }
  }, [taskState.isSuccess, taskState.isError]);

  // get active project
  useEffect(() => {
    if (projectsState.activeProject.id === "") {
      dispatch(getActiveProject());
    }
  }, []);



  // fetch stories in sprint
  useEffect(() => {
    if (activeSprint !== undefined) {
      dispatch(getStoriesForSprint(activeSprint.id!));
    }
  }, [activeSprint]);


  useEffect(() => {
    if (projectsState.isActiveProjectSuccess && !projectsState.isActiveProjectLoading) {
      // get developer list
      dispatch(getProjectUserRoles(projectsState.activeProject.id!));
      // get active sprint id
      if (activeSprint === undefined && projectsState.activeProject !== undefined) {
        dispatch(getActiveSprint(projectsState.activeProject.id!));
      }
    }
    if (projectsState.isActiveProjectError && !projectsState.isActiveProjectLoading) {
      toast.error(projectsState.message);
    }
  }, [projectsState.isActiveProjectSuccess, projectsState.isActiveProjectLoading, projectsState.isActiveProjectError]);



  useEffect(() => {
    if (projectRolesState.isSuccess && !projectRolesState.isLoading) {
      setDevelopersOnProject([]);
      projectRolesState.userRoles.forEach((user: any) => {
        if (user.role === 0) {
          setDevelopersOnProject((prevDevelopers) => {
            const newDevelopers = [...prevDevelopers];
            newDevelopers.push(user.userId.toString());
            return newDevelopers;
          });
        }
      });
    }
  }, [projectRolesState.isSuccess, projectRolesState.isLoading]);

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

  const isUserScrumMaster = (userRoles: UserRole[]) => {
    if (userRoles.length == 0) {
      return false;
    }
    let scrumMasterId = userRoles.filter((user) => user.role === 1)[0].userId;
    if (userId !== undefined) {
      return parseInt(userId) === scrumMasterId;
    }
    return false;
  };

  useEffect(() => {
    if (activeSprint !== undefined && activeSprint.id !== undefined) {
      // getStoriesForSprint(activeSprint.id);
      dispatch(getTasksForSprint(activeSprint.id));
    }
  }, [activeSprint]);

  useEffect(() => {
    if (user === null) {
      navigate("/login");
    }
  }, [user]);

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
  const [showAssignUserModal, setShowAssignUserModal] = useState(false);

  // this is for add/edit modals
  const [selectedStoryId, setSelectedStoryId] = useState("");
  const [selectedTask, setSelectedTask] = useState<any>({});

  const sumOfEstimatedTimes = (storyId: string) => {
    let sum = 0;
    taskState.tasksForSprint.forEach(task => {
      if (storyId === task.storyId) {
        sum += task.remaining;
      }
    })

    return sum;
  }

  const openAddTaskModal = (id: string) => {
    setSelectedStoryId(id);
    setShowAddTaskModal(true);
  };

  const openEditTaskModal = (task: any) => {
    setSelectedTask(task);
    setShowEditTaskModal(true);
  };

  const openDeleteTaskModal = (task: any) => {
    setSelectedTask(task);
    setShowDeleteTaskModal(true);
  };

  const openAssignUserModal = (task: any) => {
    setSelectedTask(task);
    setShowAssignUserModal(true);
  };

  const hideAddTaskModal = () => {
    setShowAddTaskModal(false);
  };

  const hideEditTaskModal = () => {
    setShowEditTaskModal(false);
  };

  const hideDeleteTaskModal = () => {
    setShowDeleteTaskModal(false);
  };

  const hideAssignUserkModal = () => {
    setShowAssignUserModal(false);
  };

  const stringPriority = (priority: number): string[] => {
    switch (priority) {
      case 0:
        return ["Must have", "badge-light-must"];
      case 1:
        return ["Could have", "badge-light-could"];
      case 2:
        return ["Should have", "badge-light-should"];
      case 3:
        return ["Won't have this time", "gray-wont"];
      default:
        return [];
    }
  };

  //doda začetne elemnte
  useEffect(() => {
    const isEmpty = Object.values(itemsByStatus).every((value) => value);
    if (isEmpty && isSuccess) {
      setItemsByStatus(stories);
    }
  }, [isSuccess]);

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

  //modal za form
  const [showForm, setShowForm] = useState(false);
  const [tempDataStory, setTempDataTask] = useState<StoryData>(initvalue);
  const getDataTask = (item: StoryData) => {
    setTempDataTask(item);
    return setShowForm(true);
  };

  const isTaskUnassigned = (task: any) => {
    // return task.assignedUserId == null;
    return task.category === 1;
  };

  const isTaskAssigned = (task: any) => {
    // return task.assignedUserId != null && task.dateAccepted == null;
    return task.category === 2;
  };

  const isTaskInProgress = (task: any) => {
    // return task.dateAccepted != null && task.dateEnded == null;
    return task.category === 3;
  };

  const isTaskFinished = (task: any) => {
    // return task.dateEnded != null;
    return task.category === 250;
  };

  const renderStatus = (task: any) => {
    if (isTaskUnassigned(task)) {
      return (
        <Badge bg="secondary">
          <span className={classesSprint.badgeStatus}>Unassigned</span>
        </Badge>
      );
    } else if (isTaskAssigned(task)) {
      return (
        <Badge bg="primary">
          <span className={classesSprint.badgeStatus}>Assigned</span>
        </Badge>
      );
    } else if (isTaskInProgress(task)) {
      return (
        <Badge bg="warning">
          <span className={classesSprint.badgeStatus}>In progress</span>
        </Badge>
      );
    } else if (isTaskFinished(task)) {
      return (
        <Badge bg="success">
          <span className={classesSprint.badgeStatus}>Finished</span>
        </Badge>
      );
    }
  };

  const [valueBar, setValueBar] = useState(0);

  const handleChangeBar = (val: number) => {
    setValueBar(val);
  };
  
  return (
    <>
      <div className="row flex-row flex-sm-nowrap m-1 mt-3 justify-content-center">
        <div className="col-sm-8">
          <div className="d-flex flex-row-reverse">

            <ButtonToolbar>
              <ToggleButtonGroup type="radio" name="options" defaultValue={0} onChange={handleChangeBar}>
                <ToggleButton id="tbg-radio-0" value={0}>
                  All
                </ToggleButton>
                <ToggleButton id="tbg-radio-1" value={1}>
                  Unassigned
                </ToggleButton>
                <ToggleButton id="tbg-radio-2" value={2}>
                  Assigned
                </ToggleButton>
                <ToggleButton id="tbg-radio-3" value={3}>
                  In progress
                </ToggleButton>
                <ToggleButton id="tbg-radio-4" value={250}>
                  Finished
                </ToggleButton>
              </ToggleButtonGroup>
            </ButtonToolbar>
          </div>
          {storiesForSprint.map((story) => {
            // console.log(item);
            return (
              <Card className="mt-3" key={story.id}>
                <Tab.Container id="left-tabs-example" defaultActiveKey="first">
                  <Card.Header>
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
                        <Card.Title>{story.title}</Card.Title>
                        <Card.Text>{story.description}</Card.Text>

                        <Table
                          responsive="lg"
                          className={` ${classes["gfg"]} small`}
                        >
                          <thead>
                          <tr>
                            <th>#</th>
                            <th>Description</th>
                            <th>Estimated time (hrs)</th>
                            <th>Status</th>
                            <th>Options</th>
                          </tr>
                          </thead>

                          <tbody>
                          {taskState.tasksForSprint
                            .filter((task) => task.storyId === story.id)
                            .map((task) => (
                              
                              <> 
                                {(valueBar === 0 ||  task.category === valueBar) && (
                                  <tr key={task.id}>
                                    <td>{task.id}</td>
                                    <td>{task.name}</td>
                                    <td className="">{task.remaining}</td>
                                    <td>{renderStatus(task)}</td>
                                    <td className="text-center">
                                      {!isTaskFinished(task) && (
                                        <Dropdown className="ms-auto">
                                          <Dropdown.Toggle
                                            variant="link"
                                            id="dropdown-custom-components"
                                            bsPrefix="p-0"
                                          >
                                            <ThreeDots />
                                          </Dropdown.Toggle>
                                          <Dropdown.Menu>
                                            <Dropdown.Item
                                              onClick={() =>
                                                openEditTaskModal(task)
                                              }
                                            >
                                              <Pencil /> Edit
                                            </Dropdown.Item>
                                            {(isTaskUnassigned(task) ||
                                              (isUserScrumMaster(projectRolesState.userRoles) &&
                                                isTaskAssigned(task))) && ( // TODO scrum master can update it when it is assigned !!!!
                                              <Dropdown.Item
                                                onClick={() =>
                                                  openAssignUserModal(task)
                                                }
                                              >
                                                <Person /> Assign User
                                              </Dropdown.Item>
                                            )}
                                            {(isTaskUnassigned(task) ||
                                              isTaskAssigned(task)) && (
                                              <Dropdown.Item
                                                onClick={() =>
                                                  openDeleteTaskModal(task)
                                                }
                                              >
                                                <Trash /> Delete
                                              </Dropdown.Item>
                                            )}
                                          </Dropdown.Menu>
                                        </Dropdown>
                                      )}
                                    </td>
                                  </tr>
                                )} </>))}
                          </tbody>
                        </Table>

                        <Button
                          form="my_form"
                          size="sm"
                          type="button"
                          onClick={() => openAddTaskModal(story.id!)}
                        >
                          Add new task
                        </Button>
                        <span className='text-secondary'> Estimated time for story: {sumOfEstimatedTimes(story.id!)}h</span>
                      </Tab.Pane>
                      <Tab.Pane eventKey="second"></Tab.Pane>
                    </Tab.Content>
                  </Card.Body>
                </Tab.Container>
              </Card>
            );
          })}
        </div>
      </div>

      {showForm && (
        <TaskModal
          item={tempDataStory}
          onCancel={() => setShowForm(false)}
          show={showForm}
        />
      )}

      {/* TODO 14 15 */}
      {showAddTaskModal && (
        <TaskForm
          storyId={+selectedStoryId}
          descriptionInit=""
          timeRequiredInit=""
          assignedUserIdInit=""
          closeModal={hideAddTaskModal}
          showModal={showAddTaskModal}
          developersOnProject={developersOnProject}
        />
      )}

      {showEditTaskModal && (
        <EditTaskForm
          id={selectedTask.id.toString()}
          descriptionInit={selectedTask.name}
          timeRequiredInit={selectedTask.remaining.toString()}
          showModal={showEditTaskModal}
          closeModal={hideEditTaskModal}
        />
      )}

      {showAssignUserModal && (
        <AssignUserForm
          id={selectedTask.id.toString()}
          assignedUserIdInit={
            selectedTask.assignedUserId
              ? selectedTask.assignedUserId.toString()
              : ""
          }
          developersOnProject={developersOnProject}
          showModal={showAssignUserModal}
          closeModal={hideAssignUserkModal}
        />
      )}

      {showDeleteTaskModal && (
        <DeleteTaskModal
          id={selectedTask.id.toString()}
          closeModal={hideDeleteTaskModal}
          showModal={showDeleteTaskModal}
        />
      )}
    </>
  );
}

export default SprintBacklog;