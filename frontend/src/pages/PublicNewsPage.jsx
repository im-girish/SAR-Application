// D:\SAR-APP\frontend\src\pages\PublicNewsPage.jsx
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
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="section-label">Intel Feed</p>
        <h1 className="text-4xl font-extrabold text-lime-200">
          Military & Defense News
        </h1>
        <p className="mt-2 text-sm text-emerald-100/80">
          Latest updates on military operations, defence technology and armed
          forces.
        </p>
      </div>

      {error && (
        <div className="glass-card border border-red-500/60 text-red-200 px-4 py-3">
          {error}
        </div>
      )}

      <div className="glass-card p-6">
        {news.length === 0 ? (
          <div className="text-center py-8 text-emerald-100/80">
            <p>No military news available at the moment.</p>
            <p className="text-xs mt-2 text-emerald-200/70">
              {error
                ? "API connection failed. Please try again later."
                : "No defence-related news found in current feed."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {news.map((item, index) => (
              <div
                key={index}
                className="border-b border-emerald-500/20 pb-5 last:border-b-0 last:pb-0"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-2 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.9)]" />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-emerald-50 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-emerald-100/80 mb-2">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap justify-between items-center text-xs text-emerald-200/80 gap-2">
                      <span className="pill">
                        Source: {item.source || "Unknown"}
                      </span>
                      <span>{new Date(item.pubDate).toLocaleDateString()}</span>
                    </div>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-300 hover:text-emerald-100 text-sm mt-2 inline-block"
                      >
                        Open full report →
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
