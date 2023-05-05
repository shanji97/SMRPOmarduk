import React, {Fragment, useEffect, useMemo, useState} from "react";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {getBaseUrl} from "../helpers/helpers";
import {Round, RoundWithVotes} from "../classes/round";
import {Button} from "react-bootstrap";
import {Check, X} from "react-bootstrap-icons";
import {endPlanningPoker, reset} from "../features/planningPoker/planningPokerSlice";
import {toast} from "react-toastify";
import { applyResult } from "../features/planningPoker/planningPokerSlice";
interface PokerRoundProps {
  round: Round,
  numberOfRounds: number,
  index: number,
  isUserScrumMaster: boolean,
  numberOfPlayers: number,
  activeRound: RoundWithVotes,
  setShowVotingOptions: (acceptResult: boolean) => void,
  shouldReload: boolean
}
const PokerRound: React.FC<PokerRoundProps> = (
  {
    round,
    isUserScrumMaster,
    numberOfPlayers,
    activeRound,
    setShowVotingOptions,
    shouldReload,
    index,
    numberOfRounds,
}) => {
  const dispatch = useAppDispatch();
  const {isError, message, isSuccess} = useAppSelector(state => state.poker);
  const [showApplyEstimate, setShowApplyEstimate] = useState(false);
  const [singleRound, setSingleRound] = useState<RoundWithVotes>({
    id: '',
    storyId: '',
    dateStarted: '',
    dateEnded: '',
    votes: []
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = JSON.parse(localStorage.getItem('user')!).token;
      const response = await fetch(`${getBaseUrl()}/api/planning-pocker/${round.id!}`, {
        method: 'GET',
        headers: {
          'Authorization': `JWT ${token}`
        }
      })

      const json = await response.json();
      setSingleRound(json);
    };
    fetchData();
  }, [shouldReload]);

  const rowCells = useMemo(() => {
    let numberOfVotes = -1;
    if (singleRound.votes) {
      numberOfVotes = singleRound.votes.length;
    }

    if (numberOfVotes < numberOfPlayers && singleRound.dateEnded !== null) {
      return <td className='text-primary' colSpan={numberOfPlayers} style={{ textAlign: "center" }}>
        Ended
      </td>;
    } else if (numberOfVotes !== numberOfPlayers && singleRound.dateEnded == null) {
      return <td className='text-primary' colSpan={numberOfPlayers} style={{textAlign: "center"}}>
        In progress
      </td>;
    }

    const tableData: any[] = [];
    let average = 0;
    singleRound.votes.forEach(vote => {
      tableData.push(<td key={Math.random()}>{vote.value}h</td>);
      average += vote.value;
    })
    tableData.push(<td key={Math.random()}>{average / numberOfPlayers}h</td>)

    return tableData;
  }, [singleRound]);

  const endRoundHandler = () => {
    dispatch(endPlanningPoker(round.id!));
    setShowVotingOptions(false);
    toast.success('Round ended!');
  }

  const applyEstimate = () => {
    dispatch(applyResult(round.id!));
    toast.success('Estimate applied!');
  }

  return (
    <Fragment>
      <tr>
        <td>{singleRound.id}</td>
        {rowCells}
        <td>
          {round.dateEnded === null && isUserScrumMaster && <Button onClick={endRoundHandler} style={{marginRight: '.5rem'}} variant='success'>End round</Button>}
        </td>
      </tr>
      {isUserScrumMaster && showApplyEstimate && round.dateEnded !== null && index === numberOfRounds-1 && <Button onClick={applyEstimate}>Apply estimate</Button>}
    </Fragment>

  );
}

export default PokerRound;
