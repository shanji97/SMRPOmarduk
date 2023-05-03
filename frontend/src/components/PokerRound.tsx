import React, {Fragment, useEffect, useMemo, useState} from "react";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {getBaseUrl} from "../helpers/helpers";
import {Round, RoundWithVotes} from "../classes/round";
import {Button} from "react-bootstrap";
import {Check, X} from "react-bootstrap-icons";
import {endPlanningPoker, reset} from "../features/planningPoker/planningPokerSlice";
import {toast} from "react-toastify";
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
  const [resultSubmited, setResultSubmited] = useState(false);
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

  const roundEndedAndScrumMaster = useMemo(() => {
    return isUserScrumMaster && singleRound.votes.length === numberOfPlayers;
  }, [singleRound]);

  const rowCells = useMemo(() => {
    console.log(singleRound);
    let numberOfVotes = -1;
    if (singleRound.votes) {
      numberOfVotes = singleRound.votes.length;
    }
    if (roundEndedAndScrumMaster) {
      return singleRound.votes.map(vote => {
        return <td key={Math.random()}>{vote.value}h</td>;
      });
    } else if (numberOfVotes < numberOfPlayers && singleRound.dateEnded !== null) {
      return <td className='text-primary' colSpan={numberOfPlayers} style={{ textAlign: "center" }}>
        Ended
      </td>;
    } else if (numberOfVotes !== numberOfPlayers && singleRound.dateEnded == null) {
      return <td className='text-primary' colSpan={numberOfPlayers} style={{textAlign: "center"}}>
        In progress
      </td>;
    }

    return singleRound.votes.map(vote => {
      return <td key={Math.random()}>{vote.value}h</td>;
    });
  }, [singleRound]);

  const endRoundHandler = () => {
    dispatch(endPlanningPoker(round.id!));
    setResultSubmited(true);
    setShowVotingOptions(false);
    toast.success('Round ended!');
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
      {isUserScrumMaster && round.dateEnded !== null && index === numberOfRounds-1 && <Button>Apply estimate</Button>}
    </Fragment>

  );
}

export default PokerRound;
