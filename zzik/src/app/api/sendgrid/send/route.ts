/**
 * SendGrid Email Sending Route
 * POST /api/sendgrid/send
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendGridAPI } from '@/lib/api-clients';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, text, html, templateId, dynamicData } =
      await request.json();

    if (!to) {
      return NextResponse.json(
        { error: 'Recipient email is required' },
        { status: 400 }
      );
    }

    // 템플릿 이메일 발송
    if (templateId) {
      await sendGridAPI.sendTemplateEmail({
        to,
        templateId,
        dynamicData,
      });

      return NextResponse.json({
        success: true,
        message: 'Template email sent successfully',
      });
    }

    // 일반 이메일 발송
    if (!subject || (!text && !html)) {
      return NextResponse.json(
        { error: 'Subject and content (text or html) are required' },
        { status: 400 }
      );
    }

    await sendGridAPI.sendEmail({
      to,
      subject,
      text,
      html,
    });

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (err: any) {
    console.error('SendGrid error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
