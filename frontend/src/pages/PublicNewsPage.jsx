import React, { useState, useEffect } from "react";
import { newsApi } from "../api/newsApi";

const PublicNewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await newsApi.getMilitaryNews();

      // Additional client-side filtering for safety
      const militaryKeywords = [
        "military",
        "defense",
        "defence",
        "army",
        "navy",
        "air force",
        "airforce",
        "soldier",
        "troops",
        "warfare",
        "battalion",
        "regiment",
        "special forces",
        "border security",
        "armed forces",
        "military exercise",
        "combat",
      ];

      const filteredNews = response.data.results.filter((article) => {
        const title = article.title?.toLowerCase() || "";
        const description = article.description?.toLowerCase() || "";

        const combinedText = `${title} ${description}`;

        return militaryKeywords.some((keyword) =>
          combinedText.includes(keyword.toLowerCase())
        );
      });

      setNews(filteredNews);
    } catch (error) {
      console.error("Error fetching news:", error);
      setError("Failed to load military news from API");
      setNews([]); // Empty array if API fails
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Military & Defense News
      </h1>
      <p className="text-gray-600 mb-6">
        Latest updates on military operations, defense technology, and armed
        forces
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        {news.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No military news available at the moment.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {error
                ? "API connection failed. Please try again later."
                : "No defense-related news found in current feed."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {news.map((item, index) => (
              <div
                key={index}
                className="border-b pb-6 last:border-b-0 hover:bg-gray-50 -mx-4 px-4 rounded"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{item.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span className="font-medium text-red-600">
                        {item.source}
                      </span>
                      <span>{new Date(item.pubDate).toLocaleDateString()}</span>
                    </div>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 text-sm mt-2 inline-block"
                      >
                        Read full defense report →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicNewsPage;
