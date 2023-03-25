export interface Member {
    userId: string,
    role: number,
}

export interface ProjectData {
    id?:       string,
    projectName: string,
    members:  Member[]

}