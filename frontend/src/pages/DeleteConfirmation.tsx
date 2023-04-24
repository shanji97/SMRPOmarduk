import React from 'react'
import { Modal, Button } from "react-bootstrap";
import { StoryData, ProductBacklogItemStatus } from '../classes/storyData';


export interface DeleteConfirmationProps {
    onCancel: VoidFunction
    show: boolean
    item: StoryData
    status: ProductBacklogItemStatus;
    onDelete: (args: {
      status: ProductBacklogItemStatus;
      itemToDelete: StoryData;
    }) => void;
}

function DeleteConfirmation({ 
    onCancel,
    show,
    item,
    onDelete,
    status,
}: DeleteConfirmationProps) {



    return (
        <Modal show={show} onHide={onCancel}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body><div className="alert alert-danger">Are you sure you want to delete {item.id}</div></Modal.Body>
        <Modal.Footer>
          <Button variant="default" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => onDelete({
                        status,
                        itemToDelete: item,
                      })}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    )
}

export default DeleteConfirmation;