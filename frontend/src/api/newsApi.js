import axiosClient from "./axiosClient";

export const newsApi = {
  getMilitaryNews: (category = "") => {
    return axiosClient.get(`/news${category ? `?category=${category}` : ""}`);
  },
};
