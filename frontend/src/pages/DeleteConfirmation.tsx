import React, { useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { StoryData, ProductBacklogItemStatus } from "../classes/storyData";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  deleteStory,
  getAllStoryById,
  reset,
} from "../features/stories/storySlice";
import { toast } from "react-toastify";
import { getActiveProject } from "../features/projects/projectSlice";

export interface DeleteConfirmationProps {
  onCancel: VoidFunction;
  show: boolean;
  item: StoryData;
}

function DeleteConfirmation({
  onCancel,
  show,
  item,
}: DeleteConfirmationProps) {
  const dispatch = useAppDispatch();
  let { isDeleteSuccess, isLoading, isDeleteError, message } = useAppSelector(
    (state) => state.stories
  );
  const { activeProject } = useAppSelector((state) => state.projects);
  


  useEffect(() => {
    if (isDeleteSuccess && !isLoading) {
      toast.success("Story successfully deleted");
      dispatch(reset());
      dispatch(getAllStoryById(activeProject.id!));
      onCancel();
    }
    if (isDeleteError && !isLoading) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isDeleteSuccess, isDeleteError, isLoading]);

  const handleDelete = () => {
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
