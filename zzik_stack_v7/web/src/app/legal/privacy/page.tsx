import Link from "next/link";

export const metadata = {
  title: "개인정보 처리방침 | ZZIK",
  description: "ZZIK 개인정보 처리방침",
};

export default function PrivacyPage() {
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
          
          <h1 className="text-4xl font-bold mb-4">개인정보 처리방침</h1>
          <div className="text-sm text-[var(--color-text-secondary)]">
            <p>버전 1.0 · 시행일: 2025년 10월 18일</p>
            <p className="mt-1">최종 수정일: 2025년 10월 18일</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-10 prose prose-invert max-w-none">
          {/* Introduction */}
          <section className="frosted-light rounded-xl p-8 border border-[var(--color-border-secondary)]">
            <div className="text-[var(--color-text-secondary)] space-y-4">
              <p>
                ZZIK(이하 "회사")는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 
                다음과 같이 개인정보 처리방침을 수립·공개합니다.
              </p>
              <p className="text-[var(--color-text-primary)] font-semibold">
                본 방침은 2025년 10월 18일부터 적용됩니다.
              </p>
            </div>
          </section>

          {/* Section 1 */}
          <section className="frosted-light rounded-xl p-8 border border-[var(--color-border-secondary)]">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">1. 개인정보의 수집 항목 및 방법</h2>
            <div className="text-[var(--color-text-secondary)] space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">수집 항목</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)] mb-2">필수 항목 (Instagram OAuth 연동 시)</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Instagram 사용자 ID</li>
                      <li>사용자 이름 (username)</li>
                      <li>프로필 사진</li>
                      <li>팔로워 수, 팔로잉 수</li>
                      <li>게시물 정보 (이미지, 동영상 URL, 캡션, 업로드 일시)</li>
                      <li>게시물 성과 데이터 (좋아요 수, 댓글 수, 조회 수)</li>
                      <li>계정 유형 (일반, 비즈니스, 크리에이터)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)] mb-2">필수 항목 (TikTok OAuth 연동 시)</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>TikTok 사용자 ID</li>
                      <li>사용자 이름 (username)</li>
                      <li>프로필 사진</li>
                      <li>팔로워 수</li>
                      <li>게시물 정보 (동영상 URL, 설명, 업로드 일시)</li>
                      <li>게시물 성과 데이터 (좋아요 수, 댓글 수, 조회 수, 공유 수)</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium text-[var(--color-text-primary)] mb-2">자동 수집 정보</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>서비스 이용 기록</li>
                      <li>IP 주소 (마지막 옥텟 마스킹 처리)</li>
                      <li>기기 정보 (OS, 브라우저 버전)</li>
                      <li>쿠키 정보 (세션 유지 목적)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">수집 방법</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Instagram OAuth 2.0 인증 절차</li>
                  <li>TikTok OAuth 2.0 인증 절차</li>
                  <li>서비스 이용 과정에서 자동 수집</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="frosted-light rounded-xl p-8 border border-[var(--color-border-secondary)]">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">2. 개인정보의 처리 목적</h2>
            <div className="text-[var(--color-text-secondary)] space-y-4">
              <p className="font-semibold text-[var(--color-accent-primary)]">
                회사는 수집한 개인정보를 다음 목적으로만 사용하며, 용도가 변경될 경우 사전 동의를 구합니다.
              </p>
              <ol className="list-decimal list-inside space-y-3 ml-4">
                <li><strong className="text-[var(--color-text-primary)]">크리에이터 매칭 서비스 제공</strong>
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>지역 기반 크리에이터 추천</li>
                    <li>관심사 및 콘텐츠 스타일 분석</li>
                    <li>팔로워 규모 및 참여도 평가</li>
                  </ul>
                </li>
                <li><strong className="text-[var(--color-text-primary)]">성과 분석 및 리포트 제공</strong>
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>콘텐츠 성과 추이 분석</li>
                    <li>참여율(Engagement Rate) 계산</li>
                    <li>개인화된 인사이트 제공</li>
                  </ul>
                </li>
                <li><strong className="text-[var(--color-text-primary)]">서비스 개선 및 품질 향상</strong>
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>매칭 알고리즘 최적화</li>
                    <li>사용자 경험(UX) 개선</li>
                    <li>서비스 장애 대응</li>
                  </ul>
                </li>
              </ol>
              <div className="bg-[var(--color-surface-elevated)] p-6 rounded-lg border border-[var(--color-border-glow)] mt-6">
                <p className="font-bold text-[var(--color-accent-primary)] mb-2">⚠️ 절대 하지 않는 일:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>제3자에게 개인정보 판매 또는 제공</li>
                  <li>광고 목적의 데이터 활용</li>
                  <li>리타게팅 광고 집행</li>
                  <li>사용자 동의 없는 마케팅 활동</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="frosted-light rounded-xl p-8 border border-[var(--color-border-secondary)]">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">3. 개인정보의 보관 및 보유기간</h2>
            <div className="text-[var(--color-text-secondary)] space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full border border-[var(--color-border-secondary)] text-sm">
                  <thead className="bg-[var(--color-surface-raised)]">
                    <tr>
                      <th className="border border-[var(--color-border-secondary)] px-4 py-3 text-left text-[var(--color-text-primary)]">항목</th>
                      <th className="border border-[var(--color-border-secondary)] px-4 py-3 text-left text-[var(--color-text-primary)]">보유기간</th>
                      <th className="border border-[var(--color-border-secondary)] px-4 py-3 text-left text-[var(--color-text-primary)]">근거</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-[var(--color-border-secondary)] px-4 py-3">회원 정보 (SNS 프로필)</td>
                      <td className="border border-[var(--color-border-secondary)] px-4 py-3">회원 탈퇴 시까지</td>
                      <td className="border border-[var(--color-border-secondary)] px-4 py-3">서비스 제공</td>
                    </tr>
                    <tr>
                      <td className="border border-[var(--color-border-secondary)] px-4 py-3">SNS 게시물 데이터</td>
                      <td className="border border-[var(--color-border-secondary)] px-4 py-3">회원 탈퇴 후 7일</td>
                      <td className="border border-[var(--color-border-secondary)] px-4 py-3">개인정보 처리방침</td>
                    </tr>
                    <tr>
                      <td className="border border-[var(--color-border-secondary)] px-4 py-3">OAuth 토큰</td>
                      <td className="border border-[var(--color-border-secondary)] px-4 py-3">연동 해제 즉시 삭제</td>
                      <td className="border border-[var(--color-border-secondary)] px-4 py-3">보안 정책</td>
                    </tr>
                    <tr>
                      <td className="border border-[var(--color-border-secondary)] px-4 py-3">정산 정보 (미션 수행 내역)</td>
                      <td className="border border-[var(--color-border-secondary)] px-4 py-3">5년</td>
                      <td className="border border-[var(--color-border-secondary)] px-4 py-3">전자상거래법</td>
                    </tr>
                    <tr>
                      <td className="border border-[var(--color-border-secondary)] px-4 py-3">서비스 이용 기록</td>
                      <td className="border border-[var(--color-border-secondary)] px-4 py-3">90일</td>
                      <td className="border border-[var(--color-border-secondary)] px-4 py-3">서비스 개선</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm mt-4">
                <strong>※ 주의:</strong> 회원 탈퇴 시 개인정보는 7일 이내 삭제되나, 법령에 따른 보관 의무가 있는 경우(예: 정산 정보) 해당 기간 동안 보관됩니다. 
                이 경우 개인 식별 정보는 익명화(user_id → NULL)되어 분리 보관됩니다.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="frosted-light rounded-xl p-8 border border-[var(--color-border-secondary)]">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">4. 개인정보의 암호화 및 보안</h2>
            <div className="text-[var(--color-text-secondary)] space-y-4">
              <p>회사는 개인정보를 안전하게 보호하기 위해 다음과 같은 기술적·관리적 조치를 취하고 있습니다:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[var(--color-surface-raised)] p-6 rounded-lg border border-[var(--color-border-secondary)]">
                  <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">🔒 기술적 보호조치</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>AES-256 암호화 알고리즘 적용</li>
                    <li>TLS 1.3 전송 암호화</li>
                    <li>OAuth 토큰 암호화 저장</li>
                    <li>데이터베이스 접근 제어</li>
                    <li>정기적 보안 취약점 점검</li>
                  </ul>
                </div>
                <div className="bg-[var(--color-surface-raised)] p-6 rounded-lg border border-[var(--color-border-secondary)]">
                  <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">👤 관리적 보호조치</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>개인정보 취급자 최소화</li>
                    <li>임직원 대상 교육 실시</li>
                    <li>내부 관리계획 수립 및 시행</li>
                    <li>접근 권한 관리 및 로그 기록</li>
                    <li>비인가자 접근 차단</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="frosted-light rounded-xl p-8 border border-[var(--color-border-secondary)]">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">5. 이용자의 권리 및 행사 방법</h2>
            <div className="text-[var(--color-text-secondary)] space-y-4">
              <p>정보주체(이용자)는 언제든지 다음 권리를 행사할 수 있습니다:</p>
              <ol className="list-decimal list-inside space-y-3 ml-4">
                <li><strong className="text-[var(--color-text-primary)]">개인정보 열람 요구권</strong>: 본인의 개인정보 열람 요청</li>
                <li><strong className="text-[var(--color-text-primary)]">개인정보 정정 요구권</strong>: 잘못된 정보 수정 요청</li>
                <li><strong className="text-[var(--color-text-primary)]">개인정보 삭제 요구권</strong>: 개인정보 삭제 요청 (법령 보관 의무 제외)</li>
                <li><strong className="text-[var(--color-text-primary)]">개인정보 처리정지 요구권</strong>: 일시적 처리 중단 요청</li>
              </ol>
              <div className="bg-[var(--color-accent-primary)]/10 p-6 rounded-lg border border-[var(--color-accent-primary)]/30 mt-6">
                <p className="font-semibold text-[var(--color-text-primary)] mb-3">권리 행사 방법:</p>
                <ul className="space-y-2">
                  <li>• 이메일: <a href="mailto:support@zzik.com" className="text-[var(--color-accent-primary)] hover:underline font-semibold">support@zzik.com</a></li>
                  <li>• 처리 기한: 요청일로부터 <strong className="text-[var(--color-text-primary)]">30일 이내</strong></li>
                  <li>• 본인 확인 절차 후 처리</li>
                </ul>
              </div>
              <p className="text-sm">
                <strong>※ 참고:</strong> 데이터 삭제에 대한 자세한 내용은{" "}
                <Link href="/legal/data-deletion" className="text-[var(--color-accent-primary)] hover:underline font-semibold">
                  데이터 삭제 안내 페이지
                </Link>를 참조하세요.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="frosted-light rounded-xl p-8 border border-[var(--color-border-secondary)]">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">6. 개인정보 보호책임자</h2>
            <div className="text-[var(--color-text-secondary)] space-y-4">
              <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다:</p>
              <div className="bg-[var(--color-surface-raised)] p-6 rounded-lg border border-[var(--color-border-primary)]">
                <dl className="space-y-3">
                  <div>
                    <dt className="font-semibold text-[var(--color-text-primary)]">개인정보 보호책임자</dt>
                    <dd className="ml-4 mt-1">담당 부서: 개발/운영팀</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[var(--color-text-primary)]">연락처</dt>
                    <dd className="ml-4 mt-1">
                      이메일:{" "}
                      <a href="mailto:support@zzik.com" className="text-[var(--color-accent-primary)] hover:underline">
                        support@zzik.com
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
              <p className="text-sm">
                정보주체는 서비스를 이용하면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자에게 문의하실 수 있습니다. 
                회사는 정보주체의 문의에 대해 지체 없이 답변 및 처리해드릴 것입니다.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="frosted-light rounded-xl p-8 border border-[var(--color-border-secondary)]">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">7. 개인정보 처리방침의 변경</h2>
            <div className="text-[var(--color-text-secondary)] space-y-4">
              <p>본 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
              <p className="text-sm">
                <strong>현재 버전:</strong> 1.0<br />
                <strong>최종 개정일:</strong> 2025년 10월 18일<br />
                <strong>시행일:</strong> 2025년 10월 18일
              </p>
            </div>
          </section>

          {/* Contact Section */}
          <section className="frosted-medium rounded-xl p-8 border border-[var(--color-border-primary)]">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">문의하기</h2>
            <div className="text-[var(--color-text-secondary)] space-y-2">
              <p>개인정보 처리와 관련한 문의사항이 있으시면 아래로 연락 주시기 바랍니다:</p>
              <p className="text-[var(--color-text-primary)]">
                <strong>이메일:</strong>{" "}
                <a href="mailto:support@zzik.com" className="text-[var(--color-accent-primary)] hover:underline">
                  support@zzik.com
                </a>
              </p>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-16 pt-8 border-t border-[var(--color-border-secondary)] flex items-center justify-center gap-6 text-sm text-[var(--color-text-tertiary)]">
          <Link href="/legal/terms" className="hover:text-[var(--color-text-primary)] transition-colors">
            이용약관
          </Link>
          <span>·</span>
          <Link href="/legal/data-deletion" className="hover:text-[var(--color-text-primary)] transition-colors">
            데이터 삭제
          </Link>
        </div>
      </div>
    </main>
  );
}
