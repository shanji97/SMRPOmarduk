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
  shouldReload: boolean,
  updateTimeComplexities: (newComplexities: any) => void
  itemTime: any,
  refreshRounds: () => void
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
    itemTime,
    updateTimeComplexities,
    refreshRounds
}) => {
  const dispatch = useAppDispatch();
  const [singleRound, setSingleRound] = useState<RoundWithVotes>({
    id: '',
    storyId: '',
    dateStarted: '',
    dateEnded: '',
    votes: []
  });
  const [average, setAverage] = useState(0);
  const [estimateApplied, setEstimateApplied] = useState(false);

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
    setAverage(average / numberOfPlayers);
    return tableData;
  }, [singleRound]);

  const endRoundHandler = () => {
    dispatch(endPlanningPoker(round.id!));
    setShowVotingOptions(false);
    setTimeout(() => {
      refreshRounds();
    }, 500)
    toast.success('Round ended!');
  }

  const applyEstimate = () => {
    dispatch(applyResult(round.id!));
    const newComplexities = {...itemTime};
    newComplexities[singleRound.storyId!] = average;
    updateTimeComplexities(newComplexities);
    setEstimateApplied(true);
    toast.success('Estimate applied!');
  }

  return (
    <Fragment>
      <tr>
        <td>{index+1}</td>
        {rowCells}
        <td>
          {round.dateEnded === null && isUserScrumMaster && <Button onClick={endRoundHandler} style={{marginRight: '.5rem'}} variant='success'>End round</Button>}
        </td>
      </tr>
      {isUserScrumMaster && round.dateEnded !== null && index === numberOfRounds-1 && <Button onClick={applyEstimate} disabled={estimateApplied}>Apply estimate</Button>}
    </Fragment>

  );
}

export default PokerRound;
