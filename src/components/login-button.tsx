"use client";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { login } from "@/services/account";
import { setCookie } from "@/helpers/Cookies";
import { useAuth } from "@/hooks/use-auth";
import useAppState from "@/context/state";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LoginButtonProps {
  className?: string;
}

export const LoginButton = ({ className }: LoginButtonProps) => {
  const router = useRouter();
  const setUserInfo = useAppState((state) => state.setUserInfo);
  const setIslogin = useAppState((state) => state.setIslogin);
  const { fetchUserInfo, isLogin, isLoading } = useAuth();

  const loginFunction = (credentialResponse: CredentialResponse): void => {
    const apiLogin = async () => {
      try {
        const response = await login({
          credential: credentialResponse.credential,
        });
        if (response.status === 200) {
          toast.success("Login success", {
            description: "Login success",
          });
          setIslogin(true);
          setCookie("token", response.data.token, 30);
          if (response.data.user_data === null) {
            toast.error("Login failed", {
              description: "Login failed",
            });
          }
          if (response.data.user_data) {
            setUserInfo(response.data.user_data);
            await fetchUserInfo(); // Fetch fresh user info after login
            if (response.data.first_login) {
              router.push("/profile");
            } else {
              router.push("/");
            }
          }
        } else {
          toast.error("Login failed", {
            description: "Login failed",
          });
        }
      } catch (error) {
        toast.error("Login failed", {
          description: "Login failed",
        });
      }
    };
    apiLogin();
  };

  return (
    <>
      <div className={className}>
        <GoogleLogin
          shape="pill"
          text="signin"
          onSuccess={loginFunction}
          useOneTap={isLoading && isLogin}
          width={100}
          onError={() => {
            toast.error("Login failed", {
              description: "Login failed",
            });
          }}
        />
      </div>
    </>
  );
};
