import React, {useEffect, useMemo, useState} from "react";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {getBaseUrl} from "../helpers/helpers";
import {RoundWithVotes} from "../classes/pokerRound";
import {Button} from "react-bootstrap";
import {Check, X} from "react-bootstrap-icons";
import {endPlanningPoker, reset} from "../features/planningPoker/planningPokerSlice";
import {toast} from "react-toastify";
interface PokerRoundProps {
  roundId: string,
  isUserScrumMaster: boolean,
  numberOfPlayers: number
  roundActive: boolean
}
const PokerRound: React.FC<PokerRoundProps> = ({roundId, isUserScrumMaster, numberOfPlayers, roundActive}) => {
  const dispatch = useAppDispatch();
  const {isError, message, isSuccess} = useAppSelector(state => state.poker);
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
      const response = await fetch(`${getBaseUrl()}/api/planning-pocker/${roundId}`, {
        method: 'GET',
        headers: {
          'Authorization': `JWT ${token}`
        }
      })

      const json = await response.json();
      setSingleRound(json);
    };
    fetchData();
  }, []);

  const roundEndedAndScrumMaster = useMemo(() => {
    return isUserScrumMaster && singleRound.votes.length === numberOfPlayers;
  }, [singleRound]);

  const rowCells = useMemo(() => {
    let numberOfVotes = -1;
    if (singleRound.votes) {
      numberOfVotes = singleRound.votes.length;
    }
    if (roundEndedAndScrumMaster) {
      return singleRound.votes.map(vote => {
        return <td key={Math.random()}>{vote.value}</td>;
      });
    } else if (numberOfVotes !== numberOfPlayers) {
      return [];
    }

    return singleRound.votes.map(vote => {
      return <td key={Math.random()}>{vote.value}</td>;
    });
  }, [singleRound]);

  const acceptRoundHandler = () => {
    const body = {
      roundId,
      acceptResult: true
    }
    dispatch(endPlanningPoker(body));
    toast.success('Result accepted!');
  }

  const rejectRoundHandler = () => {
    const body = {
      roundId,
      acceptResult: false
    }
    dispatch(endPlanningPoker(body));
    toast.success('Result rejected!');
  }

  return (
    <tr>
      <td>{singleRound.id}</td>
      {rowCells}
      {roundEndedAndScrumMaster && roundActive && (
        <td>
          <Button onClick={acceptRoundHandler} style={{marginRight: '.5rem'}} variant='success'><Check size={20} /></Button>
          <Button onClick={rejectRoundHandler} variant='danger'><X size={20}/></Button>
        </td>
      )}
    </tr>
  );
}

export default PokerRound;
