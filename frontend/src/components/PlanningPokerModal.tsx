import React, {useEffect} from "react";
import {Button, Modal} from "react-bootstrap";
import {StoryData} from "../classes/storyData";

interface PlanningPokerModalProps {
  isUserScrumMaster: boolean
  storyIdForPoker: string
  showModal: boolean
  closeModal: () => void
}
const PlanningPokerModal: React.FC<PlanningPokerModalProps> = ({storyIdForPoker, isUserScrumMaster, closeModal, showModal}) => {

  useEffect(() => {
    console.log(storyIdForPoker);
  }, []);

  return (
    <Modal show={showModal} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>Planning Poker</Modal.Title>
      </Modal.Header>

      <Modal.Body>

      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={closeModal}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PlanningPokerModal;
