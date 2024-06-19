import Cookies from "js-cookie";

export const getToken = () => {
    return JSON.parse(Cookies.get("token")!);
};