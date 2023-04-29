import axios from "axios";
import { getBaseUrl } from "../../helpers/helpers";


const PLANNING_POKER_API_URL = `${getBaseUrl()}/api/planning-pocker`;

const getAllPokerRounds = async (storyId: string, token: string) => {
  const config = {
    headers: {
      Authorization: `JWT ${token}`
    }
  }
  const response = await axios.get(`${PLANNING_POKER_API_URL}/story/${storyId}`, config);

  return response.data;
}

const getPokerRound = async (roundId: string, token: string) => {
  const config = {
    headers: {
      Authorization: `JWT ${token}`
    }
  }
  const response = await axios.get(`${PLANNING_POKER_API_URL}/${roundId}`, config);

  return response.data;
}

const getActivePokerRound = async (storyId: string, token: string) => {
  const config = {
    headers: {
      Authorization: `JWT ${token}`
    }
  }
  const response = await axios.get(`${PLANNING_POKER_API_URL}/story/${storyId}/active`, config);

  return response.data;
}

const newPokerRound = async (storyId: string, token: string) => {
  const config = {
    headers: {
      Authorization: `JWT ${token}`
    }
  }
  const response = await axios.post(`${PLANNING_POKER_API_URL}/${storyId}`, {}, config);

  return response.data;
}

const endPlanningPoker = async (body: {roundId: string, acceptResult: boolean}, token: string) => {
  const config = {
    headers: {
      Authorization: `JWT ${token}`
    }
  }
  const response = await axios.post(`${PLANNING_POKER_API_URL}/${body.roundId}/end/${body.acceptResult}`, {}, config);

  return response.data;
}

const getVoteForRound = async (roundId: string, token: string) => {
  const config = {
    headers: {
      Authorization: `JWT ${token}`
    }
  }
  const response = await axios.get(`${PLANNING_POKER_API_URL}/${roundId}/vote`, config);

  return response.data;
}

const voteForRound = async (body: {roundId: string, value: number}, token: string) => {
  const config = {
    headers: {
      Authorization: `JWT ${token}`
    }
  }
  const response = await axios.post(`${PLANNING_POKER_API_URL}/${body.roundId}/vote/${body.value}`, {}, config);

  return response.data;
}


const planningPokerService = {
  getAllPokerRounds,
  getPokerRound,
  getActivePokerRound,
  newPokerRound,
  endPlanningPoker,
  getVoteForRound,
  voteForRound,
}

export default planningPokerService;
