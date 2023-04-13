export interface SprintData {
    name: string,
    velocity: number,
}

export interface SprintBody {
    projectId: string,
    name: string,
    velocity: number,
    startDate: string,
    endDate: string,
}

export interface DateRangeSpecs {
    startDate: Date,
    endDate: Date,
    key: string,
    selection?: any
}