export interface Round {
  id?: string,
  storyId: string,
  dateStarted: string,
  dateEnded: string | null
}

export interface RoundWithVotes {
  id?: string,
  storyId: string,
  dateStarted: string,
  dateEnded: string | null,
  votes: Vote[]
}

export interface Vote {
  roundId: string,
  userId: string,
  dateCreated: string,
  dateUpdated: string,
  value: number
}
