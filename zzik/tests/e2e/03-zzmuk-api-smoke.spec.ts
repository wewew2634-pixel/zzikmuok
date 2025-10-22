/**
 * ZZMUK API Smoke Tests
 *
 * Spec A: /checkout without Idempotency-Key → 400
 * Spec B: checkout → webhook → redeem(200) → redeem again (409)
 *
 * Critical invariants:
 * - Idempotency-Key REQUIRED for checkout
 * - QR tokens are single-use only
 * - Proper HTTP status codes enforced
 */

import { test, expect } from '@playwright/test';

// Test server base URL (assumes MCP server running on localhost:8080)
const API_BASE = process.env.API_BASE_URL || 'http://localhost:8080';

test.describe('ZZMUK API - Smoke Tests', () => {
  test('[Spec A] POST /checkout without Idempotency-Key should return 400', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/v1/checkout`, {
      data: {
        offer_id: 'offer_test_1',
        amount: 15000,
        return_url: 'https://example.com/return'
      }
    });

    // Spec enforcement: MUST return 400
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('IDEMPOTENCY_KEY_REQUIRED');
    expect(body.message).toContain('Idempotency-Key');
  });

  test('[Spec B] Full flow: checkout → webhook → redeem → duplicate redeem (409)', async ({ request }) => {
    const idempotencyKey = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Step 1: Checkout with Idempotency-Key
    const checkoutResponse = await request.post(`${API_BASE}/api/v1/checkout`, {
      headers: {
        'Idempotency-Key': idempotencyKey
      },
      data: {
        offer_id: 'offer_test_1',
        amount: 15000,
        return_url: 'https://example.com/return'
      }
    });

    expect(checkoutResponse.status()).toBe(200);
    const checkoutBody = await checkoutResponse.json();
    expect(checkoutBody.success).toBe(true);
    expect(checkoutBody.session_id).toBeTruthy();
    expect(checkoutBody.redirect_url).toBeTruthy();

    const sessionId = checkoutBody.session_id;

    // Step 2: Simulate payment gateway webhook (CAPTURED status)
    const webhookResponse = await request.post(`${API_BASE}/api/v1/pg/webhook`, {
      data: {
        session_id: sessionId,
        status: 'CAPTURED',
        amount: 15000,
        payment_id: `pay_${Date.now()}`
      }
    });

    expect(webhookResponse.status()).toBe(200);
    const webhookBody = await webhookResponse.json();
    expect(webhookBody.action).toBe('qr_issued');
    expect(webhookBody.qr_token).toBeTruthy();

    const qrToken = webhookBody.qr_token;

    // Step 3: First redeem (should succeed with 200)
    const redeemResponse1 = await request.post(`${API_BASE}/api/v1/redeem`, {
      data: {
        qr_token: qrToken,
        merchant_location: 'merchant_001'
      }
    });

    expect(redeemResponse1.status()).toBe(200);
    const redeemBody1 = await redeemResponse1.json();
    expect(redeemBody1.success).toBe(true);
    expect(redeemBody1.session_id).toBe(sessionId);

    // Step 4: Second redeem attempt (MUST return 409 - already used)
    const redeemResponse2 = await request.post(`${API_BASE}/api/v1/redeem`, {
      data: {
        qr_token: qrToken,
        merchant_location: 'merchant_001'
      }
    });

    // Spec enforcement: Single-use constraint → 409 Conflict
    expect(redeemResponse2.status()).toBe(409);
    const redeemBody2 = await redeemResponse2.json();
    expect(redeemBody2.error).toBe('TOKEN_ALREADY_USED');
    expect(redeemBody2.used_at).toBeTruthy();
  });

  test('Idempotent checkout: same key returns same session', async ({ request }) => {
    const idempotencyKey = `idem_${Date.now()}`;

    // First request
    const response1 = await request.post(`${API_BASE}/api/v1/checkout`, {
      headers: {
        'Idempotency-Key': idempotencyKey
      },
      data: {
        offer_id: 'offer_test_2',
        amount: 20000,
        return_url: 'https://example.com/return'
      }
    });

    expect(response1.status()).toBe(200);
    const body1 = await response1.json();
    const sessionId1 = body1.session_id;

    // Second request with SAME key
    const response2 = await request.post(`${API_BASE}/api/v1/checkout`, {
      headers: {
        'Idempotency-Key': idempotencyKey
      },
      data: {
        offer_id: 'offer_test_2',
        amount: 20000,
        return_url: 'https://example.com/return'
      }
    });

    expect(response2.status()).toBe(200);
    const body2 = await response2.json();

    // MUST return same session ID (idempotent replay)
    expect(body2.session_id).toBe(sessionId1);
    expect(body2.idempotent_replay).toBe(true);
  });

  test('Webhook ignores non-CAPTURED status', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/v1/pg/webhook`, {
      data: {
        session_id: 'cs_test_123',
        status: 'PENDING',
        amount: 10000,
        payment_id: 'pay_test'
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.received).toBe(true);
    expect(body.action).toBe('ignored');
    expect(body.qr_token).toBeUndefined(); // No QR issued for non-CAPTURED
  });

  test('GET /api/v1/feed returns filtered offers', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/feed`, {
      params: {
        lat: 37.5441,
        lng: 127.0557,
        lang: 'ko',
        budget_min: 10000,
        budget_max: 30000
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.offers).toBeDefined();
    expect(Array.isArray(body.offers)).toBe(true);
    expect(body.filters_applied.radius_km).toBe(3.0);
  });
});
