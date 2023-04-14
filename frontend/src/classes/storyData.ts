export interface StoryData {
    id?:       string,
    title:  string,
    description:  string,
    tests: string[],
    priority:  number,
    businessValue:     number,
    sequenceNumber: number,
    projectID: any,
    userId: number
}