import Link from "next/link";

export const metadata = {
  title: "데이터 삭제 안내 | ZZIK",
  description: "ZZIK 데이터 삭제 절차 안내",
};

export default function DataDeletionPage() {
  return (
    <main className="min-h-dvh bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#1a1a25]">
      <div className="container mx-auto max-w-4xl px-6 py-16 text-[var(--color-text-primary)]">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[var(--color-accent-primary)] hover:text-[var(--color-accent-hover)] mb-8 transition-colors"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            홈으로
          </Link>
          
          <h1 className="text-4xl font-bold mb-4">데이터 삭제 안내</h1>
          <div className="text-sm text-[var(--color-text-secondary)]">
            <p>최종 수정일: 2025년 10월 18일</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-10 prose prose-invert max-w-none">
          {/* Introduction */}
          <section className="frosted-light rounded-xl p-8 border border-[var(--color-border-secondary)]">
            <div className="text-[var(--color-text-secondary)] space-y-4">
              <p className="text-lg">
                ZZIK는 이용자의 개인정보 자기결정권을 존중합니다. 언제든지 SNS 연동을 해제하고 수집된 데이터를 삭제할 수 있습니다.
              </p>
              <div className="bg-[var(--color-accent-primary)]/10 p-6 rounded-lg border border-[var(--color-accent-primary)]/30">
                <p className="font-semibold text-[var(--color-text-primary)] mb-2">⏱️ 처리 시간</p>
                <p>데이터 삭제 요청 후 <strong className="text-[var(--color-accent-primary)]">영업일 기준 7일 이내</strong>에 완료되며, 완료 시 이메일로 안내드립니다.</p>
              </div>
            </div>
          </section>

          {/* Method 1: In-App */}
          <section className="frosted-light rounded-xl p-8 border border-[var(--color-border-secondary)]">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 size-10 bg-[var(--color-accent-primary)] rounded-full flex items-center justify-center text-white font-bold text-lg">
                1
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
                  방법 1: 앱 내 SNS 연동 해제 (즉시 삭제)
                </h2>
                <p className="text-sm text-[var(--color-text-tertiary)] mt-1">가장 빠르고 간편한 방법</p>
              </div>
            </div>
            
            <div className="text-[var(--color-text-secondary)] space-y-6 mt-6">
              <div>
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-4 text-lg">단계별 절차</h3>
                <ol className="space-y-4">
                  <li className="flex items-start gap-4">
                    <span className="flex-shrink-0 size-8 bg-[var(--color-surface-raised)] rounded-full flex items-center justify-center text-[var(--color-text-primary)] font-semibold border border-[var(--color-border-secondary)]">
                      1
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-[var(--color-text-primary)]">설정 페이지 접속</p>
                      <p className="text-sm mt-1">앱 우측 상단 메뉴 → [설정] 클릭</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start gap-4">
                    <span className="flex-shrink-0 size-8 bg-[var(--color-surface-raised)] rounded-full flex items-center justify-center text-[var(--color-text-primary)] font-semibold border border-[var(--color-border-secondary)]">
                      2
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-[var(--color-text-primary)]">[SNS 연결 관리] 선택</p>
                      <p className="text-sm mt-1">현재 연결된 Instagram/TikTok 계정 확인</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start gap-4">
                    <span className="flex-shrink-0 size-8 bg-[var(--color-surface-raised)] rounded-full flex items-center justify-center text-[var(--color-text-primary)] font-semibold border border-[var(--color-border-secondary)]">
                      3
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-[var(--color-text-primary)]">[연동 해제] 버튼 클릭</p>
                      <p className="text-sm mt-1">해당 SNS 계정 옆의 "연동 해제" 버튼 클릭</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start gap-4">
                    <span className="flex-shrink-0 size-8 bg-[var(--color-surface-raised)] rounded-full flex items-center justify-center text-[var(--color-text-primary)] font-semibold border border-[var(--color-border-secondary)]">
                      4
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-[var(--color-text-primary)]">확인 및 완료</p>
                      <p className="text-sm mt-1">확인 팝업에서 [삭제 확인] 클릭 → 즉시 처리</p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="bg-[var(--color-success)]/10 p-6 rounded-lg border border-[var(--color-success)]/30">
                <p className="font-semibold text-[var(--color-success)] mb-2">✅ 즉시 삭제되는 항목</p>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  <li>OAuth 액세스 토큰 (즉시 폐기)</li>
                  <li>SNS 프로필 정보</li>
                  <li>동기화된 게시물 데이터</li>
                  <li>성과 분석 데이터</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Method 2: Email */}
          <section className="frosted-light rounded-xl p-8 border border-[var(--color-border-secondary)]">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 size-10 bg-[var(--color-accent-primary)] rounded-full flex items-center justify-center text-white font-bold text-lg">
                2
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
                  방법 2: 이메일로 삭제 요청 (7일 이내 처리)
                </h2>
                <p className="text-sm text-[var(--color-text-tertiary)] mt-1">앱 접속이 어려운 경우</p>
              </div>
            </div>
            
            <div className="text-[var(--color-text-secondary)] space-y-6 mt-6">
              <div>
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-4 text-lg">요청 방법</h3>
                <ol className="space-y-4">
                  <li className="flex items-start gap-4">
                    <span className="flex-shrink-0 size-8 bg-[var(--color-surface-raised)] rounded-full flex items-center justify-center text-[var(--color-text-primary)] font-semibold border border-[var(--color-border-secondary)]">
                      1
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-[var(--color-text-primary)]">아래 이메일로 요청서 발송</p>
                      <a 
                        href="mailto:support@zzik.com?subject=데이터%20삭제%20요청&body=안녕하세요,%20ZZIK%20데이터%20삭제를%20요청합니다.%0A%0A1.%20계정%20정보:%20%0A2.%20삭제%20요청%20이유:%20%0A3.%20본인%20확인용%20연락처:"
                        className="text-[var(--color-accent-primary)] hover:underline font-semibold text-lg mt-2 inline-block"
                      >
                        support@zzik.com
                      </a>
                    </div>
                  </li>
                  
                  <li className="flex items-start gap-4">
                    <span className="flex-shrink-0 size-8 bg-[var(--color-surface-raised)] rounded-full flex items-center justify-center text-[var(--color-text-primary)] font-semibold border border-[var(--color-border-secondary)]">
                      2
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-[var(--color-text-primary)]">필수 정보 포함</p>
                      <div className="bg-[var(--color-surface-raised)] p-4 rounded-lg mt-2 text-sm border border-[var(--color-border-secondary)]">
                        <p className="font-semibold text-[var(--color-text-primary)] mb-2">이메일 본문에 반드시 포함할 내용:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li><strong>ZZIK 계정 정보</strong> (로그인 시 사용한 이메일 또는 연동된 SNS 계정명)</li>
                          <li><strong>삭제 요청 이유</strong> (간단히 기재)</li>
                          <li><strong>본인 확인용 연락처</strong> (전화번호 또는 이메일)</li>
                        </ul>
                      </div>
                    </div>
                  </li>
                  
                  <li className="flex items-start gap-4">
                    <span className="flex-shrink-0 size-8 bg-[var(--color-surface-raised)] rounded-full flex items-center justify-center text-[var(--color-text-primary)] font-semibold border border-[var(--color-border-secondary)]">
                      3
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-[var(--color-text-primary)]">본인 확인 절차 진행</p>
                      <p className="text-sm mt-1">본인 확인을 위한 추가 정보 요청 시 협조 부탁드립니다</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start gap-4">
                    <span className="flex-shrink-0 size-8 bg-[var(--color-surface-raised)] rounded-full flex items-center justify-center text-[var(--color-text-primary)] font-semibold border border-[var(--color-border-secondary)]">
                      4
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-[var(--color-text-primary)]">처리 완료 안내 수신</p>
                      <p className="text-sm mt-1">영업일 기준 7일 이내 삭제 완료 후 이메일 안내</p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="bg-[var(--color-warning)]/10 p-6 rounded-lg border border-[var(--color-warning)]/30">
                <p className="font-semibold text-[var(--color-warning)] mb-2">⚠️ 주의사항</p>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  <li>본인 확인 절차가 완료되어야 삭제가 진행됩니다</li>
                  <li>요청일로부터 영업일 기준 7일 이내 처리 (주말·공휴일 제외)</li>
                  <li>삭제 완료 후에는 복구가 불가능합니다</li>
                </ul>
              </div>
            </div>
          </section>

          {/* What Gets Deleted */}
          <section className="frosted-light rounded-xl p-8 border border-[var(--color-border-secondary)]">
            <h2 className="text-2xl font-semibold mb-6 text-[var(--color-text-primary)]">삭제되는 데이터</h2>
            
            <div className="space-y-4">
              <div className="bg-[var(--color-surface-raised)] p-6 rounded-lg border border-[var(--color-border-secondary)]">
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                  <svg className="size-5 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  즉시 삭제
                </h3>
                <ul className="list-disc list-inside space-y-2 text-[var(--color-text-secondary)] ml-6 text-sm">
                  <li>OAuth 액세스 토큰 및 리프레시 토큰</li>
                  <li>SNS 프로필 정보 (이름, 프로필 사진, 팔로워 수 등)</li>
                  <li>동기화된 게시물 데이터 (이미지, 동영상, 캡션 등)</li>
                  <li>게시물 성과 데이터 (좋아요, 댓글, 조회 수 등)</li>
                  <li>매칭 기록 및 추천 데이터</li>
                  <li>서비스 이용 기록 (로그인 기록 등)</li>
                </ul>
              </div>

              <div className="bg-[var(--color-surface-raised)] p-6 rounded-lg border border-[var(--color-border-secondary)]">
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                  <svg className="size-5 text-[var(--color-info)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  법령에 따라 보관되는 데이터 (익명화)
                </h3>
                <ul className="list-disc list-inside space-y-2 text-[var(--color-text-secondary)] ml-6 text-sm">
                  <li>
                    <strong className="text-[var(--color-text-primary)]">정산 정보</strong> (미션 수행 내역, 지급 기록): 
                    전자상거래법에 따라 5년 보관 (개인 식별 정보는 익명화 처리)
                  </li>
                  <li>
                    <strong className="text-[var(--color-text-primary)]">세무 관련 기록</strong>: 
                    국세기본법에 따라 5년 보관
                  </li>
                </ul>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-4">
                  ※ 법령 보관 의무가 있는 데이터는 개인 식별 정보를 제거(user_id → NULL)하여 별도 분리 보관되며, 보관 기간 종료 후 즉시 파기됩니다.
                </p>
              </div>
            </div>
          </section>

          {/* Platform-specific */}
          <section className="frosted-light rounded-xl p-8 border border-[var(--color-border-secondary)]">
            <h2 className="text-2xl font-semibold mb-6 text-[var(--color-text-primary)]">플랫폼별 추가 안내</h2>
            
            <div className="space-y-6">
              <div className="bg-[var(--color-surface-raised)] p-6 rounded-lg border border-[var(--color-border-secondary)]">
                <div className="flex items-start gap-4">
                  <svg className="size-8 text-[var(--color-accent-primary)] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--color-text-primary)] text-lg mb-2">Instagram 데이터 삭제</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                      ZZIK에서 Instagram 연동을 해제하면 ZZIK 서비스 내 데이터가 삭제됩니다. 
                      Instagram 플랫폼 자체의 데이터는 삭제되지 않습니다.
                    </p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      Instagram 측에서도 ZZIK 앱 권한을 해제하려면: Instagram 앱 → [설정] → [보안] → [앱 및 웹사이트] → ZZIK 권한 해제
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--color-surface-raised)] p-6 rounded-lg border border-[var(--color-border-secondary)]">
                <div className="flex items-start gap-4">
                  <svg className="size-8 text-[var(--color-accent-primary)] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--color-text-primary)] text-lg mb-2">TikTok 데이터 삭제</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                      ZZIK에서 TikTok 연동을 해제하면 ZZIK 서비스 내 데이터가 삭제됩니다. 
                      TikTok 플랫폼 자체의 데이터는 삭제되지 않습니다.
                    </p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      TikTok 측에서도 ZZIK 앱 권한을 해제하려면: TikTok 앱 → [프로필] → [설정 및 개인정보] → [보안 및 로그인] → [연결된 앱] → ZZIK 권한 해제
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="frosted-light rounded-xl p-8 border border-[var(--color-border-secondary)]">
            <h2 className="text-2xl font-semibold mb-6 text-[var(--color-text-primary)]">자주 묻는 질문 (FAQ)</h2>
            
            <div className="space-y-4">
              <details className="bg-[var(--color-surface-raised)] p-6 rounded-lg border border-[var(--color-border-secondary)] cursor-pointer group">
                <summary className="font-semibold text-[var(--color-text-primary)] flex items-center justify-between">
                  <span>Q. 데이터 삭제 후 복구할 수 있나요?</span>
                  <svg className="size-5 text-[var(--color-text-tertiary)] group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="text-sm text-[var(--color-text-secondary)] mt-4">
                  아니요, 삭제된 데이터는 복구가 불가능합니다. 삭제 요청 전 신중히 검토해 주시기 바랍니다.
                </p>
              </details>

              <details className="bg-[var(--color-surface-raised)] p-6 rounded-lg border border-[var(--color-border-secondary)] cursor-pointer group">
                <summary className="font-semibold text-[var(--color-text-primary)] flex items-center justify-between">
                  <span>Q. 연동 해제하면 Instagram/TikTok 계정도 삭제되나요?</span>
                  <svg className="size-5 text-[var(--color-text-tertiary)] group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="text-sm text-[var(--color-text-secondary)] mt-4">
                  아니요, ZZIK에서 연동 해제 시 ZZIK 서비스 내 데이터만 삭제됩니다. Instagram/TikTok 계정 자체와 해당 플랫폼의 데이터는 영향을 받지 않습니다.
                </p>
              </details>

              <details className="bg-[var(--color-surface-raised)] p-6 rounded-lg border border-[var(--color-border-secondary)] cursor-pointer group">
                <summary className="font-semibold text-[var(--color-text-primary)] flex items-center justify-between">
                  <span>Q. 데이터 삭제 후 다시 가입할 수 있나요?</span>
                  <svg className="size-5 text-[var(--color-text-tertiary)] group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="text-sm text-[var(--color-text-secondary)] mt-4">
                  네, 언제든지 다시 가입하실 수 있습니다. SNS 계정을 다시 연동하면 새로운 회원으로 등록됩니다. 
                  단, 이전 데이터는 복구되지 않습니다.
                </p>
              </details>

              <details className="bg-[var(--color-surface-raised)} p-6 rounded-lg border border-[var(--color-border-secondary)] cursor-pointer group">
                <summary className="font-semibold text-[var(--color-text-primary)] flex items-center justify-between">
                  <span>Q. 정산 정보는 왜 5년간 보관되나요?</span>
                  <svg className="size-5 text-[var(--color-text-tertiary)] group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="text-sm text-[var(--color-text-secondary)] mt-4">
                  전자상거래법 및 국세기본법에 따라 거래 기록과 세무 관련 정보는 5년간 보관 의무가 있습니다. 
                  단, 개인 식별 정보는 익명화 처리되어 별도 분리 보관되며, 보관 기간 종료 후 즉시 파기됩니다.
                </p>
              </details>
            </div>
          </section>

          {/* Contact Section */}
          <section className="frosted-medium rounded-xl p-8 border border-[var(--color-border-primary)]">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">추가 문의</h2>
            <div className="text-[var(--color-text-secondary)] space-y-4">
              <p>데이터 삭제와 관련하여 추가 문의사항이 있으시면 언제든지 연락 주시기 바랍니다:</p>
              <div className="bg-[var(--color-surface-raised)] p-6 rounded-lg border border-[var(--color-border-secondary)]">
                <p className="text-[var(--color-text-primary)] font-semibold mb-2">이메일 문의</p>
                <a 
                  href="mailto:support@zzik.com?subject=데이터%20삭제%20문의"
                  className="text-[var(--color-accent-primary)] hover:underline text-lg font-semibold"
                >
                  support@zzik.com
                </a>
                <p className="text-sm text-[var(--color-text-tertiary)] mt-3">
                  평일 오전 9시 ~ 오후 6시 (주말/공휴일 제외)<br />
                  영업일 기준 1~2일 내 답변 드립니다
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-16 pt-8 border-t border-[var(--color-border-secondary)] flex items-center justify-center gap-6 text-sm text-[var(--color-text-tertiary)]">
          <Link href="/legal/terms" className="hover:text-[var(--color-text-primary)] transition-colors">
            이용약관
          </Link>
          <span>·</span>
          <Link href="/legal/privacy" className="hover:text-[var(--color-text-primary)] transition-colors">
            개인정보 처리방침
          </Link>
        </div>
      </div>
    </main>
  );
}
