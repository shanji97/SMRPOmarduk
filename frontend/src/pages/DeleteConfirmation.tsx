import React, { useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { StoryData, ProductBacklogItemStatus } from "../classes/storyData";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  deleteStory,
  getAllStory,
  reset,
} from "../features/stories/storySlice";
import { toast } from "react-toastify";

export interface DeleteConfirmationProps {
  onCancel: VoidFunction;
  show: boolean;
  item: StoryData;
  status: ProductBacklogItemStatus;
}

function DeleteConfirmation({
  onCancel,
  show,
  item,
  status,
}: DeleteConfirmationProps) {
  const dispatch = useAppDispatch();
  let { isDeleteSuccess, isLoading, isDeleteError, message } = useAppSelector(
    (state) => state.stories
  );

  useEffect(() => {
    if (isDeleteSuccess && !isLoading) {
      toast.success("Story successfully deleted");
      dispatch(reset());
      dispatch(getAllStory());
      onCancel();
    }
    if (isDeleteError && !isLoading) {
      toast.error(message);
    }
  }, [isDeleteSuccess, isDeleteError, isLoading]);

  const handleDelete = () => {
    console.log("Delete: ", item.id);
    dispatch(deleteStory(item.id!)); // NOTE CHECK THIS !!!!
  };

  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Confirmation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete story #
        <strong>{`${item.sequenceNumber} ${item.title}`}</strong>?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteConfirmation;
