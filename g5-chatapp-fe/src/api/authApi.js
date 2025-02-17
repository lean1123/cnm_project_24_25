import AdminAxiosClient from "./axiosClient";

const AuthApi = {
  login: () => {
    return AdminAxiosClient.post("", {});
  },
  refreshToken: () => {
    return AdminAxiosClient.post("", {});
  },
};

export default AuthApi;
