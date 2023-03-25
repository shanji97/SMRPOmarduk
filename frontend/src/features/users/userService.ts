import axios from "axios";
import { LoginData, UserData, UserDataEdit } from "../../classes/userData";

const AUTH_API_URL = 'http://localhost:3000/api/auth';
const USERS_API_URL = 'http://localhost:3000/api/user';
const COMMON_PASSWORD_API_URL = 'http://localhost:3000/api/common-password';
const USER_LOGIN_URL = 'http://localhost:3000/api/user-login';


const login = async (userData: LoginData) => {
    const response = await axios.post(`${AUTH_API_URL}/login`, userData);

    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
}

const create = async (userData: UserData, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const response = await axios.post(`${USERS_API_URL}`, userData, config);

    return response.data;
}

const editUser = async (userData: UserDataEdit, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }

    const response = await axios.patch(`${USERS_API_URL}/${userData.id}`, userData, config);

    return response.data;
}

const logout = async () => {
    localStorage.removeItem('user');
}

const getAllUsers = async (token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }
    const response = await axios.get(`${USERS_API_URL}`, config);

    return response.data;
}

const deleteUser = async (userId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }
    const response = await axios.delete(`${USERS_API_URL}/${userId}`, config);

    return response.data;
}

const commonPassword = async (password: {password: string}, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }
    const response = await axios.post(COMMON_PASSWORD_API_URL, password, config);

    return response.data;
}

const setUp2FA = async (userId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }
    const response = await axios.post(`${USERS_API_URL}/${userId}/2fa`, {}, config);
    return response.data;
}

const getLastLogin = async (userId: string, token: string) => {
    const config = {
        headers: {
            Authorization: `JWT ${token}`
        }
    }
    const response = await axios.get(`${USER_LOGIN_URL}/${userId}/last`, config);
    return response.data;
}

const userService = {
    login,
    create,
    getAllUsers,
    deleteUser,
    logout,
    editUser,
    commonPassword,
    setUp2FA,
    getLastLogin,
}

export default userService;