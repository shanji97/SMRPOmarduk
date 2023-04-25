import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { StoryData, ProductBacklogItemStatus } from "../classes/storyData";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  getAllStory,
  rejectStory,
  reset,
} from "../features/stories/storySlice";
import { toast } from "react-toastify";

export interface DeleteConfirmationProps {
  onCancel: VoidFunction;
  show: boolean;
  item: StoryData;

}

function RejectStoryModal({
  onCancel,
  show,
  item,
}: DeleteConfirmationProps) {
  const dispatch = useAppDispatch();
  let { isRejectSuccess, isLoading, isRejectError, message } = useAppSelector(
    (state) => state.stories
  );

  const [description, setDescription] = useState("");
  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const enteredDescriptionValid = description.trim() !== "";
  const descriptionInvalid = descriptionTouched && !enteredDescriptionValid;

  const descriptionChangedHandler = (e: any) => {
    setDescription(e.target.value);
  };
  const descriptionBlurHandler = (e: any) => {
    setDescriptionTouched(true);
  };

  
  

  useEffect(() => {
    if (isRejectSuccess && !isLoading) {
      toast.success("Story successfully deleted");
      dispatch(reset());
      dispatch(getAllStory());
      onCancel();
    }
    if (isRejectError && !isLoading) {
      toast.error(message);
    }
  }, [isRejectSuccess, isRejectError, isLoading]);






  const submitFormHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();


    setDescriptionTouched(true);
  

    // display error msg if form is invalid
    if (!enteredDescriptionValid) {
      toast.error("Make sure to properly fill out all required fields.");
      return;
    }


    // console.log(newStory);
    const updatedRejectStory = {
      description: description,
      storyId: item.id!
    }
    dispatch(rejectStory(updatedRejectStory))
  };

  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>Rejec Confirmation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to reject story #
        <strong>{`${item.sequenceNumber} ${item.title}`}</strong>?
        <Form onSubmit={submitFormHandler}>
        <Form.Group className="mb-4 mt-3" controlId="form-description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Add story description"
              name="description"
              value={description}
              onChange={descriptionChangedHandler}
              onBlur={descriptionBlurHandler}
              isInvalid={descriptionInvalid}
            />
          </Form.Group>
          <Button variant="default" onClick={onCancel}>
          Cancel
          </Button>
          <Button variant="danger" type="submit" size="lg">
            Reject
          </Button>
        </Form>
      </Modal.Body>
     
    </Modal>
  );
}

export default RejectStoryModal;