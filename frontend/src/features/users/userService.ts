import axios from "axios";
import { LoginData, UserData } from "../../../classes/userData";


const AUTH_API_URL = '/api/auth/';
const USERS_API_URL = '/api/user/';

const login = async (userData: LoginData) => {
    const response = await axios.post(`${AUTH_API_URL}/login`, userData);

    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
}

const create = async (userData: UserData) => {
    const response = await axios.post(`${USERS_API_URL}`, userData);

    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
}

const userService = {
    login,
    create,
}

export default userService;
