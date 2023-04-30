import React, {Fragment, useEffect, useMemo, useState} from "react";
import {Button, Modal, Table} from "react-bootstrap";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {
  getActivePokerRound,
  getAllPokerRounds,
  newPokerRound
} from "../features/planningPoker/planningPokerSlice";
// @ts-ignore
import {getProjectUserRoles} from "../features/projects/projectSlice";
import PokerRound from "./PokerRound";
import VotesContainer from "./VotesContainer";


interface PlanningPokerModalProps {
  isUserScrumMaster: boolean
  storyIdForPoker: string
  showModal: boolean
  closeModal: () => void
  projectId: string
}
const PlanningPokerModal: React.FC<PlanningPokerModalProps> = ({projectId, storyIdForPoker, isUserScrumMaster, closeModal}) => {
  const dispatch = useAppDispatch();
  const {userRoles} = useAppSelector(state => state.projects);
  const {pokerRounds, activeRound} = useAppSelector(state => state.poker);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setShowModal(true);
  }, []);

  useEffect(() => {
    dispatch(getProjectUserRoles(projectId));
    dispatch(getAllPokerRounds(storyIdForPoker));
    dispatch(getActivePokerRound(storyIdForPoker));
  }, []);

  const userRolesWithoutOwner = useMemo(() => {
    return userRoles.filter(user => user.role !== 2);
  }, [userRoles]);

  const startNewRoundHandler = () => {
    dispatch(newPokerRound(storyIdForPoker));
  }

  return (
    <Modal show={showModal} onHide={closeModal} dialogClassName="modal-lg">
      <Modal.Header closeButton>
        <Modal.Title>Planning Poker</Modal.Title>
        {isUserScrumMaster && <Button onClick={startNewRoundHandler} style={{marginLeft: '.5rem'}}>New round</Button>}
      </Modal.Header>

      <Modal.Body>
        <h5>Rounds</h5>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>id</th>
              {userRolesWithoutOwner.map(role => (
                <th key={Math.random()}>{role.user.username}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pokerRounds.map((round, i) => (
              <PokerRound key={i} roundId={round.id!} roundActive={activeRound.id !== ''} isUserScrumMaster={isUserScrumMaster} numberOfPlayers={userRoles.length-1} />
            ))}
          </tbody>
        </Table>
        <Fragment>
          {activeRound.id !== '' && <VotesContainer activeRoundId={activeRound.id!} />}
        </Fragment>

      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={closeModal}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PlanningPokerModal;
