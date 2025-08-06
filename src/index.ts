#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { DDGS } from "@phukon/duckduckgo-search";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// 🕊️ Freebird - Soar through the web without limits
const BANNER = `
🕊️ Freebird MCP Server
Free as a bird - No API keys required
`;

// Initialize DDGS instance
const ddgs = new DDGS();

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
          '🕊️ Smart web search with DuckDuckGo. Just add "use freebird" to your prompt.',
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "What to search for",
            },
            limit: {
              type: "number",
              description: "Maximum number of results",
              default: 5,
              minimum: 1,
              maximum: 20,
            },
            region: {
              type: "string",
              description: "Search region (e.g., 'us-en', 'uk-en')",
              default: "us-en",
            },
            safeSearch: {
              type: "string",
              enum: ["strict", "moderate", "off"],
              description: "Safe search filter",
              default: "moderate",
            },
          },
          required: ["query"],
        },
      },
    ],
  };
});


// Tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  // Type guard to ensure args is defined and is an object
  if (!args || typeof args !== 'object') {
    throw new Error('Invalid arguments provided');
  }

  // Cast to any for safe access - MCP SDK types are not fully typed
  const typedArgs = args as any;

  if (argv.verbose) {
    console.error(`🕊️ Freebird: Handling ${name} with args:`, args);
  }

  try {
    // Freebird search
    if (name === "freebird_search") {
      if (argv.verbose) {
        console.error(`🕊️ Freebird: Searching for "${typedArgs.query}"`);
      }

      const searchOptions: any = {
        keywords: typedArgs.query,
        maxResults: typedArgs.limit || 5,
        region: typedArgs.region || "us-en",
        safesearch: typedArgs.safeSearch || "moderate",
      };

      const results = await ddgs.text(searchOptions);
      
      if (!results || results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No results found. Try different keywords or broaden your search.",
            },
          ],
        };
      }

      const formatted = results
        .map(
          (r: any, i: number) =>
            `${i + 1}. **${r.title}**\n   URL: ${r.href}\n   ${r.body || ""}`
        )
        .join("\n\n");

      return {
        content: [
          {
            type: "text",
            text: `🕊️ Freebird Search Results:\n\n${formatted}`,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error("🕊️ Freebird error:", error);
    return {
      content: [
        {
          type: "text",
          text: `Error performing search: ${errorMessage}\nPlease try again with different keywords.`,
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
