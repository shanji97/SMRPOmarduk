import axios from "axios";
import { LoginData, UserData } from "../../../classes/userData";

const AUTH_API_URL = 'http://localhost:3000/api/auth';
const USERS_API_URL = 'http://localhost:3000/api/user';

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

const getAllUsers = async () => {
    const response = await axios.get(`${USERS_API_URL}`);

    return response.data;
}

const deleteUser = async (userId: string) => {
    const response = await axios.delete(`${USERS_API_URL}/${userId}`);

    return response.data;
}

const userService = {
    login,
    create,
    getAllUsers,
    deleteUser,
}

export default userService;
