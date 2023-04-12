export interface UserRoles {
    userId: string,
    role: number[]
}

export interface ProjectData {
    id?:       string,
    projectName: string,
    projectDescription: string,
    userRoles: UserRoles[],
}