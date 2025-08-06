# 🦅 Freebird MCP 🦅

> *"Cause I'm as free as a bird now, and this bird you cannot change"* 🎸

Free web search for AI assistants. No API keys. No limits. Just soar.

## ✨ Features

- 🔓 **No API Keys Required** - Truly free, no strings attached
- 🤖 **Smart Auto-Detection** - Automatically chooses the right search type
- 🔍 **Multiple Search Types** - Web, news, images, and videos
- 🚀 **Simple Integration** - Just add "use freebird" to any prompt
- 📦 **Zero Config** - Works out of the box with npx

## 🚀 Quick Start

> **Note for Claude Code users**: You already have excellent web search built-in! Freebird is most useful for other MCP tools that need search capabilities, or when you want the specialized `freebird_fetch` content extraction feature.

<details>
<summary><b>Install in Claude Desktop</b></summary>

**Quick Install:**
```bash
claude mcp add freebird -- npx -y @dannyboy2042/freebird-mcp
```

**Manual Configuration:**
```json
{
  "mcpServers": {
    "freebird": {
      "command": "npx",
      "args": ["-y", "@dannyboy2042/freebird-mcp"]
    }
  }
}
```

</details>

<details>
<summary><b>Install in Cursor</b></summary>

Add to your Cursor MCP settings file (`~/.cursor-mcp/settings.json`):

```json
{
  "mcpServers": {
    "freebird": {
      "command": "npx",
      "args": ["-y", "@dannyboy2042/freebird-mcp"],
      "env": {}
    }
  }
}
```

**Alternative with specific version:**
```json
{
  "mcpServers": {
    "freebird": {
      "command": "npx",
      "args": ["-y", "@dannyboy2042/freebird-mcp@latest"],
      "env": {}
    }
  }
}
```

</details>

<details>
<summary><b>Install in Windsurf</b></summary>

Configure in Windsurf MCP settings:

```json
{
  "mcpServers": {
    "freebird-search": {
      "command": "npx",
      "args": ["@dannyboy2042/freebird-mcp"],
      "disabled": false
    }
  }
}
```

**Alternative naming:**
```json
{
  "mcpServers": {
    "freebird": {
      "command": "npx", 
      "args": ["@dannyboy2042/freebird-mcp"],
      "disabled": false
    }
  }
}
```

</details>

<details>
<summary><b>Install in Continue</b></summary>

Add to your Continue configuration (`~/.continue/config.json`):

```json
{
  "mcpServers": {
    "freebird": {
      "command": "npx",
      "args": ["-y", "@dannyboy2042/freebird-mcp"]
    }
  }
}
```

</details>

<details>
<summary><b>Install in Other MCP Clients</b></summary>

**Generic MCP Configuration:**
```json
{
  "servers": {
    "freebird": {
      "command": "npx",
      "args": ["-y", "@dannyboy2042/freebird-mcp"],
      "transport": "stdio"
    }
  }
}
```

**Direct Command Line:**
```bash
npx @dannyboy2042/freebird-mcp
```

</details>

<details>
<summary><b>Local Development Setup</b></summary>

```bash
# Clone and build locally
git clone https://github.com/danielbowne/freebird-mcp.git
cd freebird-mcp
npm install
npm run build

# Test the server
node dist/index.js --help

# Add to your MCP client config:
{
  "mcpServers": {
    "freebird": {
      "command": "node",
      "args": ["/path/to/freebird-mcp/dist/index.js"]
    }
  }
}
```

</details>

## 💡 Usage

Once installed, simply add **"use freebird"** to any prompt:

```
use freebird to find the latest TypeScript 5.0 features and examples
```

### Available Tools

- `freebird_search` - Smart search with auto-detection
- `freebird_fetch` - Extract full page content in LLM-friendly Markdown
- `web_search` - General web search  
- `news_search` - Latest news articles
- `image_search` - Image search with filters
- `video_search` - Video search with duration filters

### Search Examples

```bash
# API Documentation & References
use freebird to find FastAPI async database connection examples

# Framework Comparisons
use freebird to compare Next.js 14 vs Remix performance benchmarks  

# Library Integration
use freebird to search for Prisma with PostgreSQL best practices

# Debugging & Troubleshooting
use freebird to find solutions for Docker container networking issues

# Architecture Patterns
use freebird to research microservices event-driven architecture patterns

# Tool Configuration
use freebird to find ESLint configuration for TypeScript monorepos

# Full Content Extraction  
use freebird to fetch the full FastAPI tutorial page content
```

### Content Extraction Examples

```bash
# Get complete documentation pages
freebird_fetch: https://docs.python.org/3/library/asyncio.html

# Extract API reference with code examples
freebird_fetch: https://fastapi.tiangolo.com/tutorial/

# Pull full GitHub README or wiki pages
freebird_fetch: https://github.com/microsoft/TypeScript/blob/main/README.md

# Get complete tutorial content
freebird_fetch: https://react.dev/learn/thinking-in-react
```

## 🧪 Testing

Test the MCP server locally:

```bash
# Test tool listing
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | \
npx @dannyboy2042/freebird-mcp

# Test search functionality
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "freebird_search", "arguments": {"query": "Node.js tutorials", "limit": 3}}, "id": 2}' | \
npx @dannyboy2042/freebird-mcp

# Test content fetching
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "freebird_fetch", "arguments": {"url": "https://httpbin.org/html", "maxLength": 1000}}, "id": 3}' | \
npx @dannyboy2042/freebird-mcp
```

## 🔧 Configuration

No configuration required! Freebird works out of the box with sensible defaults.

Optional environment variables:
- `FREEBIRD_VERBOSE=true` - Enable detailed logging
- `FREEBIRD_TIMEOUT=30000` - Request timeout in milliseconds

## 📚 API Reference

### freebird_search

Smart search that auto-detects the best search type based on your query.

**Parameters:**
- `query` (required) - Search terms
- `limit` (optional) - Number of results (1-20, default: 5)
- `region` (optional) - Search region (default: us-en)
- `safeSearch` (optional) - Filter level (strict/moderate/off)

**Example:**
```json
{
  "query": "Rust async web framework performance comparison 2024",
  "limit": 8,
  "region": "us-en", 
  "safeSearch": "moderate"
}
```

### freebird_fetch

Extract full page content from URLs and return clean, LLM-friendly Markdown.

**Parameters:**
- `url` (required) - URL to fetch content from
- `maxLength` (optional) - Maximum content length (1000-50000, default: 10000)  
- `includeImages` (optional) - Include image descriptions (default: false)

**Features:**
- Converts HTML to clean Markdown
- Removes ads, navigation, and clutter
- Preserves code blocks, tables, and structure  
- Includes page metadata (title, description)
- Respects content length limits

**Example:**
```json
{
  "url": "https://docs.python.org/3/library/json.html",
  "maxLength": 15000,
  "includeImages": false
}
```

**Output Format:**
```markdown
# Page Title

> Page description from meta tags

**Source:** https://example.com/page

---

# Main Content Header

Page content converted to clean Markdown with preserved:
- **Code blocks** with syntax highlighting info
- Tables with proper formatting
- Lists and nested structures
- Links and emphasis

... [Content truncated if over maxLength]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [duck-duck-scrape](https://github.com/phukon/duck-duck-scrape) by @phukon
- Powered by the [Model Context Protocol](https://modelcontextprotocol.io)
- Inspired by the need for free, unlimited web search

---

**Happy searching! 🕊️**