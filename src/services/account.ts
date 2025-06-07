import axios from "axios";
import { getCookie } from "../helpers/Cookies";
import { ApiDomain } from "@/constant";

export const login = async (
  payload: object
): Promise<{
  data: {
    token: string;
    user_data: {
      id: string;
      name: string;
      email: string;
      picture: string;
      contact_number: string;
      role: string;
      major: string;
    } | null;
    first_login: boolean;
  };
  status: number;
}> => {
  const { data, status } = await axios.post(ApiDomain + `/auth/login`, payload);
  return { data, status };
};

export const register = async (payload: {
  name: string;
  email: string;
  contact_number: string;
  password: string;
}): Promise<{
  data: {
    message: string;
    user_data: {
      email: string;
      name: string;
      contact_number: string;
    } | null;
  };
  status: number;
}> => {
  const { data, status } = await axios.post(
    ApiDomain + `/auth/register`,
    payload
  );
  return { data, status };
};

export const loginWithPassword = async (payload: {
  username: string;
  password: string;
}): Promise<{
  data: {
    token: string;
    user_data: {
      id: string;
      email: string;
      name: string;
      role: string;
      picture: string;
      contact_number: string;
      bank_number: string;
    } | null;
  };
  status: number;
}> => {
  const { data, status } = await axios.post(
    ApiDomain + `/auth/login-password`,
    payload
  );
  return { data, status };
};

export const getUserInfo = async () => {
  const token = getCookie("token");
  return axios.get(`${ApiDomain}/auth/get_info`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const logout = async () => {
  const token = getCookie("token");
  return axios.post(
    `${ApiDomain}/auth/logout`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const updateUser = async (userId: string, userData: {
  name?: string;
  contact_number?: string;
  major?: string;
}) => {
  const token = getCookie("token");
  return axios.put(
    `${ApiDomain}/auth/users`,
    userData,
    {
      params: { user_id: userId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
