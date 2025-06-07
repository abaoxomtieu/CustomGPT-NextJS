import { create } from "zustand";

// Define the state shape and actions
type userInfo = {
  id: string;
  name: string;
  email: string;
  picture: string;
  contact_number: string;
  role: string;
  major: string;
};

interface AppState {
  isLogin: boolean;
  setIslogin: (isLogin: boolean) => void;
  userInfo: userInfo | null;
  setUserInfo: (userInfo: userInfo | null) => void;
}

const useAppState = create<AppState>((set) => ({
  isLogin: false,
  setIslogin: (isLogin) => set({ isLogin }),
  userInfo: null,
  setUserInfo: (userInfo) => {
    set({ userInfo });
  },
}));

export default useAppState;
