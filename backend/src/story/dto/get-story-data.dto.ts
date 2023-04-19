export class StoryDto {
    id: number;
    projectId: number;
    sequenceNumber: number;
    title: string;
    description: string;
    priority: number;
    businessValue: number;
    category: number;
    timeComplexity: number;
    isRealized: boolean;
    tests: {
        id: number;
        description: string;
    }[];
    sprintStories: {
        sprintId: number;
    }[];
}
