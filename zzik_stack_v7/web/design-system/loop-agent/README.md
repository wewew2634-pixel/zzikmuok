# 🔄 ZZIK Loop Agent System

**Automated design validation and improvement system based on Linear 2025 Dark Theme**

## 🎯 Purpose

The Loop Agent system automatically validates and improves ZZIK's design system through iterative analysis:
- **Captures** screenshots of all pages
- **Analyzes** designs using GPT-4o Vision with nano-particle level rules
- **Compares** results with previous iterations
- **Suggests** fixes with confidence scores
- **Verifies** fix safety before application
- **Applies** high-confidence fixes automatically

## 🏗️ Architecture

### Multi-Agent System (7 Agents)

```
Orchestrator (Main Controller)
    ↓
    ├── Capture Agent    → Screenshots (Playwright)
    ├── Analyze Agent    → GPT-4o Vision API
    ├── Compare Agent    → Delta analysis
    ├── Suggest Agent    → Fix generation
    ├── Verify Agent     → Safety validation
    └── State Manager    → History tracking
```

### Workflow (6 Steps per Iteration)

1. **Capture** → Parallel screenshot capture with Retina support
2. **Analyze** → GPT-4o Vision scores each page 0-100
3. **Compare** → Detect improvements/regressions vs previous iteration
4. **Suggest** → Generate auto-fix suggestions with confidence
5. **Verify** → Dry-run validation (syntax, conflicts, a11y)
6. **Apply** → Execute high-confidence fixes (or request approval)

## 🚀 Quick Start

### Prerequisites

```bash
# 1. Install dependencies (already done if npm install ran)
cd zzik_stack_v7/web
npm install

# 2. Configure OpenAI API key
# Edit .env.local and add your key:
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE

# 3. Ensure dev server is running
npm run dev
# Server should be at http://localhost:3000
```

### Run First Loop

```bash
# Semi-auto mode (default - requests approval before fixes)
npm run loop:start

# Full auto mode (applies all high-confidence fixes)
npm run loop:auto

# Manual mode (analysis only, no fixes)
npm run loop:manual

# Custom iterations
npm run loop:start -- --iterations 20
```

### Monitor Progress

```bash
# Check current status
npm run loop:status

# Generate comprehensive report
npm run loop:report
```

## 📐 Design Rules (Linear 2025 Dark Theme)

### Colors
- **TRUE BLACK** background: EXACTLY `#000000` (not #010101)
- Surface elevation: `#0F0F0F`, `#1A1A1A`, `#242424`
- Text hierarchy: White with 70% / 50% opacity
- Brand purple: `#8B5CF6` → `#7C3AED` gradient

### Spacing (8pt Grid)
- **ALL** spacing must be multiples of 4px: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
- ❌ INVALID: 15px, 18px, 22px, 30px
- ✅ VALID: 16px, 20px, 24px, 32px
- Exception: Button padding-y = 14px (visual balance)

### Typography
- **Line-height rhythm** (CRITICAL distinction):
  - Headings: `1.4` (tight = authority)
  - Body text: `1.5` (comfortable = readability)
- Font sizes: 32px, 20px, 16px, 14px, 12px
- System fonts only (performance)

### Components

#### Buttons
- Min height: `48px` (WCAG comfortable touch target)
- Border radius: `12px`
- Padding: `14px 24px` (Y X)

#### Cards
- Border radius: `16px`
- Padding: `20px`
- Background: `#1A1A1A` (surface-200)

#### Modals
- Border radius: `16px`
- Background: `#1A1A1A`
- Text contrast: `21:1` minimum

### Glassmorphism (MINIMAL)
- **Maximum 1 per screen** (battery + performance)
- Only allowed on:
  - Bottom navigation (always present)
  - Map overlays (specific context)
  - Agent chat bubbles (specific context)
- ❌ NEVER on cards, modals, buttons, headers

### Animations (60fps Guarantee)
- **ONLY** animate: `transform` and `opacity`
- ❌ PROHIBITED: width, height, top, left, margin, padding
- Max duration: `300ms`
- Preferred easing: `cubic-bezier(0.16, 1, 0.3, 1)`

### Accessibility (WCAG 2.1 AA)
- Text contrast: `4.5:1` minimum (21:1 on true black)
- Touch targets: `48px` comfortable (44px minimum)
- Focus indicators: Visible on all interactive elements

## 🔌 API Routes

### POST `/api/design-loop/start`
Start a new loop iteration cycle

**Request:**
```json
{
  "mode": "semi-auto",
  "maxIterations": 10,
  "baseUrl": "http://localhost:3000",
  "pages": [
    { "id": "home", "name": "Home Page", "url": "/home" },
    { "id": "feed", "name": "Feed Page", "url": "/feed" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "loopId": "loop-1729425600000",
  "config": { "mode": "semi-auto", "maxIterations": 10 }
}
```

### GET `/api/design-loop/status`
Get current loop state and progress

**Response:**
```json
{
  "running": true,
  "progress": {
    "currentIteration": 3,
    "currentScore": 87.5,
    "scoreHistory": [82.0, 85.3, 87.5],
    "trend": "improving"
  }
}
```

### POST `/api/design-loop/approve`
Manually approve fixes (semi-auto mode)

**Request:**
```json
{
  "iteration": 3,
  "approved": true,
  "suggestions": ["color-bg-123", "spacing-card-456"]
}
```

### GET `/api/design-loop/report`
Generate comprehensive execution report

**Response:**
```json
{
  "executionSummary": {
    "totalIterations": 5,
    "exitReason": "success",
    "finalScore": 96.2,
    "improvement": 14.2
  },
  "improvements": { "total": 23, "topImprovements": [...] },
  "regressions": { "total": 2, "topRegressions": [...] }
}
```

## 📊 Exit Conditions

The loop automatically stops when:

1. **Success** (any of):
   - Score ≥ 95/100 for **2 consecutive** iterations
   - **Zero** critical/high issues detected

2. **Stagnation**:
   - No improvement (< 1 point) for **3 consecutive** iterations

3. **Regression**:
   - Score drops by **5+ points** in single iteration

4. **Maximum Iterations**:
   - Reached configured max (default: 10)

## 🛠️ Configuration

### Loop Modes

#### Auto Mode
```bash
npm run loop:auto
```
- Automatically applies ALL high-confidence fixes (≥80% confidence)
- No manual approval required
- Fastest iteration speed
- **Use for**: Rapid prototyping, trusted environments

#### Semi-Auto Mode (Default)
```bash
npm run loop:start
```
- Requests approval before applying fixes
- Shows issue summary and fix details
- Manual selection of fixes to apply
- **Use for**: Production environments, careful changes

#### Manual Mode
```bash
npm run loop:manual
```
- Analysis only, NO automatic fixes
- Generates reports and suggestions
- Full manual review required
- **Use for**: Initial assessment, learning

### Custom Configuration

Create `loop-config.json`:
```json
{
  "mode": "semi-auto",
  "maxIterations": 20,
  "exitConditions": {
    "scoreThreshold": 98,
    "consecutivePassCount": 3,
    "zeroHighIssues": true
  },
  "pages": [
    {
      "id": "custom-page",
      "name": "Custom Page",
      "url": "/custom",
      "waitForSelectors": [".my-component"]
    }
  ]
}
```

## 📁 File Structure

```
design-system/loop-agent/
├── types.ts              # TypeScript definitions (20+ interfaces)
├── state-manager.ts      # State tracking and persistence
├── capture-agent.ts      # Playwright screenshot capture
├── analyze-agent.ts      # GPT-4o Vision API integration
├── compare-agent.ts      # Iteration delta analysis
├── suggest-agent.ts      # Fix suggestion generation
├── verify-agent.ts       # Safety validation
├── orchestrator.ts       # Main loop controller
├── index.ts             # Entry point and exports
├── run-loop.ts          # CLI script
├── default-rules.json   # Design rule definitions
├── README.md            # This file
└── .state/              # Runtime state (auto-generated)
    ├── loop-state.json     # Current loop state
    └── screenshots/        # Captured screenshots
```

## 🧪 Development

### Run Tests
```bash
# Test individual agents
npm test -- capture-agent.test.ts
npm test -- analyze-agent.test.ts

# Test full loop
npm test -- orchestrator.test.ts
```

### Debug Mode
```bash
# Enable verbose logging
DEBUG=loop-agent:* npm run loop:start

# Capture only (no analysis)
npm run loop:capture

# Analyze existing screenshots
npm run loop:analyze -- .state/screenshots/
```

## 📈 Scoring System

### Overall Score (0-100)
- **95-100**: PASS - Production ready
- **85-94**: WARNING - Minor issues
- **0-84**: FAIL - Major issues

### Issue Severity
- **Critical**: Blocks production (e.g., TRUE BLACK not used)
- **High**: Significant deviation (e.g., wrong spacing grid)
- **Medium**: Minor deviation (e.g., slightly off radius)
- **Low**: Cosmetic (e.g., extra whitespace)

### Confidence Scoring (0-1)
- **0.90-1.0**: Auto-fix safe (rule-based)
- **0.80-0.89**: Auto-fix with caution
- **0.70-0.79**: Manual review recommended
- **0.0-0.69**: Manual fix required

## 🔍 Example Loop Output

```
╔════════════════════════════════════════════════════════════╗
║                   ZZIK DESIGN LOOP AGENT                   ║
║              Linear 2025 Dark Theme Validator              ║
╚════════════════════════════════════════════════════════════╝

🚀 Starting Design Loop Agent...
Mode: semi-auto
Max iterations: 10

============================================================
🔄 ITERATION 1 / 10
============================================================

📸 Step 1/6: Capturing screenshots...
✅ Captured 4 screenshots

🔍 Step 2/6: Analyzing designs...
✅ Analysis complete - Average score: 82.3/100

📊 Step 3/6: Comparing with previous iteration...
✅ Comparison complete - Trend: stagnant

💡 Step 4/6: Generating fix suggestions...
✅ Generated 15 suggestions

✔️  Step 5/6: Verifying suggestions...
✅ Verification complete - 12/15 safe to apply

📋 Step 6/6: Categorizing suggestions...
✅ 12 auto-fix, 3 manual

⏸️  MANUAL APPROVAL REQUIRED
Review the analysis results and decide:
- Average score: 82.3/100
- Issues: 15 total, 2 critical
- Auto-fixable: 12

[... Loop continues ...]

╔════════════════════════════════════════════════════════════╗
║                     LOOP COMPLETED                         ║
╚════════════════════════════════════════════════════════════╝

Exit Reason: success
Total Iterations: 5
Final Score: 96.8/100
Improvements: 23
Regressions: 0

📁 State saved to: design-system/loop-agent/.state/loop-state.json
```

## 🐛 Troubleshooting

### OpenAI API Errors
```
Error: OpenAI API key not configured
```
**Solution:** Add `OPENAI_API_KEY` to `.env.local`

### Playwright Errors
```
Error: Browser not installed
```
**Solution:** Run `npx playwright install chromium`

### Low Scores
```
Average score: 45.2/100 - Many critical issues
```
**Solution:** 
1. Review `LINEAR_MOBILE_ANALYSIS.md` for design rules
2. Check token CSS files in `src/styles/tokens/`
3. Run manual mode first: `npm run loop:manual`

### Rate Limit Errors
```
Error: Rate limit exceeded (429)
```
**Solution:** Loop automatically rate-limits to 1 req/second. If persistent:
- Reduce number of pages
- Increase delay in `analyze-agent.ts`

## 📚 Related Documentation

- `LINEAR_MOBILE_ANALYSIS.md` - Comprehensive Linear analysis
- `LINEAR_ANALYSIS_SUMMARY_KR.md` - Korean summary with key insights
- `src/styles/tokens/` - Design token CSS files
- `design-system/DESIGN_RULES.json` - Full rule definitions

## 🎊 Ready to Start!

```bash
# 1. Configure OpenAI key
echo "OPENAI_API_KEY=sk-proj-YOUR_KEY" >> .env.local

# 2. Start dev server
npm run dev

# 3. Run first loop!
npm run loop:start
```

The system will automatically improve your design through iterative refinement. 루프는 반복실행으로 고도화가되니깐! 🚀
