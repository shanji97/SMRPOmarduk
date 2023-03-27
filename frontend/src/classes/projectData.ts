export interface Member {
    userId: string,
    role: number[]
}

export interface ProjectData {
    id?:       string,
    projectName: string,
    projectDescription: string,
    members: Member[],
}