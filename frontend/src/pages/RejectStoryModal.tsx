import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { StoryData, ProductBacklogItemStatus } from "../classes/storyData";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  getAllStoryById,
  rejectStory,
  reset,
  updateStoryCategory,
} from "../features/stories/storySlice";
import { toast } from "react-toastify";
import { getAllSprints } from "../features/sprints/sprintSlice";
import { getActiveProject, getProjectUserRoles } from "../features/projects/projectSlice";

export interface DeleteConfirmationProps {
  onCancel: VoidFunction;
  show: boolean;
  elements: {item: StoryData, status: string, index: number};
}

function RejectStoryModal({
  onCancel,
  show,
  elements
}: DeleteConfirmationProps) {
  const dispatch = useAppDispatch();
  let { isRejectSuccess, isRejectLoading, isRejectError, message } = useAppSelector(
    (state) => state.stories
  );
  let { activeProject } = useAppSelector((state) => state.projects);

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
    if (isRejectSuccess && !isRejectLoading) {
      
      toast.success("Story successfully Rejected");
      
      let projectRoleData = {
        projectId: parseInt(activeProject?.id || ""),
        category: 1,
        storyId: elements.item.id || "",
      };
      
      dispatch(updateStoryCategory(projectRoleData));
      dispatch(reset());
      onCancel();
    }
    if (isRejectError && !isRejectLoading) {
      toast.error(message);
    }
  }, [isRejectSuccess, isRejectError, isRejectLoading]);






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
      storyId: elements.item.id!
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
        <strong>{`${elements.item.sequenceNumber} ${elements.item.title}`}</strong>?
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