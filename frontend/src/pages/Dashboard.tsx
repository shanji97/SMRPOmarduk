import React, { useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { v4 as uuid } from "uuid";
import { Card, Dropdown, ProgressBar } from "react-bootstrap";
import {
  CircleFill,
  Clock,
  Pencil,
  ThreeDots,
  Trash,
  Stack,
} from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.css";
import { useAppSelector } from "../app/hooks";
import { useNavigate } from "react-router-dom";

//installed packages:
//npm install @hello-pangea/dnd --save
//npm install uuidv4
//npm install react-bootstrap-icons --save
//npm install --save react-bootstrap
//npm install bootstrap --save

const itemsFromBackend = [
  { id: uuid(), content: "First task" },
  { id: uuid(), content: "Second task" },
  { id: uuid(), content: "Third task" },
  { id: uuid(), content: "Fourth task" },
  { id: uuid(), content: "Fifth task" },
];

const columnsFromBackend = {
  [uuid()]: {
    name: "Requested",
    items: itemsFromBackend,
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

function Dashboard() {
  const [columns, setColumns] = useState(columnsFromBackend);
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.users);

  useEffect(() => {
    if (user === null) {
      console.log("redirect");
      navigate("/login");
    }
  }, [user]);

  const onDragEnd = ({ destination, source }: DropResult) => {
    if (!destination) return;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems,
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems,
        },
      });
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems,
        },
      });
    }
  };

  return (
    <div className="row flex-row flex-sm-nowrap m-1 mt-3">
      <DragDropContext onDragEnd={onDragEnd}>
        {Object.entries(columns).map(([columnId, column], index) => {
          return (
            <div className="col-sm-4 col-md-3 col-xl-3 mt-3">
              <Card className="bg-light border-0 " key={columnId}>
                <div className="pt-3 hstack gap-2 mx-3">
                  <Card.Title className="fs-6 my-0">{column.name}</Card.Title>
                  <div className="vr my-0"></div>
                  <p className="fs-6 my-0">6</p>
                </div>
                <hr className="hr mx-3" />


                <Droppable droppableId={columnId} key={columnId}>
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
                        {column.items.map((item, index) => {
                          return (
                            <Draggable
                              key={item.id}
                              draggableId={item.id}
                              index={index}
                            >
                              {(provided, snapshot) => {
                                return (
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
                                        TSK-39
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
                                          <Dropdown.Item>
                                            <Trash /> Delete
                                          </Dropdown.Item>
                                          <Dropdown.Item href="#/action-3">
                                            Something else
                                          </Dropdown.Item>
                                        </Dropdown.Menu>
                                      </Dropdown>
                                    </Card.Header>
                                    <Card.Body>
                                      <Card.Text>{item.content}</Card.Text>
                                      <ProgressBar
                                        style={{ height: "3px" }}
                                        now={60}
                                      />
                                      <div className="pt-3 hstack gap-2 ">
                                        <Clock className="text-muted" />
                                        <p className="fs-6 text-muted my-0">
                                          {" "}
                                          2h
                                        </p>

                                        <CircleFill className="text-muted ms-auto" />

                                        <div className="vr"></div>

                                        <Stack className="text-muted" />
                                        <p className="fs-6 text-muted my-0">
                                          6
                                        </p>
                                      </div>
                                    </Card.Body>
                                  </Card>
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
  );
}

export default Dashboard;
