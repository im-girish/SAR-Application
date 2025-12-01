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
    } catch (err) {
      console.error("Error fetching news:", err);
      setError("Failed to load military news from API");
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-400" />
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
        <p className="mt-2 text-sm text-emerald-100/80 max-w-2xl">
          Latest updates on military operations, defence technology and armed
          forces worldwide.
        </p>
      </div>

      {error && (
        <div className="glass-card border border-red-500/60 text-red-200 px-4 py-3">
          {error}
        </div>
      )}

      <div
        className="glass-card p-6 translate-y-3 opacity-0"
        style={{ animation: "slideInUp 0.7s ease-out forwards" }}
      >
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
          <div className="space-y-5">
            {news.map((item, index) => (
              <article
                key={index}
                className="rounded-2xl border border-emerald-500/40 bg-slate-950/85 px-5 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.85)]"
              >
                <div className="flex gap-4">
                  <div className="mt-2 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.9)]" />
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-semibold text-emerald-50 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-emerald-100/80 mb-2">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap justify-between items-center text-xs text-emerald-200/80 gap-2">
                      <span>Source: {item.source || "Unknown"}</span>
                      <span>
                        {item.pubDate
                          ? new Date(item.pubDate).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-sm text-emerald-300 hover:text-emerald-100"
                      >
                        Open full report →
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicNewsPage;
