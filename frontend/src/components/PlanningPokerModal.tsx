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
import {ArrowClockwise} from "react-bootstrap-icons";
import { toast } from "react-toastify";

interface PlanningPokerModalProps {
  isUserScrumMaster: boolean
  storyIdForPoker: string
  showModal: boolean
  closeModal: () => void
  projectId: string
  itemTime: any,
  updateTimeComplexities: (newComplexities: any) => void
}
const PlanningPokerModal: React.FC<PlanningPokerModalProps> = ({updateTimeComplexities, itemTime, projectId, storyIdForPoker, isUserScrumMaster, closeModal}) => {
  const dispatch = useAppDispatch();
  const {userRoles} = useAppSelector(state => state.projects);
  const {pokerRounds, roundStarted, activeRound} = useAppSelector(state => state.poker);
  const [showModal, setShowModal] = useState(false);
  const [showVotingOptions, setShowVotingOptions] = useState(false);
  const [shouldReload, setShouldReload] = useState(false);

  useEffect(() => {
    setShowModal(true);
  }, []);

  useEffect(() => {
    dispatch(getProjectUserRoles(projectId));
    dispatch(getAllPokerRounds(storyIdForPoker));
    dispatch(getActivePokerRound(storyIdForPoker));
  }, [storyIdForPoker]);

  useEffect(() => {
    dispatch(getActivePokerRound(storyIdForPoker));
    dispatch(getAllPokerRounds(storyIdForPoker));
  }, [roundStarted]);

  const developers = useMemo(() => {
    return userRoles.filter(user => user.role !== 2 && user.role !== 1);
  }, [userRoles]);

  const startNewRoundHandler = () => {
    dispatch(newPokerRound(storyIdForPoker));
    toast.success('New round started!');
    dispatch(getAllPokerRounds(storyIdForPoker));
  }

  const reloadRounds = () => {
    setShouldReload(true);
    dispatch(getAllPokerRounds(storyIdForPoker));
    dispatch(getActivePokerRound(storyIdForPoker));
  }

  return (
    <Modal show={showModal} onHide={closeModal} dialogClassName="modal-lg">
      <Modal.Header closeButton>
        <Modal.Title>Planning Poker</Modal.Title>
        {isUserScrumMaster && <Button onClick={startNewRoundHandler} style={{marginLeft: '.5rem'}}>New round</Button>}
      </Modal.Header>

      <Modal.Body>
        <div style={{ display: 'inline-flex', alignItems: 'center'}}>
          <h5>Rounds</h5>
          <Button onClick={reloadRounds} variant='outline-primary' style={{marginBottom: '.5rem', marginLeft: '.5rem'}}><ArrowClockwise /></Button>
        </div>

        <Table striped bordered hover>
          <thead>
          <tr>
            <th>id</th>
            {developers.map(role => (
              <th key={Math.random()}>{role.user.username}</th>
            ))}
            <th>Average</th>
          </tr>
          </thead>
          <tbody>
          {pokerRounds.length > 0 ? pokerRounds.map((round, i) => (
            <Fragment>
              <PokerRound
                key={i}
                index={i}
                round={round}
                numberOfRounds={pokerRounds.length}
                activeRound={activeRound}
                isUserScrumMaster={isUserScrumMaster}
                numberOfPlayers={developers.length}
                setShowVotingOptions={setShowVotingOptions}
                shouldReload={shouldReload}
                itemTime={itemTime}
                updateTimeComplexities={updateTimeComplexities}
              />
            </Fragment>

          )) : <td className='text-secondary' colSpan={userRoles.length} style={{ textAlign: "center" }}>
            No rounds yet
          </td>}
          </tbody>
        </Table>
        <Fragment>
        {activeRound && activeRound.id !== '' && !isUserScrumMaster && <VotesContainer storyId={storyIdForPoker} activeRoundId={pokerRounds[pokerRounds.length-1].id!} />}
        </Fragment>

      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={closeModal}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PlanningPokerModal;