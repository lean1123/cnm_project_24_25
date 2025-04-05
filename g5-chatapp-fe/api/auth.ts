import api from "@/api/api"
import { DataLogin, DataRegister } from "@/types";
import Cookies from "js-cookie";

export const login = async (dataLogin: DataLogin) => {
    try {
        const {data} = await api.post("/auth/sign-in", dataLogin);
        console.log("Login response:", data);
        Cookies.set("accessToken", data.data.token, { expires: 1, secure: true, sameSite: "Strict" });
        return data.data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
}

export const register = async (dataRegister: DataRegister) => {
    try {
        const {data} = await api.post("/auth/sign-up", dataRegister);
        Cookies.set("accessToken", data.data.token, { expires: 1, secure: true, sameSite: "Strict" });
        return data.data;
    } catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
}

export const myProfile = async (_id: string) => {
    try {
        const {data} = await api.get(`/users/${_id}`);
        return data.data;
    } catch (error) {
        console.error("Profile fetch error:", error);
        throw error;
    }
}

export const logout = async () => {
    try {
        // await api.post("/auth/logout", {});
        Cookies.remove("accessToken");
        window.location.href = "/login";
    } catch (error) {
        console.error("Logout error:", error);
        throw error;
    }
}