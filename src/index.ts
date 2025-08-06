#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  search,
  searchNews,
  searchImages,
  searchVideos,
  SafeSearchType,
} from "duck-duck-scrape";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// 🕊️ Freebird - Soar through the web without limits
const BANNER = `
🕊️ Freebird MCP Server
Free as a bird - No API keys required
`;

// Parse CLI arguments
const argv = await yargs(hideBin(process.argv))
  .usage("🕊️ Freebird MCP - Free web search server")
  .option("transport", {
    alias: "t",
    type: "string",
    description: "Transport type",
    choices: ["stdio"],
    default: "stdio",
  })
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Enable verbose logging",
    default: false,
  })
  .help().argv;

// Initialize server
const server = new Server(
  {
    name: "freebird-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "freebird_search",
        description:
          '🕊️ Smart search that auto-detects the best search type. Just add "use freebird" to your prompt.',
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "What to search for",
            },
            searchType: {
              type: "string",
              enum: ["auto", "web", "news", "images", "videos"],
              default: "auto",
              description:
                "Search type (auto-detects from context when set to auto)",
            },
            limit: {
              type: "number",
              description: "Maximum number of results",
              default: 5,
              minimum: 1,
              maximum: 20,
            },
          },
          required: ["query"],
        },
      },
      {
        name: "web_search",
        description: "Search the web for general information",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query",
            },
            limit: {
              type: "number",
              description: "Maximum results (1-20)",
              default: 5,
              minimum: 1,
              maximum: 20,
            },
            safeSearch: {
              type: "string",
              enum: ["strict", "moderate", "off"],
              default: "moderate",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "news_search",
        description: "Search for recent news and articles",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "News search query",
            },
            timeRange: {
              type: "string",
              enum: ["d", "w", "m", "y"],
              description: "Time range: d=day, w=week, m=month, y=year",
              default: "w",
            },
            limit: {
              type: "number",
              description: "Maximum results",
              default: 5,
            },
          },
          required: ["query"],
        },
      },
      {
        name: "image_search",
        description: "Search for images",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Image search query",
            },
            limit: {
              type: "number",
              description: "Maximum results",
              default: 5,
            },
            size: {
              type: "string",
              enum: ["Small", "Medium", "Large", "Wallpaper"],
              description: "Image size filter",
            },
            type: {
              type: "string",
              enum: ["photo", "clipart", "gif", "transparent"],
              description: "Image type filter",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "video_search",
        description: "Search for videos",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Video search query",
            },
            limit: {
              type: "number",
              description: "Maximum results",
              default: 5,
            },
            duration: {
              type: "string",
              enum: ["short", "medium", "long"],
              description: "Video duration filter",
            },
          },
          required: ["query"],
        },
      },
    ],
  };
});

// Smart search type detection
function detectSearchType(query: string): string {
  const lowerQuery = query.toLowerCase();

  // Check for explicit type indicators
  if (lowerQuery.match(/\b(news|headline|latest|breaking|recent)\b/)) {
    return "news";
  }
  if (lowerQuery.match(/\b(image|photo|picture|pic|img|visual)\b/)) {
    return "images";
  }
  if (lowerQuery.match(/\b(video|watch|youtube|clip|tutorial video)\b/)) {
    return "videos";
  }

  // Default to web search
  return "web";
}

// Format results for better readability
function formatResults(results: any[], type: string): string {
  if (!results || results.length === 0) {
    return "No results found. Try different keywords or broaden your search.";
  }

  switch (type) {
    case "news":
      return results
        .map(
          (r, i) =>
            `${i + 1}. **${r.title}**\n   Source: ${
              r.source || "Unknown"
            }\n   Date: ${r.date || "N/A"}\n   URL: ${r.url}\n   ${
              r.body ? `Summary: ${r.body.substring(0, 150)}...` : ""
            }`
        )
        .join("\n\n");

    case "images":
      return results
        .map(
          (r, i) =>
            `${i + 1}. **${r.title}**\n   Image: ${r.image}\n   Thumbnail: ${
              r.thumbnail
            }\n   Source: ${r.url}\n   Size: ${r.width}x${r.height}`
        )
        .join("\n\n");

    case "videos":
      return results
        .map(
          (r, i) =>
            `${i + 1}. **${r.title}**\n   URL: ${r.content}\n   Duration: ${
              r.duration || "N/A"
            }\n   Publisher: ${r.publisher || "Unknown"}\n   ${
              r.description
                ? `Description: ${r.description.substring(0, 150)}...`
                : ""
            }`
        )
        .join("\n\n");

    default: // web
      return results
        .map(
          (r, i) =>
            `${i + 1}. **${r.title}**\n   URL: ${r.url}\n   ${
              r.description || ""
            }`
        )
        .join("\n\n");
  }
}

// Tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (argv.verbose) {
    console.error(`🕊️ Freebird: Handling ${name} with args:`, args);
  }

  try {
    // Smart search with auto-detection
    if (name === "freebird_search") {
      const searchType =
        args.searchType === "auto"
          ? detectSearchType(args.query)
          : args.searchType;

      if (argv.verbose) {
        console.error(`🕊️ Auto-detected search type: ${searchType}`);
      }

      let results;
      switch (searchType) {
        case "news":
          const newsData = await searchNews(args.query, {
            safeSearch: SafeSearchType.MODERATE,
            time: "w",
          });
          results = formatResults(
            newsData.results.slice(0, args.limit || 5),
            "news"
          );
          break;

        case "images":
          const imageData = await searchImages(args.query, {
            safeSearch: SafeSearchType.MODERATE,
          });
          results = formatResults(
            imageData.results.slice(0, args.limit || 5),
            "images"
          );
          break;

        case "videos":
          const videoData = await searchVideos(args.query, {
            safeSearch: SafeSearchType.MODERATE,
          });
          results = formatResults(
            videoData.results.slice(0, args.limit || 5),
            "videos"
          );
          break;

        default:
          const webData = await search(args.query, {
            safeSearch: SafeSearchType.MODERATE,
          });
          results = formatResults(
            webData.results.slice(0, args.limit || 5),
            "web"
          );
      }

      return {
        content: [
          {
            type: "text",
            text: `🕊️ Freebird Search Results (${searchType}):\n\n${results}`,
          },
        ],
      };
    }

    // Regular web search
    if (name === "web_search") {
      const safeSearchMap = {
        strict: SafeSearchType.STRICT,
        moderate: SafeSearchType.MODERATE,
        off: SafeSearchType.OFF,
      };

      const results = await search(args.query, {
        safeSearch: safeSearchMap[args.safeSearch || "moderate"],
      });

      const formatted = formatResults(
        results.results.slice(0, args.limit || 5),
        "web"
      );

      return {
        content: [
          {
            type: "text",
            text: formatted,
          },
        ],
      };
    }

    // News search
    if (name === "news_search") {
      const results = await searchNews(args.query, {
        safeSearch: SafeSearchType.MODERATE,
        time: args.timeRange || "w",
      });

      const formatted = formatResults(
        results.results.slice(0, args.limit || 5),
        "news"
      );

      return {
        content: [
          {
            type: "text",
            text: formatted,
          },
        ],
      };
    }

    // Image search
    if (name === "image_search") {
      const results = await searchImages(args.query, {
        safeSearch: SafeSearchType.MODERATE,
        size: args.size,
        type: args.type,
      });

      const formatted = formatResults(
        results.results.slice(0, args.limit || 5),
        "images"
      );

      return {
        content: [
          {
            type: "text",
            text: formatted,
          },
        ],
      };
    }

    // Video search
    if (name === "video_search") {
      const results = await searchVideos(args.query, {
        safeSearch: SafeSearchType.MODERATE,
        duration: args.duration,
      });

      const formatted = formatResults(
        results.results.slice(0, args.limit || 5),
        "videos"
      );

      return {
        content: [
          {
            type: "text",
            text: formatted,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    console.error("🕊️ Freebird error:", error);
    return {
      content: [
        {
          type: "text",
          text: `Error performing search: ${error.message}\nPlease try again with different keywords.`,
        },
      ],
    };
  }
});

// Main entry point
async function main() {
  if (argv.verbose) {
    console.error(BANNER);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);

  if (argv.verbose) {
    console.error("🕊️ Freebird MCP server is flying high on stdio");
  }
}

main().catch((error) => {
  console.error("🕊️ Freebird crashed:", error);
  process.exit(1);
});
