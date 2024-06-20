import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  return await response.json();
};

export const fetchData = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  try {
    const session = await getSession();
    console.log(session?.user.token);

    if (!session || !session?.user) {
      throw new Error("No session or access token found");
    }

    const response = await fetch(`${API_URL}/${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.user.token}`,
        ...options.headers,
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const get = (endpoint: string) => fetchData(endpoint);

export const post = (endpoint: string, data: any) =>
  fetchData(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const put = (endpoint: string, data: any) =>
  fetchData(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const del = (endpoint: string) =>
  fetchData(endpoint, {
    method: "DELETE",
  });
