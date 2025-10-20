import { NextRequest, NextResponse } from "next/server";
import { chromium } from 'playwright';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/design-review
 * Playwright MCP Agent - Auto Screenshot
 */
export async function POST(request: NextRequest) {
  let browser;
  
  try {
    const { url, viewport = { width: 1920, height: 1080 } } = await request.json();

    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox'],
    });

    const page = await (await browser.newContext({ viewport })).newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    const screenshot = await page.screenshot({ fullPage: true, type: 'png' });
    await browser.close();

    return NextResponse.json({
      success: true,
      screenshotBase64: screenshot.toString('base64'),
      viewport,
    });
  } catch (error) {
    if (browser) await browser.close().catch(() => {});
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
