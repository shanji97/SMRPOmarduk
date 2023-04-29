import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import planningPokerService from "./planningPokerService";
import {PokerRound, RoundWithVotes} from "../../classes/pokerRound";

export interface PlanningPokerState {
  pokerRounds: PokerRound[]
  singleRound: RoundWithVotes
  activeRound: RoundWithVotes
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  message: any
}

const initialState: PlanningPokerState = {
  pokerRounds: [],
  singleRound: {
    id: '',
    storyId: '',
    dateEnded: '',
    dateStarted: '',
    votes: [],
  },
  activeRound: {
    id: '',
    storyId: '',
    dateEnded: '',
    dateStarted: '',
    votes: [],
  },
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
}

export const getAllPokerRounds = createAsyncThunk('poker/getAllRounds', async (storyId: string, thunkAPI: any) => {
  try {
    const token = JSON.parse(localStorage.getItem('user')!).token;
    return await planningPokerService.getAllPokerRounds(storyId, token);
  } catch (error: any) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
});

export const getPokerRound = createAsyncThunk('poker/getRound', async (roundId: string, thunkAPI: any) => {
  try {
    const token = JSON.parse(localStorage.getItem('user')!).token;
    return await planningPokerService.getPokerRound(roundId, token);
  } catch (error: any) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
});

export const getActivePokerRound = createAsyncThunk('poker/getActiveRound', async (storyId: string, thunkAPI: any) => {
  try {
    const token = JSON.parse(localStorage.getItem('user')!).token;
    return await planningPokerService.getActivePokerRound(storyId, token);
  } catch (error: any) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
});

export const newPokerRound = createAsyncThunk('poker/newRound', async (storyId: string, thunkAPI: any) => {
  try {
    const token = JSON.parse(localStorage.getItem('user')!).token;
    return await planningPokerService.newPokerRound(storyId, token);
  } catch (error: any) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
});

export const voteForRound = createAsyncThunk('poker/voteForRound', async (body: {roundId: string, value: number}, thunkAPI: any) => {
  try {
    const token = JSON.parse(localStorage.getItem('user')!).token;
    return await planningPokerService.voteForRound(body, token);
  } catch (error: any) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
});

export const planningPokerSlice = createSlice({
  name: 'poker',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isError = false
      state.isSuccess = false
      state.message = ''
    }
  },
  extraReducers: builder => {
    builder
      .addCase(getAllPokerRounds.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getAllPokerRounds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = '';
        state.pokerRounds = action.payload;
      })
      .addCase(getAllPokerRounds.rejected, (state, action) => {
        state.isLoading = false
        state.isSuccess = false;
        state.isError = true
        state.message = action.payload
      })
      .addCase(getPokerRound.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getPokerRound.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = '';
        state.singleRound = action.payload;
      })
      .addCase(getPokerRound.rejected, (state, action) => {
        state.isLoading = false
        state.isSuccess = false;
        state.isError = true
        state.message = action.payload
      })
      .addCase(getActivePokerRound.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getActivePokerRound.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = '';
        state.activeRound = action.payload;
      })
      .addCase(getActivePokerRound.rejected, (state, action) => {
        state.isLoading = false
        state.isSuccess = false;
        state.isError = true
        state.message = action.payload
      })
      .addCase(newPokerRound.pending, (state) => {
        state.isLoading = true
      })
      .addCase(newPokerRound.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = '';
        // TODO maybe
      })
      .addCase(newPokerRound.rejected, (state, action) => {
        state.isLoading = false
        state.isSuccess = false;
        state.isError = true
        state.message = action.payload
      })
  }
})

export default planningPokerSlice.reducer;
export const {reset} = planningPokerSlice.actions