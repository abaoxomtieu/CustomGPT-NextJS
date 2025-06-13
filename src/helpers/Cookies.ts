import Cookies from "js-cookie";

export const setCookie = (name: string, value: string, days: number) => {
  Cookies.set(name, value, { expires: days });
};

export const getCookie = (name: string) => {
  return Cookies.get(name);
};

export const deleteCookie = (name: string) => {
  Cookies.remove(name);
};

export const generateMongoId = () => {
  let id = "";
  const hex = "0123456789abcdef";
  for (let i = 0; i < 24; i++) {
    id += hex[Math.floor(Math.random() * 16)];
  }
  return id;
};
