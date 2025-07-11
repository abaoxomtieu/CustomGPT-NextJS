"use client";
import useAppState from "@/context/state";
import { getCookie } from "@/helpers/Cookies";
import { useUserInfo, useInvalidateAuth } from "./use-query-auth";
import { useEffect } from "react";

export const useAuth = () => {
  const { isLogin, setIslogin, userInfo, setUserInfo } = useAppState();
  const { invalidateUserInfo, removeUserInfo } = useInvalidateAuth();

  // Sử dụng react-query để fetch user info
  const {
    data: queryUserData,
    isLoading,
    error,
    isSuccess,
    isError,
  } = useUserInfo();

  // Sync zustand state với react-query data
  useEffect(() => {
    if (isSuccess && queryUserData?.user) {
      setUserInfo(queryUserData.user);
      setIslogin(true);
    } else if (isError || !getCookie("token")) {
      setUserInfo(null);
      setIslogin(false);
    }
  }, [isSuccess, isError, queryUserData, setUserInfo, setIslogin]);

  // Manual fetch function để force refresh (ví dụ sau khi login)
  const fetchUserInfo = async () => {
    // Invalidate query để trigger refetch
    invalidateUserInfo();
  };

  // Logout function để clear cache
  const logout = () => {
    removeUserInfo();
    setUserInfo(null);
    setIslogin(false);
  };

  return {
    isLogin,
    userInfo: userInfo || queryUserData?.user || null,
    fetchUserInfo,
    isLoading,
    setUserInfo,
    logout,
    error,
  };
};
