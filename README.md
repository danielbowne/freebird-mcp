# 🕊️ Freebird MCP

> *"Cause I'm as free as a bird now, and this bird you cannot change"* 🎸

Free web search for AI assistants. No API keys. No limits. Just soar.

## ✨ Features

- 🔓 **No API Keys Required** - Truly free, no strings attached
- 🤖 **Smart Auto-Detection** - Automatically chooses the right search type
- 🔍 **Multiple Search Types** - Web, news, images, and videos
- 🚀 **Simple Integration** - Just add "use freebird" to any prompt
- 📦 **Zero Config** - Works out of the box with npx

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Install via Docker
claude mcp add freebird -- docker run -i --rm dannyboy2042/freebird-mcp

# Or add manually to Claude Desktop config:
{
  "mcpServers": {
    "freebird": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "dannyboy2042/freebird-mcp"]
    }
  }
}
```

### Option 2: NPM Package

```bash
# Install via npm
claude mcp add freebird -- npx -y @dannyboy2042/freebird-mcp

# Or add manually to Claude Desktop config:
{
  "mcpServers": {
    "freebird": {
      "command": "npx",
      "args": ["-y", "@dannyboy2042/freebird-mcp"]
    }
  }
}
```

### Option 3: Local Development

```bash
# Clone and run locally
git clone https://github.com/danielbowne/freebird-mcp.git
cd freebird-mcp
npm install
npm run build

# Add to Claude Desktop config:
{
  "mcpServers": {
    "freebird": {
      "command": "node",
      "args": ["/path/to/freebird-mcp/dist/index.js"]
    }
  }
}
```

## 💡 Usage

Once installed, simply add **"use freebird"** to any prompt:

```
use freebird to search for Node.js tutorials
```

### Available Tools

- `freebird_search` - Smart search with auto-detection
- `web_search` - General web search  
- `news_search` - Latest news articles
- `image_search` - Image search with filters
- `video_search` - Video search with duration filters

### Search Examples

```bash
# Smart auto-detection
use freebird to find the latest React documentation

# News search
use freebird to search for recent AI news

# Image search  
use freebird to find high-resolution nature images

# Video tutorials
use freebird to search for Python tutorial videos
```

## 🐳 Docker Support

The Docker image is available at `dannyboy2042/freebird-mcp`:

```bash
# Pull the image
docker pull dannyboy2042/freebird-mcp

# Run directly
docker run -i --rm dannyboy2042/freebird-mcp

# Test with a search
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | \
docker run -i --rm dannyboy2042/freebird-mcp
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
  "query": "latest JavaScript frameworks",
  "limit": 10,
  "region": "us-en",
  "safeSearch": "moderate"
}
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