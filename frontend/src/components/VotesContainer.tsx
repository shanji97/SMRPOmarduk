import React, {useMemo} from "react";
import {Button} from "react-bootstrap";
import {useAppDispatch} from "../app/hooks";
import {voteForRound} from "../features/planningPoker/planningPokerSlice";

const HOURS = [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100];

interface VotesContainerProps {
  activeRoundId: string
}

const VotesContainer: React.FC<VotesContainerProps> = ({activeRoundId}) => {
  const dispatch = useAppDispatch();
  const voteForHour = (hours: number) => {
    dispatch(voteForRound({roundId: activeRoundId, value: hours}))
  }

  const possibleVotes = useMemo(() => (
    HOURS.map(hour => <Button key={hour} onClick={() => {voteForHour(hour)}} variant='outline-primary' style={{margin: '.2rem'}}>{hour}</Button>)
  ), [HOURS]);

  return <div>
    <span>Your estimate:</span>
    {possibleVotes}
  </div>
}

export default VotesContainer;