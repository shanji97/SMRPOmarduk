export interface UserData {
    id?:       string,
    username:  string,
    password:  string,
    firstName: string,
    lastName:  string,
    email:     string,
    isAdmin:   boolean,
}

export interface UserDataEdit {
    id?:           string,
    username?:     string,
    password?:     string,
    passwordOld?:  string,
    firstName?:    string,
    lastName?:     string,
    email?:        string,
    isAdmin?:      boolean,
}

export interface LoginData {
    username: string,
    password: string,
}
