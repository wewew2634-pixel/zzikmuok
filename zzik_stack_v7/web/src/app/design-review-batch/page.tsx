'use client';

import { useState } from 'react';

interface PageAnalysis {
  path: string;
  name: string;
  score: number;
  passed: boolean;
  issues: Array<{
    category: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    message: string;
  }>;
}

interface BatchResult {
  success: boolean;
  totalPages: number;
  averageScore: number;
  passRate: number;
  pages: PageAnalysis[];
  summary: {
    totalIssues: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  reportPath?: string;
  error?: string;
}

export default function BatchDesignReview() {
  const [baseUrl, setBaseUrl] = useState('http://localhost:3001');
  const [strict, setStrict] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BatchResult | null>(null);

  const handleBatchReview = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/design-review/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl,
          viewport: { width: 1920, height: 1080 },
          strict,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        totalPages: 0,
        averageScore: 0,
        passRate: 0,
        pages: [],
        summary: { totalIssues: 0, critical: 0, high: 0, medium: 0, low: 0 },
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-width-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-zinc-200 rounded-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 mb-2">
            🎨 전체 페이지 통괄 디자인 검증
          </h1>
          <p className="text-zinc-600">
            GPT-4o Vision • Playwright MCP • 배치 처리 • WCAG 2.1 AA
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-900 mb-2">
                Base URL
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full h-12 px-4 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                placeholder="http://localhost:3001"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="strict-batch"
                checked={strict}
                onChange={(e) => setStrict(e.target.checked)}
                className="w-5 h-5 rounded border-zinc-200 text-indigo-600"
              />
              <label htmlFor="strict-batch" className="text-sm font-medium text-zinc-900">
                Strict Mode (95/100 required per page)
              </label>
            </div>

            <button
              onClick={handleBatchReview}
              disabled={loading}
              className="w-full h-14 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:bg-zinc-300 transition-colors"
            >
              {loading ? '🔄 전체 페이지 검증 중...' : '🚀 전체 페이지 검증 시작'}
            </button>

            {loading && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="text-sm text-indigo-900">
                  ⏳ 예상 소요 시간: 약 2-3분 (페이지 수에 따라 변동)
                </div>
                <div className="text-xs text-indigo-700 mt-2">
                  • 전체 페이지 스크린샷 캡처 중...<br />
                  • GPT-4o Vision AI 분석 중...<br />
                  • 통괄 리포트 생성 중...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {result && result.success && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div
              className={`border-2 rounded-xl p-8 ${
                result.passRate >= 80
                  ? 'bg-green-50 border-green-500'
                  : result.passRate >= 60
                  ? 'bg-yellow-50 border-yellow-500'
                  : 'bg-red-50 border-red-500'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-zinc-900 mb-2">
                    전체 통괄 결과
                  </h2>
                  <p className="text-zinc-600">
                    {result.totalPages}개 페이지 검증 완료
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-6xl font-bold text-zinc-900">
                    {Math.round(result.averageScore)}
                  </div>
                  <div className="text-xl text-zinc-600">평균 점수</div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round(result.passRate)}%
                  </div>
                  <div className="text-sm text-zinc-600 mt-1">Pass Rate</div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {result.pages.filter(p => p.passed).length}/{result.totalPages}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {result.summary.critical}
                  </div>
                  <div className="text-sm text-zinc-600 mt-1">Critical</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {result.summary.high}
                  </div>
                  <div className="text-sm text-zinc-600 mt-1">High</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {result.summary.medium}
                  </div>
                  <div className="text-sm text-zinc-600 mt-1">Medium</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {result.summary.low}
                  </div>
                  <div className="text-sm text-zinc-600 mt-1">Low</div>
                </div>
              </div>

              {result.reportPath && (
                <div className="mt-6 bg-white rounded-lg p-4">
                  <div className="text-sm font-semibold text-zinc-900 mb-2">
                    📄 상세 HTML 리포트 생성됨
                  </div>
                  <div className="text-xs text-zinc-600 font-mono">
                    {result.reportPath}
                  </div>
                </div>
              )}
            </div>

            {/* Page Grid */}
            <div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">
                📋 페이지별 상세 결과
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.pages.map((page, idx) => (
                  <div
                    key={idx}
                    className={`bg-white border-l-4 rounded-lg p-6 ${
                      page.passed
                        ? 'border-green-500'
                        : 'border-red-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-zinc-900">
                          {page.name}
                        </h4>
                        <p className="text-xs text-zinc-500 mt-1">
                          {page.path}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${
                          page.passed ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {page.score}
                        </div>
                        <div className="text-xs text-zinc-600">/100</div>
                      </div>
                    </div>

                    {page.issues.length > 0 ? (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-zinc-600">
                          Issues ({page.issues.length})
                        </div>
                        {page.issues.slice(0, 2).map((issue, i) => (
                          <div key={i} className="text-xs">
                            <span
                              className={`px-2 py-0.5 rounded-full font-semibold ${
                                issue.severity === 'critical'
                                  ? 'bg-red-100 text-red-700'
                                  : issue.severity === 'high'
                                  ? 'bg-orange-100 text-orange-700'
                                  : issue.severity === 'medium'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {issue.severity}
                            </span>
                            <div className="text-zinc-700 mt-1">
                              {issue.message}
                            </div>
                          </div>
                        ))}
                        {page.issues.length > 2 && (
                          <div className="text-xs text-zinc-500">
                            + {page.issues.length - 2} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-green-600 font-semibold">
                        ✅ No issues found
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {result && !result.success && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-red-900 mb-2">
              ❌ Error
            </h3>
            <p className="text-red-700">{result.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
