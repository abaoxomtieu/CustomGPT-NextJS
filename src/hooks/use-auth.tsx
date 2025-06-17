"use client";
import useAppState from "@/context/state";
import { getCookie } from "@/helpers/Cookies";
import { getUserInfo } from "@/services/account";
import { useEffect, useState, useRef } from "react";

export const useAuth = () => {
  const { isLogin, setIslogin, userInfo, setUserInfo } = useAppState();
  const [isLoading, setIsLoading] = useState(true); // Bắt đầu với true
  const hasFetched = useRef(false);

  const fetchUserInfo = async () => {
    const token = getCookie("token");

    try {
      setIsLoading(true);

      if (!token) {
        setIslogin(false);
        setUserInfo(null);
        setIsLoading(false);
        return;
      }
      if (isLogin && userInfo) {
        setIsLoading(false);
        return;
      }

      const response = await getUserInfo();
      if (response.status === 200) {
        setUserInfo(response.data.user);
        setIslogin(true);
      } else {
        setIslogin(false);
        setUserInfo(null);
      }
    } catch (error) {
      setIslogin(false);
      setUserInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      fetchUserInfo();
      hasFetched.current = true;
    }
  }, []);

  return {
    isLogin,
    userInfo,
    fetchUserInfo,
    isLoading,
    setUserInfo,
  };
};
