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
import TurndownService from "turndown";
import * as cheerio from "cheerio";

// Import turndown-plugin-gfm using dynamic import
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const turndownPluginGfm = require('turndown-plugin-gfm');

// 🕊️ Freebird - Soar through the web without limits
const BANNER = `
🕊️ Freebird MCP Server
Free as a bird - No API keys required
`;

// Initialize DDGS instance
const ddgs = new DDGS();

// Initialize Turndown service for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  strongDelimiter: '**',
  linkStyle: 'inlined'
});

// Add table support
turndownService.use(turndownPluginGfm.tables);

// Remove elements that add noise for LLMs
turndownService.remove(['script', 'style', 'nav', 'footer', 'header', 'aside', 'noscript']);

// Keep useful elements
turndownService.keep(['code', 'pre']);

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
      {
        name: "freebird_fetch",
        description:
          '🦅 Fetch and extract full page content from URLs. Returns LLM-friendly Markdown with preserved structure, code blocks, and tables.',
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "URL to fetch content from",
              format: "uri",
            },
            maxLength: {
              type: "number",
              description: "Maximum content length in characters",
              default: 10000,
              minimum: 1000,
              maximum: 50000,
            },
            includeImages: {
              type: "boolean",
              description: "Include image descriptions and alt text",
              default: false,
            },
          },
          required: ["url"],
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

    // Freebird fetch - get full page content
    if (name === "freebird_fetch") {
      if (argv.verbose) {
        console.error(`🦅 Freebird: Fetching content from "${typedArgs.url}"`);
      }

      try {
        // Fetch the HTML content
        const response = await fetch(typedArgs.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; FreebirdMCP/1.0; +https://github.com/danielbowne/freebird-mcp)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove noise elements for cleaner content
        $('script, style, nav, footer, header, aside, noscript, .ads, .advertisement, #ads, .sidebar').remove();
        
        // Remove common ad and navigation classes
        $('.nav, .navigation, .menu, .breadcrumb, .social, .share, .comments').remove();
        $('.cookie-banner, .popup, .modal, .overlay').remove();

        // Focus on main content areas
        let contentElement = $('main, article, .content, .post, .entry, #content, .main').first();
        if (contentElement.length === 0) {
          // Fallback to body if no main content area found
          contentElement = $('body');
        }

        // Extract the cleaned HTML
        const cleanedHtml = contentElement.html() || '';
        
        if (!cleanedHtml) {
          return {
            content: [
              {
                type: "text",
                text: "🦅 Unable to extract content from the page. The page might be JavaScript-heavy or have unusual structure.",
              },
            ],
          };
        }

        // Convert to Markdown
        let markdown = turndownService.turndown(cleanedHtml);
        
        // Apply length limit
        const maxLength = typedArgs.maxLength || 10000;
        if (markdown.length > maxLength) {
          markdown = markdown.substring(0, maxLength) + '\n\n... [Content truncated]';
        }

        // Add metadata
        const title = $('title').text().trim();
        const description = $('meta[name="description"]').attr('content') || '';
        
        let result = `# ${title || 'Page Content'}\n\n`;
        if (description) {
          result += `> ${description}\n\n`;
        }
        result += `**Source:** ${typedArgs.url}\n\n`;
        result += `---\n\n${markdown}`;

        return {
          content: [
            {
              type: "text",
              text: result,
            },
          ],
        };

      } catch (fetchError) {
        const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: "text",
              text: `🦅 Error fetching content from ${typedArgs.url}:\n${errorMessage}\n\nThis could be due to:\n- Network issues\n- Site blocking automated requests\n- Invalid URL\n- Content behind authentication`,
            },
          ],
        };
      }
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
