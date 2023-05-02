import React, {memo, useEffect} from "react";
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
    Popover,
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
import DeleteConfirmation from "../pages/DeleteConfirmation";
import { ProductBacklogItemStatus, StoryData } from "../classes/storyData";
import { Link } from "react-router-dom";



  export interface DropdownProps {
    item: StoryData;
    status: string;
    index: number;
    openEditStoryModal: (args: {
        item: StoryData;
      }) => void;
    setShow: (arg0: boolean) => void;
    getDataReject: (args: {
        item: StoryData;
        status: string;
        index: number;
      }) => void;
    show: boolean;
  }

const DropdownStory = memo(
  ({ status, item, index, getDataReject, openEditStoryModal, setShow, show }: DropdownProps) => {
    return (
        <>
      <Dropdown   className="ms-auto">
        <Dropdown.Toggle
          variant="link"
          id="dropdown-custom-components"
          bsPrefix="p-0"
          
        >
          <ThreeDots />
        </Dropdown.Toggle>
        <Dropdown.Menu >
          {status !== ProductBacklogItemStatus.UNALLOCATED && (
            <Dropdown.Item
              onClick={() => {
                getDataReject({item, status, index})
              }}
            >
              <Eraser /> Reject
            </Dropdown.Item>
          )}
          {status === ProductBacklogItemStatus.UNALLOCATED && (
            <Dropdown.Item onClick={() => openEditStoryModal({item})}>
              <Pencil /> Edit
            </Dropdown.Item>
          )}
          {status === ProductBacklogItemStatus.UNALLOCATED && (
            <Dropdown.Item onClick={() => setShow(true)}>
              <Trash /> Delete
            </Dropdown.Item>
          )}
          <DeleteConfirmation
            item={item}
            onCancel={() => setShow(false)}
            show={show}
          />
        </Dropdown.Menu>
      </Dropdown>
      </>
    );
  }
);

export default DropdownStory;
