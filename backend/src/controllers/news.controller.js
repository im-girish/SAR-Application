import axios from "axios";
import { successResponse } from "../utils/response.util.js";
import config from "../config/env.js";

export const getMilitaryNews = async (req, res) => {
  try {
    const { category } = req.query;

    let queries = [];

    // 🔥 CATEGORY BASED QUERIES
    if (category === "tribute") {
      queries = [
        "Indian army martyr tribute",
        "soldier death anniversary India",
        "army hero tribute India",
        "martyr remembrance India",
        "Kargil war hero tribute",

        "Param Vir Chakra award India",
        "Ashoka Chakra award India",
        "military bravery award India",
        "Indian army gallantry awards",

        "Indian army achievement",
        "successful military operation India",
        "Indian air force operation success",
        "Indian navy mission success",

        "DRDO achievement India",
        "missile test India defence",
        "military exercise India",
      ];
    } else if (category === "india") {
      queries = [
        "Indian army news",
        "Indian defence news",
        "India military operations",
        "Indian air force updates",
        "Indian navy news",
      ];
    } else {
      queries = [
        "military",
        "defense army",
        "navy warship",
        "air force",
        "soldier troops",
        "defence ministry",
      ];
    }

    let allResults = [];

    // 🔄 FETCH NEWS
    for (const query of queries) {
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
        console.error(`Error for query "${query}":`, err.message);
      }
    }

    // 🔥 REMOVE DUPLICATES
    let uniqueResults = allResults.filter(
      (article, index, self) =>
        index === self.findIndex((a) => a.title === article.title),
    );

    // =====================================================
    // 🔥 STRICT MILITARY FILTER (MOST IMPORTANT FIX)
    // =====================================================
    const militaryKeywords = [
      "army",
      "navy",
      "air force",
      "defence",
      "defense",
      "military",
      "soldier",
      "troops",
      "war",
      "missile",
      "drdo",
      "border",
      "operation",
      "combat",
      "security",
      "fighter jet",
      "tank",
      "regiment",
    ];

    uniqueResults = uniqueResults.filter((article) => {
      const text = `${article.title} ${article.description}`.toLowerCase();
      return militaryKeywords.some((word) => text.includes(word));
    });

    // =====================================================
    // 🔥 TRIBUTE FILTER - STRICT MILITARY ONLY
    // =====================================================
    if (category === "tribute") {
      const tributeKeywords = [
        "martyr",
        "tribute",
        "death anniversary",
        "killed in action",
        "kia",
        "war hero",
        "bravery",
        "param vir chakra",
        "ashoka chakra",
        "gallantry",
        "honor",
        "heroic",
        "armed forces",
        "military award",
        "soldier",
        "army",
      ];

      uniqueResults = uniqueResults.filter((article) => {
        const text = `${article.title} ${article.description}`.toLowerCase();
        // Must contain at least one tribute keyword AND be military-related
        const hasTributeKeyword = tributeKeywords.some((word) =>
          text.includes(word),
        );
        const isMilitaryContext =
          text.includes("army") ||
          text.includes("soldier") ||
          text.includes("military") ||
          text.includes("armed");
        return hasTributeKeyword && isMilitaryContext;
      });
    }

    // =====================================================
    // 🇮🇳 INDIA FILTER
    // =====================================================
    if (category === "india" || category === "tribute") {
      uniqueResults = uniqueResults.filter((article) => {
        const text = `${article.title} ${article.description}`.toLowerCase();
        return text.includes("india");
      });
    }

    // =====================================================
    // 🔥 EXCLUDE NON-MILITARY SECTORS
    // =====================================================
    const nonMilitarySectors = [
      "cricket",
      "bollywood",
      "sports",
      "actor",
      "celebrity",
      "film",
      "sports person",
      "athlete",
      "match",
      "tournament",
    ];

    uniqueResults = uniqueResults.filter((article) => {
      const text = `${article.title} ${article.description}`.toLowerCase();
      return !nonMilitarySectors.some((sector) => text.includes(sector));
    });

    // =====================================================
    // 🔥 SMART CLASSIFICATION
    // =====================================================
    const classifiedResults = uniqueResults.map((article) => {
      const text = `${article.title} ${article.description}`.toLowerCase();

      let type = "general";

      // 🪖 Tribute
      if (
        text.includes("martyr") ||
        text.includes("tribute") ||
        text.includes("death anniversary") ||
        text.includes("kia") ||
        text.includes("killed in action") ||
        text.includes("war hero")
      ) {
        type = "tribute";
      }

      // 🎖 Awards - Military specific awards only
      else if (
        text.includes("param vir chakra") ||
        text.includes("ashoka chakra") ||
        text.includes("vir chakra") ||
        text.includes("military award") ||
        text.includes("gallantry award") ||
        (text.includes("award") &&
          (text.includes("army") || text.includes("soldier")))
      ) {
        type = "award";
      }

      // 🚀 Military Achievements ONLY - No civilian tech
      else if (
        text.includes("missile test") ||
        text.includes("fighter jet") ||
        text.includes("military exercise") ||
        text.includes("drdo missile") ||
        text.includes("defence success") ||
        text.includes("air force operation") ||
        text.includes("navy operation") ||
        text.includes("armoured division")
      ) {
        type = "achievement";
      }

      // ⚔️ Operations
      else if (
        text.includes("operation") ||
        text.includes("mission") ||
        text.includes("rescue")
      ) {
        type = "operation";
      }

      return {
        ...article,
        type,
      };
    });

    // =====================================================
    return successResponse(res, {
      status: "success",
      category: category || "general",
      totalResults: classifiedResults.length,
      results: classifiedResults,
    });
  } catch (error) {
    console.error("News API error:", error.message);

    return successResponse(res, {
      status: "success",
      totalResults: 0,
      results: [],
    });
  }
};
