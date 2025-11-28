import axiosClient from "./axiosClient";

export const newsApi = {
  getMilitaryNews: () => {
    return axiosClient.get("/news");
  },
};
