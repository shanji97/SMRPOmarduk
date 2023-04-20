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

