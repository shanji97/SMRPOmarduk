import React, {useEffect, useMemo} from "react";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {getPokerRound} from "../features/planningPoker/planningPokerSlice";

interface PokerRoundProps {
  roundId: string
}
const PokerRound: React.FC<PokerRoundProps> = ({roundId}) => {
  const dispatch = useAppDispatch();
  const {singleRound} = useAppSelector(state => state.poker);

  useEffect(() => {
    dispatch(getPokerRound(roundId));
  }, [roundId]);

  const rowCells = useMemo(() => {
    return singleRound.votes.map(vote => {
      return <td key={`${singleRound.id}-${vote.value}`}>{vote.value}</td>;
    });
  }, [singleRound]);

  return (
    <tr>
      <td>{singleRound.id}</td>
      {rowCells}
    </tr>
  );
}

export default PokerRound;
