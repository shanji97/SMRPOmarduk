export interface UserRole {
    userId: number,
    role: number
}

export interface ProjectData {
    id?:       string,
    projectName: string,
    projectDescription: string,
    userRoles: UserRole[],
}

export interface ProjectDataEdit {
    id?:       string,
    projectName: string,
    projectDescription: string,
    userId: string
}

