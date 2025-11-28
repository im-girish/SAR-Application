import axios from "axios";
import { successResponse, errorResponse } from "../utils/response.util.js";
import config from "../config/env.js";

export const getMilitaryNews = async (req, res) => {
  try {
    // Multiple API calls for different military aspects
    const militaryQueries = [
      "military",
      "defense army",
      "navy warship",
      "air force",
      "soldier troops",
      "defence ministry",
    ];

    let allResults = [];

    // Make multiple API calls for comprehensive coverage
    for (const query of militaryQueries) {
      try {
        const response = await axios.get(config.news.baseUrl, {
          params: {
            apikey: config.news.apiKey,
            q: query,
            language: "en",
            size: 5,
          },
        });

        if (response.data.results) {
          allResults = [...allResults, ...response.data.results];
        }
      } catch (err) {
        console.error(`Error fetching news for query "${query}":`, err.message);
      }
    }

    // Remove duplicates based on title
    const uniqueResults = allResults.filter(
      (article, index, self) =>
        index === self.findIndex((a) => a.title === article.title)
    );

    return successResponse(res, {
      status: "success",
      totalResults: uniqueResults.length,
      results: uniqueResults,
    });
  } catch (error) {
    console.error("News API error:", error.response?.data || error.message);

    return successResponse(res, {
      status: "success",
      totalResults: 0,
      results: [],
    });
  }
};
