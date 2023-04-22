export interface Test {
    id: string,
    description: string,
    storyId: string,
    isRealized: boolean
}

export interface StoryData {
    id?:       string,
    title:  string,
    description:  string,
    tests: string[],
    priority:  number,
    businessValue:     number,
    sequenceNumber: number,
    projectID?: any,
    userId?: number
}

export interface StoryDataOfProject {
    id?:       string,
    title:  string,
    description:  string,
    tests: Test[],
    priority:  number,
    businessValue:     number,
    sequenceNumber: number,
    projectID?: any,
    userId?: number,
    isRealized: boolean,
}

export enum SprintBacklogItemStatus {
    UNALLOCATED = 'Unallocated',
    ALLOCATED = 'Allocated',
    IN_PROGRESS = 'In Progress',
    DONE = 'Done',
  }

export enum ProductBacklogItemStatus {
    UNALLOCATED = 'Unallocated',
    ALLOCATED = 'Allocated',
    DONE = 'Done',
}

