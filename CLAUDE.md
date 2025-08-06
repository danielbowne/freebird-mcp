# CLAUDE.md - Freebird MCP Project Documentation

## 🕊️ Project Overview

**Freebird MCP** is a Model Context Protocol (MCP) server that provides free web search capabilities to AI assistants without requiring API keys. It uses the `duck-duck-scrape` library to search DuckDuckGo and return results in a structured format.

**Key Features:**
- No API keys required - completely free
- Smart auto-detection of search types (web, news, images, videos)
- Simple integration via "use freebird" in prompts
- Published as an npm package for easy installation via npx

## 📁 Project Structure

```
freebird-mcp/
├── src/
│   └── index.ts          # Main server implementation
├── dist/                 # Compiled JavaScript (git-ignored)
├── .github/
│   └── workflows/
│       ├── release.yml   # Automated npm publishing on tags
│       └── test.yml      # CI testing on PRs
├── .vscode/
│   ├── settings.json     # VSCode project settings
│   └── tasks.json        # Quick release tasks
├── package.json          # Project config & dependencies
├── tsconfig.json         # TypeScript configuration
├── README.md            # User-facing documentation
├── CLAUDE.md            # This file - AI context
├── CHANGELOG.md         # Version history (auto-generated)
├── LICENSE              # MIT license
└── .gitignore           # Git ignore rules
```

## 🏗️ What We've Built

### Core Implementation (src/index.ts)

1. **MCP Server Setup**
   - Uses `@modelcontextprotocol/sdk` for MCP protocol
   - Implements stdio transport for communication
   - Provides tool definitions for Claude/Cursor/other AI assistants

2. **Search Tools Implemented**
   - `freebird_search` - Smart search with auto-detection
   - `web_search` - General web search
   - `news_search` - News articles with time filters
   - `image_search` - Image search with size/type filters
   - `video_search` - Video search with duration filters

3. **Smart Features**
   - Auto-detects search type from query keywords
   - Formats results for readability
   - Error handling with user-friendly messages
   - Verbose logging option for debugging

### Dependencies

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.6.0",
    "duck-duck-scrape": "^2.2.5",
    "yargs": "^17.7.2"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/yargs": "^17.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0",
    "standard-version": "^9.5.0",
    "@commitlint/cli": "^17.0.0",
    "@commitlint/config-conventional": "^17.0.0",
    "husky": "^8.0.0"
  }
}
```

## 🚀 Current Status

### Completed ✅
- [x] Core MCP server implementation
- [x] Duck-duck-scrape integration
- [x] All search types (web, news, images, videos)
- [x] Smart auto-detection logic
- [x] Error handling and formatting
- [x] TypeScript configuration
- [x] Package.json setup with npm publishing config
- [x] Comprehensive README documentation
- [x] VSCode integration files

### In Progress 🏗️
- [ ] GitHub Actions workflows (release.yml, test.yml)
- [ ] NPM account setup and token configuration
- [ ] Initial beta release (v1.0.0-beta.1)
- [ ] Testing with real MCP clients

### Not Started Yet 📋
- [ ] Automated changelog generation
- [ ] Commit linting with husky
- [ ] Unit tests
- [ ] Integration tests with MCP inspector
- [ ] Docker support
- [ ] Hosted HTTP/SSE transport options

## 📦 Versioning Strategy

### Version Format
```
1.0.0-beta.1  # Beta releases
1.0.0-rc.1    # Release candidates  
1.0.0         # Stable releases
```

### Git Branches
- `main` - Stable releases only
- `develop` - Active development
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Release Process
1. Develop on feature branch
2. PR to develop branch
3. Test thoroughly
4. Merge to main
5. Tag with version (triggers auto-publish)

## 🔄 GitHub Workflows

### release.yml - Automated NPM Publishing

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write
  packages: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Determine npm tag
        id: npm-tag
        run: |
          if [[ "${{ github.ref_name }}" == *"beta"* ]]; then
            echo "tag=beta" >> $GITHUB_OUTPUT
          elif [[ "${{ github.ref_name }}" == *"rc"* ]]; then
            echo "tag=rc" >> $GITHUB_OUTPUT
          else
            echo "tag=latest" >> $GITHUB_OUTPUT
          fi
      
      - name: Publish to npm
        run: npm publish --tag ${{ steps.npm-tag.outputs.tag }} --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          generate_release_notes: true
          prerelease: ${{ contains(github.ref_name, 'beta') || contains(github.ref_name, 'rc') }}
          body: |
            ## Installation
            
            \`\`\`bash
            # Install in Claude Desktop
            claude mcp add freebird -- npx -y @${{ github.repository_owner }}/freebird-mcp@${{ github.ref_name }}
            
            # Install latest stable
            npx -y @${{ github.repository_owner }}/freebird-mcp
            \`\`\`
            
            See [README](https://github.com/${{ github.repository }}/blob/main/README.md) for full documentation.
```

### test.yml - Continuous Integration

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint --if-present
      
      - name: Build
        run: npm run build
      
      - name: Test build output
        run: |
          # Verify the built file exists and is executable
          test -f dist/index.js
          node dist/index.js --help
      
      - name: Test with MCP Inspector
        run: |
          # Test that the server responds to MCP commands
          npx -y @modelcontextprotocol/inspector npx . << EOF
          {"jsonrpc": "2.0", "method": "tools/list", "id": 1}
          EOF
        continue-on-error: true  # Don't fail if MCP inspector has issues
      
      - name: Check TypeScript
        run: npx tsc --noEmit
```

## 📝 Next Steps

### Immediate (Before First Release)

1. **Setup NPM Publishing**
   ```bash
   # Create npm account
   npm adduser
   
   # Update package.json with your npm username
   # Replace @yourusername with actual username
   
   # Generate NPM token
   # Go to: https://www.npmjs.com/settings/USERNAME/tokens
   # Add token to GitHub repo secrets as NPM_TOKEN
   ```

2. **Create GitHub Repository**
   ```bash
   # Initialize git if not done
   git init
   
   # Create GitHub repo
   gh repo create freebird-mcp --public
   
   # Add remote
   git remote add origin https://github.com/USERNAME/freebird-mcp.git
   
   # Initial commit
   git add .
   git commit -m "feat: initial commit of Freebird MCP server"
   git push -u origin main
   ```

3. **First Beta Release**
   ```bash
   # Build and test locally
   npm run build
   npm run test
   
   # Create first beta version
   npm version 1.0.0-beta.1
   
   # Push with tags (triggers GitHub Action)
   git push && git push --tags
   ```

### Short Term (Next Week)

1. **Testing & Validation**
   - Test with Claude Desktop
   - Test with Cursor
   - Test with Windsurf
   - Gather feedback from beta users

2. **Documentation Improvements**
   - Add GIF demos to README
   - Create YouTube demo video
   - Add troubleshooting section

3. **Code Improvements**
   - Add request caching (5-minute cache for identical queries)
   - Add rate limiting to prevent DuckDuckGo blocking
   - Improve error messages with suggestions

### Medium Term (Next Month)

1. **Feature Additions**
   - Add support for multiple languages/regions
   - Add search filters (date range, file type)
   - Add support for DuckDuckGo bangs (!w for Wikipedia, etc.)
   - Add option to return raw JSON or formatted text

2. **Quality Improvements**
   - Add unit tests with Jest
   - Add integration tests
   - Set up code coverage reporting
   - Add ESLint configuration

3. **Distribution**
   - Submit to MCP server directory
   - Create Docker image
   - Add to Smithery for auto-installation

### Long Term (Future)

1. **Advanced Features**
   - HTTP/SSE transport for hosted option
   - Web UI for configuration
   - Search history/analytics
   - Custom search providers beyond DuckDuckGo

2. **Community**
   - Accept community contributions
   - Create Discord/Slack community
   - Regular release cycle
   - Feature request voting system

## 🧪 Testing Commands

```bash
# Local development
npm run dev

# Build TypeScript
npm run build

# Test the built server
node dist/index.js --help

# Test with MCP Inspector
npx -y @modelcontextprotocol/inspector npx .

# Test installation flow
npm pack
npx -y ./freebird-mcp-1.0.0-beta.1.tgz

# Version commands
npm run version:beta    # Bump beta version
npm run version:rc      # Bump to RC
npm run version:patch   # Bump patch version
npm run version:minor   # Bump minor version
npm run version:major   # Bump major version
```

## 🐛 Common Issues & Solutions

### Issue: Module not found errors
**Solution:** Use bunx instead of npx, or add --experimental-modules flag

### Issue: TypeScript compilation errors
**Solution:** Ensure tsconfig.json targets ES2022 and moduleResolution is "node"

### Issue: DuckDuckGo blocking requests
**Solution:** Implement rate limiting, add delays between requests

### Issue: MCP client not recognizing tools
**Solution:** Verify the tool schema matches MCP specification exactly

## 📚 Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [duck-duck-scrape Library](https://github.com/surajv311/duck-duck-scrape)
- [NPM Publishing Guide](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)

## 🤝 Contributing Guidelines

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit with conventional commits (`feat:`, `fix:`, `docs:`, etc.)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request to `develop` branch

## 📄 License

MIT License - See LICENSE file

---

*This CLAUDE.md file is specifically designed to provide context for AI assistants working on this codebase. Keep it updated as the project evolves.*