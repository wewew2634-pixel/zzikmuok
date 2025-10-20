import Link from "next/link";

export const metadata = {
  title: "서비스 이용약관 | ZZIK",
  description: "ZZIK 서비스 이용약관",
};

export default function TermsPage() {
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
          
          <h1 className="text-4xl font-bold mb-4">서비스 이용약관</h1>
          <div className="text-sm text-[var(--color-text-secondary)]">
            <p>버전 1.0 · 시행일: 2025년 10월 18일</p>
            <p className="mt-1">최종 수정일: 2025년 10월 18일</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-10 prose prose-invert max-w-none">
          {/* Section 1 */}
          <section className="frosted-light rounded-xl p-8 border border-[var(--color-border-secondary)]">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">제1조 (목적)</h2>
            <div className="text-[var(--color-text-secondary)] space-y-4">
              <p>
                본 약관은 ZZIK(이하 "회사")이 제공하는 로컬 숏폼 크리에이터 매칭 서비스(이하 "서비스")의 이용과 관련하여 
                회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="frosted-light rounded-xl p-8 border border-[var(--color-border-secondary)]">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">제2조 (정의)</h2>
            <div className="text-[var(--color-text-secondary)] space-y-4">
              <ol className="list-decimal list-inside space-y-3">
                <li><strong>"서비스"</strong>란 회사가 제공하는 Instagram, TikTok 계정 연동 기반 로컬 크리에이터 매칭 플랫폼을 의미합니다.</li>
                <li><strong>"이용자"</strong>란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
                <li><strong>"회원"</strong>이란 서비스에 개인정보를 제공하여 회원등록을 한 자로서, 서비스의 정보를 지속적으로 제공받으며, 서비스를 계속하여 이용할 수 있는 자를 말합니다.</li>
                <li><strong>"SNS 연동"</strong>이란 이용자가 Instagram 또는 TikTok 계정을 서비스와 연결하여 프로필, 콘텐츠, 성과 데이터를 동기화하는 것을 의미합니다.</li>
              </ol>
            </div>
          </section>

          {/* Section 3 */}
          <section className="frosted-light rounded-xl p-8 border border-[var(--color-border-secondary)]">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">제3조 (약관의 효력 및 변경)</h2>
            <div className="text-[var(--color-text-secondary)] space-y-4">
              <ol className="list-decimal list-inside space-y-3">
                <li>본 약관은 서비스를 이용하고자 하는 모든 이용자에게 그 효력이 발생합니다.</li>
                <li>회사는 필요하다고 인정되는 경우 관련 법령을 위배하지 않는 범위 내에서 본 약관을 변경할 수 있습니다.</li>
                <li>약관이 변경되는 경우 회사는 변경사항을 시행일로부터 최소 7일 전에 서비스 내 공지사항을 통해 공지합니다.</li>
                <li>이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 회원 탈퇴를 요청할 수 있습니다.</li>
              </ol>
            </div>
          </section>

          {/* Section 4 */}
          <section className="frosted-light rounded-xl p-8 border border-[var(--color-border-secondary)]">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">제4조 (회원가입 및 계정)</h2>
            <div className="text-[var(--color-text-secondary)] space-y-4">
              <ol className="list-decimal list-inside space-y-3">
                <li>회원가입은 Instagram 또는 TikTok OAuth 인증을 통해 진행됩니다.</li>
                <li>이용자는 반드시 본인의 계정을 사용하여야 하며, 타인의 계정을 도용하거나 허위 정보를 입력해서는 안 됩니다.</li>
                <li>회사는 다음 각 호의 경우 회원가입을 거부하거나 승인을 취소할 수 있습니다:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>허위 정보를 기재한 경우</li>
                    <li>만 14세 미만인 경우</li>
                    <li>과거 회원 자격을 상실한 적이 있는 경우</li>
                    <li>기타 관련 법령 또는 본 약관을 위반한 경우</li>
                  </ul>
                </li>
              </ol>
            </div>
          </section>

          {/* Section 5 */}
          <section className="frosted-light rounded-xl p-8 border border-[var(--color-border-secondary)]">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">제5조 (개인정보 및 데이터 사용)</h2>
            <div className="text-[var(--color-text-secondary)] space-y-4">
              <ol className="list-decimal list-inside space-y-3">
                <li>회사는 이용자의 개인정보를 관련 법령 및 개인정보 처리방침에 따라 보호합니다.</li>
                <li>SNS 연동을 통해 수집된 데이터는 <strong>매칭 및 성과 분석 목적으로만 사용</strong>되며, 제3자에게 제공하거나 광고 목적으로 사용하지 않습니다.</li>
                <li>이용자는 언제든지 SNS 연동을 해제하고 데이터 삭제를 요청할 수 있습니다. 자세한 내용은 <Link href="/legal/data-deletion" className="text-[var(--color-accent-primary)] hover:underline">데이터 삭제 안내</Link>를 참조하세요.</li>
              </ol>
            </div>
          </section>

          {/* Section 6 */}
          <section className="frosted-light rounded-xl p-8 border border-[var(--color-border-secondary)]">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">제6조 (금지 행위)</h2>
            <div className="text-[var(--color-text-secondary)] space-y-4">
              <p>이용자는 다음 각 호의 행위를 해서는 안 됩니다:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>허위 정보 등록 또는 타인의 정보 도용</li>
                <li>회사의 서비스를 악용하여 부당한 이익을 취하는 행위</li>
                <li>서비스의 안정적 운영을 방해하는 행위 (해킹, DDoS 공격 등)</li>
                <li>타 이용자를 비방하거나 명예를 훼손하는 행위</li>
                <li>법령 또는 공서양속에 위반되는 행위</li>
                <li>기타 회사가 부적절하다고 판단하는 행위</li>
              </ol>
            </div>
          </section>

          {/* Section 7 */}
          <section className="frosted-light rounded-xl p-8 border border-[var(--color-border-secondary)]">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">제7조 (서비스 제재)</h2>
            <div className="text-[var(--color-text-secondary)] space-y-4">
              <ol className="list-decimal list-inside space-y-3">
                <li>회사는 이용자가 본 약관을 위반한 경우 사전 통지 없이 서비스 이용을 제한하거나 회원 자격을 정지/상실시킬 수 있습니다.</li>
                <li>제재 조치 시 이용자는 이의신청을 할 수 있으며, 회사는 합리적인 사유가 있는 경우 제재를 해제할 수 있습니다.</li>
              </ol>
            </div>
          </section>

          {/* Section 8 */}
          <section className="frosted-light rounded-xl p-8 border border-[var(--color-border-secondary)]">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">제8조 (책임의 한계)</h2>
            <div className="text-[var(--color-text-secondary)] space-y-4">
              <ol className="list-decimal list-inside space-y-3">
                <li>회사는 천재지변, 전쟁, 통신장애 등 불가항력으로 인해 서비스를 제공할 수 없는 경우 책임이 면제됩니다.</li>
                <li>회사는 이용자가 서비스를 통해 얻은 정보나 자료로 인해 발생한 손해에 대해 책임을 지지 않습니다.</li>
                <li>회사는 이용자 간 또는 이용자와 제3자 간 발생한 분쟁에 대해 개입할 의무가 없으며, 이로 인한 손해를 배상할 책임이 없습니다.</li>
              </ol>
            </div>
          </section>

          {/* Section 9 */}
          <section className="frosted-light rounded-xl p-8 border border-[var(--color-border-secondary)]">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">제9조 (분쟁 해결 및 관할)</h2>
            <div className="text-[var(--color-text-secondary)] space-y-4">
              <ol className="list-decimal list-inside space-y-3">
                <li>본 약관과 관련된 분쟁은 대한민국 법령에 따라 해석되고 적용됩니다.</li>
                <li>서비스 이용과 관련하여 회사와 이용자 간 발생한 분쟁에 대해서는 회사의 본사 소재지를 관할하는 법원을 합의 관할 법원으로 합니다.</li>
              </ol>
            </div>
          </section>

          {/* Contact Section */}
          <section className="frosted-medium rounded-xl p-8 border border-[var(--color-border-primary)]">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">문의하기</h2>
            <div className="text-[var(--color-text-secondary)] space-y-2">
              <p>본 약관에 대한 문의사항이 있으시면 아래로 연락 주시기 바랍니다:</p>
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
          <Link href="/legal/privacy" className="hover:text-[var(--color-text-primary)] transition-colors">
            개인정보 처리방침
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
