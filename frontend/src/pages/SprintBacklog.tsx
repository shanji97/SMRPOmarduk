import React, { Component, useEffect, useState } from "react";
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
import { Link, useNavigate } from "react-router-dom";
import { StoryData, SprintBacklogItemStatus } from "../classes/storyData";

import classesSprint from "./SprintBacklog.module.css";

import produce from "immer";
import DeleteConfirmation from "./DeleteConfirmation";
import {
  getAllStory,
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
import { getActiveProject } from "../features/projects/projectSlice";
import { getAllUsers } from "../features/users/userSlice";
import { UserRole } from "../classes/projectData";

function SprintBacklog() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  let { activeSprint } = useAppSelector((state) => state.sprints);
  let taskState = useAppSelector((state) => state.tasks);
  const { activeProject } = useAppSelector((state) => state.projects);
  let { userRoles } = useAppSelector((state) => state.projectRoles);
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
    if (activeProject.id === "") {
      dispatch(getActiveProject());
    }
  }, []);

  // get active sprint id
  useEffect(() => {
    if (activeSprint == undefined && activeProject != undefined) {
      dispatch(getActiveSprint(activeProject.id!));
    }
  }, [activeProject]);

  // fetch stories in sprint
  useEffect(() => {
    if (activeSprint != undefined) {
      dispatch(getStoriesForSprint(activeSprint.id!));
    }
  }, [activeSprint]);

  // get developer list
  useEffect(() => {
    dispatch(getProjectUserRoles(activeProject.id));
  }, []);

  useEffect(() => {
    setDevelopersOnProject([]);
    userRoles.forEach((user: any) => {
      if (user.role === 0) {
        setDevelopersOnProject((prevDevelopers) => {
          const newDevelopers = [...prevDevelopers];
          newDevelopers.push(user.userId.toString());
          return newDevelopers;
        });
      }
    });
  }, [activeProject, userRoles]);

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
      console.log("redirect");
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
  };

  //modal za form
  const [showForm, setShowForm] = useState(false);
  const [tempDataStory, setTempDataTask] = useState<StoryData>(initvalue);
  const getDataTask = (item: StoryData) => {
    setTempDataTask(item);
    return setShowForm(true);
  };

  const isTaskUnassigned = (task: any) => {
    return task.assignedUserId == null;
  };

  const isTaskAssigned = (task: any) => {
    return task.assignedUserId != null && task.dateAccepted == null;
  };

  const isTaskInProgress = (task: any) => {
    return task.dateAccepted != null && task.dateEnded == null;
  };

  const isTaskFinished = (task: any) => {
    return task.dateEnded != null;
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

    return "asd";
  };

  return (
    <>
      <div className="row flex-row flex-sm-nowrap m-1 mt-3 justify-content-center">
        <div className="col-sm-8">
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
                                            (isUserScrumMaster(userRoles) &&
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
                              ))}
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
