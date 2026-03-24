import React, { useState, useEffect } from "react";
import { newsApi } from "../api/newsApi";
import indiaFlag from "../assets/India.jpeg";

const tabs = [
  { label: "All News", value: "", icon: "📰" },
  { label: "India News", value: "india", icon: "🇮🇳" },
  { label: "Tribute & Achievements", value: "tribute", icon: "🪖" },
];

const PublicNewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    fetchNews(activeTab);
  }, [activeTab]);

  const fetchNews = async (category) => {
    setLoading(true);
    setError("");

    try {
      const response = await newsApi.getMilitaryNews(category);

      const rawArticles = Array.isArray(response.data?.data?.results)
        ? response.data.data.results
        : [];

      setNews(rawArticles);

      if (!response.data?.success && rawArticles.length === 0) {
        setError("Failed to load news");
      }
    } catch (err) {
      console.error("Error fetching news:", err);
      setError("Failed to load news");
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
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

      {/* 🔥 TABS WITH ICONS + FLAG */}
      <div className="flex gap-3 flex-wrap items-center">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${
              activeTab === tab.value
                ? "bg-emerald-500/30 text-emerald-50 shadow-[0_0_15px_rgba(16,185,129,0.9)]"
                : "bg-slate-800 text-emerald-200 hover:bg-emerald-500/20"
            }`}
          >
            {/* ICON */}
            <span className="text-base">
              {tab.value === "tribute" ? "🪖" : tab.icon}
            </span>

            {/* 🇮🇳 FLAG */}
            {(tab.value === "india" || tab.value === "tribute") && (
              <img
                src={indiaFlag}
                alt="India"
                className={`rounded-full border border-emerald-400 ${
                  activeTab === tab.value
                    ? "w-6 h-6 shadow-[0_0_10px_rgba(16,185,129,1)]"
                    : "w-5 h-5"
                }`}
              />
            )}

            {tab.label}
          </button>
        ))}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-400" />
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="glass-card border border-red-500/60 text-red-200 px-4 py-3">
          {error}
        </div>
      )}

      {/* NEWS LIST */}
      {!loading && (
        <div className="glass-card p-6">
          {news.length === 0 ? (
            <div className="text-center py-8 text-emerald-100/80">
              No news available.
            </div>
          ) : (
            <div className="space-y-5">
              {news.map((item, index) => (
                <article
                  key={index}
                  className="rounded-2xl border border-emerald-500/40 bg-slate-950/85 px-5 py-4"
                >
                  <h3 className="text-lg font-semibold text-emerald-50">
                    {item.title}
                  </h3>

                  <p className="text-sm text-emerald-100/80">
                    {item.description}
                  </p>

                  {/* 🔥 TYPE BADGE WITH ICON */}
                  {item.type && (
                    <span className="inline-flex items-center gap-1 mt-2 text-xs px-2 py-1 rounded bg-lime-500/20 text-lime-300">
                      {item.type === "tribute" && "🪖"}
                      {item.type === "achievement" && "🚀"}
                      {item.type === "award" && "🎖"}
                      {item.type === "operation" && "⚔️"}

                      {item.type.toUpperCase()}
                    </span>
                  )}

                  <div className="flex justify-between text-xs mt-2 text-emerald-200/70">
                    <span>{item.source || "Unknown"}</span>
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
                      rel="noreferrer"
                      className="text-emerald-300 text-sm mt-2 inline-block"
                    >
                      Open full report →
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicNewsPage;
