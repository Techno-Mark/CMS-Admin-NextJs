import { getToken } from "@/utils/getToken";
import axios from "axios";
import { toast } from "react-toastify";

export const callAPIwithoutHeaders = async (
    pathName: string,
    method: "get" | "post",
    successCallback: (
        status: boolean,
        message: string,
        data: any,
        headers: any
    ) => void,
    params: Object
) => {
    let response;
    const url = new URL(process.env.NEXT_PUBLIC_API_URL!);
    url.pathname = pathName;

    try {
        if (method === "get") {
            response = await axios.get(url.toString());
        } else if (method === "post") {
            response = await axios.post(url.toString(), params);
        } else {
            throw new Error(
                "Unsupported HTTP method. Only GET and POST are supported."
            );
        }

        const { status, data, message } = response.data;
        successCallback(status, message, data, response.headers);
    } catch (error: any) {
        if (!!error.response) {
            switch (error.response.status) {
                case 400:
                    toast.error("Bad Request, please check your payload.");
                    return;
                case 401:
                    toast.error("Invalid or Expired Token.");
                    return;
            }
        }

        successCallback(
            false,
            `Something went wrong, please refer console for more details.`,
            undefined,
            undefined
        );
        console.error(error.message);
    }
};

export const callAPIwithHeaders = async (
    pathName: string,
    method: "get" | "post",
    successCallback: (
        status: boolean,
        message: string,
        data: any,
        headers: any
    ) => void,
    params: Object,
    headerIfAny?: any
) => {
    let response;
    const url = new URL(process.env.NEXT_PUBLIC_API_URL!);
    url.pathname = pathName;

    try {
        if (method === "get") {
            response = await axios.get(url.toString(), {
                headers: {
                    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJOYW1lIjoiQ01TX0FETUlOIiwiZW1haWwiOiJjbXNfYWRtaW5AeW9wbWFpbC5jb20iLCJpc1N1cGVyQWRtaW4iOnRydWUsInJvbGVJZCI6MSwiaWF0IjoxNzE4NjIyNTk3LCJleHAiOjE3MTg3MDg5OTd9.TUgOBmDcWu95FZ_vJJf5nX4eGNonOK8SL1WGXdo_xaU`,
                    ...headerIfAny,
                },
            });
        } else if (method === "post") {
            response = await axios.post(url.toString(), params, {
                headers: {
                    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJOYW1lIjoiQ01TX0FETUlOIiwiZW1haWwiOiJjbXNfYWRtaW5AeW9wbWFpbC5jb20iLCJpc1N1cGVyQWRtaW4iOnRydWUsInJvbGVJZCI6MSwiaWF0IjoxNzE4NjIyNTk3LCJleHAiOjE3MTg3MDg5OTd9.TUgOBmDcWu95FZ_vJJf5nX4eGNonOK8SL1WGXdo_xaU`,
                    ...headerIfAny,
                },
            });
        } else {
            throw new Error(
                "Unsupported HTTP method. Only GET and POST are supported."
            );
        }

        const { status, data, message } = response.data;
        successCallback(status === "success" ? true : false, message, data, response.headers);
    } catch (error: any) {
        if (!!error.response) {
            console.log(error.response);

            switch (error.response.status) {
                case 400:
                    toast.error("Bad Request, please check your payload.");
                    return;
                case 401:
                    toast.error("Invalid or Expired Token.");
                    return;
            }
        }

        successCallback(
            false,
            `Something went wrong, please refer console for more details.`,
            undefined,
            undefined
        );
        console.error(error.message);
    }
};