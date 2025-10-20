"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const KOREAN_BANKS = [
  { code: "004", name: "KB국민은행" },
  { code: "088", name: "신한은행" },
  { code: "020", name: "우리은행" },
  { code: "081", name: "하나은행" },
  { code: "003", name: "IBK기업은행" },
  { code: "011", name: "NH농협은행" },
  { code: "023", name: "SC제일은행" },
  { code: "027", name: "한국씨티은행" },
  { code: "031", name: "대구은행" },
  { code: "032", name: "부산은행" },
  { code: "034", name: "광주은행" },
  { code: "035", name: "제주은행" },
  { code: "037", name: "전북은행" },
  { code: "039", name: "경남은행" },
  { code: "045", name: "새마을금고" },
  { code: "048", name: "신협" },
  { code: "071", name: "우체국" },
  { code: "089", name: "케이뱅크" },
  { code: "090", name: "카카오뱅크" },
  { code: "092", name: "토스뱅크" },
];

export default function PayoutPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    bankCode: "",
    accountNumber: "",
    accountHolder: "",
    businessNumber: "",
    payoutMethod: "instant", // instant | scheduled
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bankCode) {
      newErrors.bankCode = "은행을 선택해 주세요";
    }

    if (!formData.accountNumber) {
      newErrors.accountNumber = "계좌번호를 입력해 주세요";
    } else if (!/^\d{10,14}$/.test(formData.accountNumber.replace(/-/g, ""))) {
      newErrors.accountNumber = "올바른 계좌번호 형식이 아닙니다";
    }

    if (!formData.accountHolder) {
      newErrors.accountHolder = "예금주명을 입력해 주세요";
    } else if (formData.accountHolder.length < 2) {
      newErrors.accountHolder = "예금주명은 2자 이상이어야 합니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // TODO: API call to save payout information
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Payout setup error:", error);
      setErrors({
        submit: "정산 계좌 등록 중 오류가 발생했습니다. 다시 시도해 주세요.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Allow skipping but show warning
    if (
      confirm(
        "정산 계좌를 나중에 등록하시겠어요? 계좌 등록 전까지는 정산을 받을 수 없습니다."
      )
    ) {
      router.push("/dashboard");
    }
  };

  return (
    <main className="min-h-dvh bg-[var(--color-surface-base)] text-[var(--color-text-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 h-14 border-b border-[var(--color-border-primary)] backdrop-blur-xl backdrop-saturate-150 bg-[var(--color-surface-base)]/80">
        <div className="container mx-auto max-w-7xl h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-gradient-to-br from-[var(--color-accent-light)] to-[var(--color-accent-hover)] rounded-xl" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)] tracking-tight">
              ZZIK
            </span>
          </div>
          <div className="text-xs text-[var(--color-text-tertiary)]">
            단계 3 / 3
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="sticky top-14 z-40 bg-[var(--color-surface-base)] border-b border-[var(--color-border-primary)]">
        <div className="container mx-auto max-w-3xl px-6 py-3">
          <div className="relative h-2 bg-[var(--color-surface-elevated)] rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-hover)]"
              style={{ width: "100%" }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--color-text-tertiary)] text-center">
            100% 완료
          </p>
        </div>
      </div>

      <section className="container mx-auto max-w-3xl px-6 py-12 space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-semibold text-[var(--color-text-primary)]">
            T+0 정산 계좌를 연결해 주세요
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            승인 즉시 정산이 완료되어 빠르게 수익을 확인할 수 있습니다.
          </p>
        </div>

        {/* Security Banner */}
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="size-5 text-green-500 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-500">
                모든 계좌 정보는 AES-256으로 암호화되어 안전하게 보관됩니다
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                금융 보안 규정을 준수하며, 궁금한 점이 있으면{" "}
                <a
                  href="mailto:support@zzik.kr"
                  className="text-[var(--color-accent-primary)] hover:underline"
                >
                  support@zzik.kr
                </a>
                로 연락하세요.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bank Selection */}
          <div className="p-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-primary)] rounded-xl space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="bankCode"
                className="block text-sm font-medium text-[var(--color-text-primary)]"
              >
                은행명 <span className="text-red-500">*</span>
              </label>
              <select
                id="bankCode"
                value={formData.bankCode}
                onChange={(e) =>
                  setFormData({ ...formData, bankCode: e.target.value })
                }
                className="w-full h-11 px-3 bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] text-sm border border-[var(--color-border-primary)] rounded-lg focus:border-[var(--color-accent-primary)] focus:ring-2 focus:ring-[var(--color-accent-primary)]/20 focus:outline-none"
              >
                <option value="">은행을 선택하세요</option>
                {KOREAN_BANKS.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
              {errors.bankCode && (
                <p className="text-xs text-red-500">{errors.bankCode}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="accountNumber"
                className="block text-sm font-medium text-[var(--color-text-primary)]"
              >
                계좌번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    accountNumber: e.target.value.replace(/[^\d-]/g, ""),
                  })
                }
                placeholder="123-456-789012"
                className="w-full h-11 px-3 bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] text-sm border border-[var(--color-border-primary)] rounded-lg focus:border-[var(--color-accent-primary)] focus:ring-2 focus:ring-[var(--color-accent-primary)]/20 focus:outline-none"
              />
              {errors.accountNumber && (
                <p className="text-xs text-red-500">{errors.accountNumber}</p>
              )}
              <p className="text-xs text-[var(--color-text-tertiary)]">
                하이픈(-)은 자동으로 입력됩니다
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="accountHolder"
                className="block text-sm font-medium text-[var(--color-text-primary)]"
              >
                예금주명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="accountHolder"
                value={formData.accountHolder}
                onChange={(e) =>
                  setFormData({ ...formData, accountHolder: e.target.value })
                }
                placeholder="홍길동 또는 상호명"
                className="w-full h-11 px-3 bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] text-sm border border-[var(--color-border-primary)] rounded-lg focus:border-[var(--color-accent-primary)] focus:ring-2 focus:ring-[var(--color-accent-primary)]/20 focus:outline-none"
              />
              {errors.accountHolder && (
                <p className="text-xs text-red-500">{errors.accountHolder}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="businessNumber"
                className="block text-sm font-medium text-[var(--color-text-primary)]"
              >
                사업자등록번호 <span className="text-[var(--color-text-tertiary)]">(선택)</span>
              </label>
              <input
                type="text"
                id="businessNumber"
                value={formData.businessNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    businessNumber: e.target.value.replace(/[^\d-]/g, ""),
                  })
                }
                placeholder="123-45-67890"
                className="w-full h-11 px-3 bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] text-sm border border-[var(--color-border-primary)] rounded-lg focus:border-[var(--color-accent-primary)] focus:ring-2 focus:ring-[var(--color-accent-primary)]/20 focus:outline-none"
              />
              <p className="text-xs text-[var(--color-text-tertiary)]">
                사업자인 경우 세금계산서 발행에 필요합니다
              </p>
            </div>
          </div>

          {/* Payout Method */}
          <div className="p-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-primary)] rounded-xl space-y-4">
            <label className="block text-sm font-medium text-[var(--color-text-primary)]">
              정산 방식
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors hover:border-[var(--color-accent-primary)]/30">
                <input
                  type="radio"
                  name="payoutMethod"
                  value="instant"
                  checked={formData.payoutMethod === "instant"}
                  onChange={(e) =>
                    setFormData({ ...formData, payoutMethod: e.target.value })
                  }
                  className="mt-0.5 size-4 text-[var(--color-accent-primary)] focus:ring-2 focus:ring-[var(--color-accent-primary)]/20"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    즉시 정산 (T+0) <span className="text-[var(--color-accent-primary)]">권장</span>
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    승인 완료 시 당일 정산됩니다. 수수료 없음.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors hover:border-[var(--color-accent-primary)]/30">
                <input
                  type="radio"
                  name="payoutMethod"
                  value="scheduled"
                  checked={formData.payoutMethod === "scheduled"}
                  onChange={(e) =>
                    setFormData({ ...formData, payoutMethod: e.target.value })
                  }
                  className="mt-0.5 size-4 text-[var(--color-accent-primary)] focus:ring-2 focus:ring-[var(--color-accent-primary)]/20"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    예약 정산 (매주 금요일)
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    주간 정산액을 합산하여 매주 금요일에 일괄 지급합니다.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-500">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex h-12 items-center justify-center rounded-lg px-8 font-medium transition-all duration-200 active:scale-[0.98] ${
                isSubmitting
                  ? "bg-[var(--color-surface-elevated)] border border-[var(--color-border-primary)] text-[var(--color-text-tertiary)] cursor-not-allowed"
                  : "bg-[var(--color-accent-primary)] text-[oklch(10%_0_0)] hover:bg-[var(--color-accent-hover)]"
              }`}
            >
              {isSubmitting ? "등록 중..." : "정산 계좌 연결 완료"}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-surface-base)] px-6 text-sm font-medium text-[var(--color-text-secondary)] transition-all duration-200 hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]/50 active:scale-[0.98]"
            >
              나중에 입력하기
            </button>

            <p className="text-xs text-[var(--color-text-tertiary)] text-center">
              계좌 정보는 대시보드 설정에서 언제든 변경할 수 있습니다.
            </p>
          </div>
        </form>
      </section>

      <footer className="container mx-auto max-w-7xl px-6 py-12 text-[var(--color-text-tertiary)] text-sm text-center">
        © ZZIK — local short-form missions
      </footer>
    </main>
  );
}
