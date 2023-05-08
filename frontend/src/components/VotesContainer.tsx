import React, {useEffect, useMemo, useState} from "react";
import {Button} from "react-bootstrap";
import {useAppDispatch} from "../app/hooks";
import {voteForRound} from "../features/planningPoker/planningPokerSlice";
import {toast} from "react-toastify";

const HOURS = [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100];

interface VotesContainerProps {
  activeRoundId: string
  storyId: string
}

const VotesContainer: React.FC<VotesContainerProps> = ({storyId, activeRoundId}) => {
  const dispatch = useAppDispatch();
  // const {roundStarted, activeRound} = useAppSelector(state => state.poker);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    // console.log(activeRoundId);
  }, []);

  const voteForHour = (hours: number) => {
    dispatch(voteForRound({roundId: activeRoundId, value: hours}));
    toast.info(`You voted for ${hours} hours`)
  }

  const possibleVotes = useMemo(() => (
    HOURS.map(hour => <Button key={hour} onClick={() => {voteForHour(hour)}} variant='outline-primary' style={{margin: '.2rem'}}>{hour}</Button>)
  ), [HOURS]);

  return <div>
    <span>Your estimate (hours):</span>
    {possibleVotes}
  </div>
}

export default VotesContainer;