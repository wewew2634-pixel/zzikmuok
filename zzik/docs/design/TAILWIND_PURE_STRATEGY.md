# 🎯 Tailwind Plus CSS 100% 전략: Linear 2025 스타일 구현

> **핵심 원칙**: 커스텀 CSS 0%, Tailwind 유틸리티 클래스 100%

## 📐 Phase 1: Tailwind v4 @theme 토큰 정의 (tokens.css)

### A. 색상 시스템 (LCH 기반)

```css
/* src/styles/tokens.css */
@import 'tailwindcss';

@theme {
  /* === Surface Colors (LCH) === */
  --color-surface-base: oklch(12% 0.02 240);
  --color-surface-raised: oklch(15% 0.02 240);
  --color-surface-elevated: oklch(18% 0.02 240);
  --color-surface-overlay: oklch(20% 0.02 240 / 0.95);
  
  /* === Text Colors === */
  --color-text-primary: oklch(95% 0 0);
  --color-text-secondary: oklch(70% 0 0);
  --color-text-tertiary: oklch(50% 0 0);
  --color-text-disabled: oklch(35% 0 0);
  
  /* === Accent (Emerald for ZZIK) === */
  --color-accent-primary: oklch(71% 0.15 166);
  --color-accent-hover: oklch(67% 0.15 166);
  --color-accent-active: oklch(63% 0.15 166);
  --color-accent-bg: oklch(71% 0.15 166 / 0.15);
  
  /* === Borders & Dividers === */
  --color-border-primary: oklch(95% 0 0 / 0.08);
  --color-border-secondary: oklch(95% 0 0 / 0.05);
  --color-divider: oklch(95% 0 0 / 0.06);
  
  /* === Shadows (OKLCH Black) === */
  --shadow-color: oklch(0% 0 0);
  
  /* === Typography === */
  --font-display: 'Inter Display', -apple-system, system-ui, sans-serif;
  --font-sans: 'Inter', -apple-system, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', monospace;
  
  /* === Font Sizes (픽셀 퍼펙션) === */
  --text-2xs: 0.6875rem;   /* 11px */
  --text-xs: 0.8125rem;    /* 13px */
  --text-sm: 0.9375rem;    /* 15px - Linear base */
  --text-base: 1rem;       /* 16px */
  --text-md: 1.0625rem;    /* 17px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.3125rem;    /* 21px */
  --text-2xl: 1.625rem;    /* 26px */
  --text-3xl: 2rem;        /* 32px */
  --text-4xl: 2.5rem;      /* 40px */
  --text-5xl: 3.125rem;    /* 50px */
  
  /* === Line Heights === */
  --leading-tighter: 1.1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
  
  /* === Letter Spacing === */
  --tracking-tighter: -0.03em;
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.02em;
  --tracking-wider: 0.04em;
  
  /* === Spacing (8pt Grid) === */
  --spacing-px: 1px;
  --spacing-0_5: 0.125rem;  /* 2px */
  --spacing-1: 0.25rem;     /* 4px */
  --spacing-1_5: 0.375rem;  /* 6px */
  --spacing-2: 0.5rem;      /* 8px ← 8pt base */
  --spacing-2_5: 0.625rem;  /* 10px */
  --spacing-3: 0.75rem;     /* 12px */
  --spacing-3_5: 0.875rem;  /* 14px */
  --spacing-4: 1rem;        /* 16px */
  --spacing-5: 1.25rem;     /* 20px */
  --spacing-6: 1.5rem;      /* 24px */
  --spacing-7: 1.75rem;     /* 28px */
  --spacing-8: 2rem;        /* 32px */
  --spacing-9: 2.25rem;     /* 36px */
  --spacing-10: 2.5rem;     /* 40px */
  --spacing-11: 2.75rem;    /* 44px */
  --spacing-12: 3rem;       /* 48px */
  --spacing-14: 3.5rem;     /* 56px */
  --spacing-16: 4rem;       /* 64px */
  --spacing-20: 5rem;       /* 80px */
  --spacing-24: 6rem;       /* 96px */
  --spacing-32: 8rem;       /* 128px */
  
  /* === Border Radius === */
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-DEFAULT: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;
  --radius-3xl: 24px;
  --radius-4xl: 32px;
  --radius-full: 9999px;
  
  /* === Shadows === */
  --shadow-xs: 0 1px 2px var(--shadow-color) / 0.05;
  --shadow-sm: 0 1px 3px var(--shadow-color) / 0.08, 
               0 1px 2px var(--shadow-color) / 0.06;
  --shadow-DEFAULT: 0 4px 6px var(--shadow-color) / 0.05, 
                    0 2px 4px var(--shadow-color) / 0.04;
  --shadow-md: 0 4px 6px var(--shadow-color) / 0.05, 
               0 2px 4px var(--shadow-color) / 0.04;
  --shadow-lg: 0 10px 15px var(--shadow-color) / 0.08, 
               0 4px 6px var(--shadow-color) / 0.05;
  --shadow-xl: 0 20px 25px var(--shadow-color) / 0.10, 
               0 10px 10px var(--shadow-color) / 0.04;
  --shadow-2xl: 0 25px 50px var(--shadow-color) / 0.15;
  
  /* === Animation Durations === */
  --duration-instant: 0ms;
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
  
  /* === Easing Functions === */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}

/* === Light Mode Override === */
:root:not(.dark) {
  --color-surface-base: oklch(100% 0 0);
  --color-surface-raised: oklch(98% 0 0);
  --color-surface-elevated: oklch(96% 0 0);
  --color-text-primary: oklch(15% 0.02 240);
  --color-text-secondary: oklch(40% 0 0);
  --color-text-tertiary: oklch(60% 0 0);
  --color-border-primary: oklch(0% 0 0 / 0.08);
  --color-accent-primary: oklch(55% 0.15 166);
}

/* === Global Resets === */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* === Selection === */
::selection {
  background-color: oklch(71% 0.15 166 / 0.25);
}

/* === Focus Visible === */
:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}
```

---

## 🎨 Phase 2: Tailwind 클래스 패턴 라이브러리

### A. 색상 클래스 (100% Tailwind)

```tsx
/* Background Colors */
bg-[var(--color-surface-base)]         // 기본 배경
bg-[var(--color-surface-raised)]       // 약간 상승
bg-[var(--color-surface-elevated)]     // 카드/모달
bg-[var(--color-accent-primary)]       // CTA 버튼
bg-[var(--color-accent-bg)]            // 배경 강조

/* Text Colors */
text-[var(--color-text-primary)]       // 주요 텍스트
text-[var(--color-text-secondary)]     // 보조 텍스트
text-[var(--color-text-tertiary)]      // 비활성 텍스트

/* Border Colors */
border-[var(--color-border-primary)]   // 기본 테두리
border-[var(--color-border-secondary)] // 미묘한 테두리
```

### B. Glass Morphism (Tailwind 조합)

```tsx
/* Glass Card - Tailwind만으로 구현 */
<div className="
  bg-[var(--color-surface-elevated)]/75
  backdrop-blur-2xl
  backdrop-saturate-150
  border
  border-[var(--color-border-primary)]
  rounded-3xl
  shadow-lg
  p-6
">
  {/* Content */}
</div>
```

### C. 그라디언트 패턴

```tsx
/* Emerald Gradient Background */
<div className="
  bg-[radial-gradient(ellipse_at_top,oklch(18%_0.1_240),oklch(12%_0.02_240))]
">

/* Text Gradient */
<span className="
  bg-gradient-to-r
  from-[var(--color-accent-primary)]
  to-[oklch(67%_0.15_166)]
  bg-clip-text
  text-transparent
">
  즉시 매칭
</span>

/* Glow Effect (Hover) */
<div className="
  hover:shadow-[0_0_16px_var(--color-accent-primary)]
  transition-shadow
  duration-300
">
```

### D. Hairline Dividers (Tailwind Pseudo)

```tsx
/* Horizontal Hairline */
<div className="
  relative
  after:content-['']
  after:absolute
  after:left-0
  after:right-0
  after:bottom-0
  after:h-px
  after:bg-gradient-to-r
  after:from-transparent
  after:via-[var(--color-border-primary)]
  after:to-transparent
">

/* Vertical Hairline */
<div className="
  relative
  after:content-['']
  after:absolute
  after:top-0
  after:bottom-0
  after:right-0
  after:w-px
  after:bg-gradient-to-b
  after:from-transparent
  after:via-[var(--color-border-primary)]
  after:to-transparent
">
```

### E. 애니메이션 (Tailwind Arbitrary)

```tsx
/* Pulse Animation */
<div className="
  animate-[pulse_2s_ease-in-out_infinite]
">

/* Fade In Up */
<div className="
  animate-[fadeInUp_0.6s_ease-out]
">

/* Skeleton Loading */
<div className="
  animate-pulse
  bg-[var(--color-surface-elevated)]
  rounded-lg
">
```

---

## 🏗️ Phase 3: 컴포넌트 패턴 (순수 Tailwind)

### A. Button Variants

```tsx
/* Primary Button */
<button className="
  inline-flex items-center gap-2
  h-10 px-4
  bg-[var(--color-accent-primary)]
  text-[oklch(10%_0_0)]
  font-medium
  rounded-lg
  shadow-sm
  hover:bg-[var(--color-accent-hover)]
  hover:shadow-md
  active:scale-[0.98]
  transition-all duration-200
">
  무료로 시작
</button>

/* Secondary Button */
<button className="
  inline-flex items-center gap-2
  h-10 px-4
  bg-[var(--color-surface-elevated)]
  text-[var(--color-text-primary)]
  font-medium
  rounded-lg
  border border-[var(--color-border-primary)]
  hover:bg-[var(--color-surface-elevated)]/80
  hover:border-[var(--color-border-primary)]/50
  active:scale-[0.98]
  transition-all duration-200
">
  라이브 데모
</button>

/* Ghost Button */
<button className="
  inline-flex items-center gap-2
  h-10 px-4
  bg-transparent
  text-[var(--color-text-secondary)]
  font-medium
  rounded-lg
  hover:bg-[var(--color-surface-raised)]
  hover:text-[var(--color-text-primary)]
  active:scale-[0.98]
  transition-all duration-200
">
  더 알아보기
</button>
```

### B. Input Fields

```tsx
/* Text Input */
<input
  type="text"
  className="
    w-full
    h-10
    px-3
    bg-[var(--color-surface-elevated)]
    text-[var(--color-text-primary)]
    text-sm
    border border-[var(--color-border-primary)]
    rounded-lg
    placeholder:text-[var(--color-text-tertiary)]
    focus:border-[var(--color-accent-primary)]
    focus:ring-2
    focus:ring-[var(--color-accent-primary)]/20
    focus:outline-none
    transition-all duration-200
  "
  placeholder="이메일 주소"
/>

/* Textarea */
<textarea
  className="
    w-full
    min-h-[120px]
    px-3 py-2
    bg-[var(--color-surface-elevated)]
    text-[var(--color-text-primary)]
    text-sm
    border border-[var(--color-border-primary)]
    rounded-lg
    placeholder:text-[var(--color-text-tertiary)]
    focus:border-[var(--color-accent-primary)]
    focus:ring-2
    focus:ring-[var(--color-accent-primary)]/20
    focus:outline-none
    resize-none
    transition-all duration-200
  "
  placeholder="메시지 입력..."
/>
```

### C. Card Variants

```tsx
/* Default Card */
<article className="
  p-6
  bg-[var(--color-surface-elevated)]
  border border-[var(--color-border-primary)]
  rounded-xl
  shadow-md
  hover:shadow-lg
  transition-shadow duration-300
">

/* Glass Card */
<article className="
  p-6
  bg-[var(--color-surface-elevated)]/75
  backdrop-blur-2xl
  backdrop-saturate-150
  border border-[var(--color-border-primary)]
  rounded-2xl
  shadow-lg
">

/* Elevated Card (Hover Effect) */
<article className="
  group
  p-6
  bg-[var(--color-surface-elevated)]
  border border-[var(--color-border-primary)]
  rounded-xl
  shadow-md
  hover:border-[var(--color-border-primary)]/50
  hover:-translate-y-0.5
  hover:shadow-xl
  transition-all duration-300
">
```

### D. Badge Components

```tsx
/* Status Badge */
<span className="
  inline-flex items-center gap-1.5
  px-2.5 py-1
  bg-[var(--color-accent-bg)]
  text-[var(--color-accent-primary)]
  text-xs font-medium
  rounded-full
  border border-[var(--color-accent-primary)]/20
">
  <span className="size-1.5 rounded-full bg-[var(--color-accent-primary)] animate-pulse" />
  실시간
</span>

/* Info Badge */
<span className="
  inline-flex items-center gap-1
  px-2 py-0.5
  bg-[var(--color-surface-elevated)]
  text-[var(--color-text-secondary)]
  text-xs font-medium
  rounded-full
  border border-[var(--color-border-primary)]
">
  3km · 오늘 정산
</span>
```

---

## 📄 Phase 4: 섹션 레이아웃 (순수 Tailwind)

### A. Navigation Header

```tsx
<header className="
  sticky top-0 z-50
  h-14
  border-b border-[var(--color-border-primary)]
  backdrop-blur-xl
  backdrop-saturate-150
  bg-[var(--color-surface-base)]/80
">
  <div className="
    container mx-auto max-w-7xl
    h-full px-6
    flex items-center justify-between
  ">
    {/* Logo */}
    <div className="flex items-center gap-3">
      <div className="
        size-8
        bg-gradient-to-br
        from-[var(--color-accent-primary)]
        to-[oklch(67%_0.15_166)]
        rounded-xl
      " />
      <span className="text-sm font-semibold text-[var(--color-text-primary)] tracking-tight">
        ZZIK
      </span>
    </div>
    
    {/* Navigation */}
    <nav className="hidden md:flex items-center gap-6">
      <a className="
        text-sm text-[var(--color-text-secondary)]
        hover:text-[var(--color-text-primary)]
        transition-colors duration-200
      " href="#features">
        Features
      </a>
      <a className="
        text-sm text-[var(--color-text-secondary)]
        hover:text-[var(--color-text-primary)]
        transition-colors duration-200
      " href="#showcase">
        Showcase
      </a>
      <button className="
        h-9 px-4
        bg-[var(--color-accent-primary)]
        text-[oklch(10%_0_0)]
        text-sm font-medium
        rounded-lg
        hover:bg-[var(--color-accent-hover)]
        active:scale-[0.98]
        transition-all duration-200
      ">
        시작하기
      </button>
    </nav>
  </div>
</header>
```

### B. Hero Section (Linear Style)

```tsx
<section className="
  relative
  min-h-[600px]
  flex items-center
  overflow-hidden
  bg-[radial-gradient(ellipse_at_top,oklch(18%_0.1_240),oklch(12%_0.02_240))]
">
  {/* Noise Texture Overlay */}
  <div className="
    absolute inset-0 -z-10
    opacity-[0.03]
    [background-image:url('data:image/svg+xml;base64,...')]
    mix-blend-overlay
    pointer-events-none
  " />
  
  <div className="container mx-auto max-w-7xl px-6 py-20">
    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
      {/* Left Content */}
      <div className="md:col-span-5 space-y-6">
        {/* Badge */}
        <div className="
          inline-flex items-center gap-2
          px-3 py-1.5
          bg-[var(--color-surface-elevated)]
          border border-[var(--color-border-primary)]
          rounded-full
        ">
          <div className="size-1.5 rounded-full bg-[var(--color-accent-primary)] animate-pulse" />
          <span className="text-xs text-[var(--color-text-secondary)]">
            3km · 오늘 정산
          </span>
        </div>
        
        {/* Headline */}
        <h1 className="
          font-[var(--font-display)] font-semibold
          text-5xl md:text-6xl
          leading-[1.1]
          tracking-[-0.02em]
          text-[var(--color-text-primary)]
        ">
          로컬 숏폼{' '}
          <span className="
            bg-gradient-to-r
            from-[oklch(75%_0.15_166)]
            to-[oklch(67%_0.15_166)]
            bg-clip-text
            text-transparent
          ">
            즉시 매칭
          </span>
        </h1>
        
        {/* Description */}
        <p className="
          text-lg
          leading-relaxed
          text-[var(--color-text-secondary)]
          max-w-prose
        ">
          찍고 올리고 승인되면 바로 정산. ZZIK은 근처 크리에이터와 상점을 5분 내 연결합니다.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex items-center gap-4">
          <button className="
            h-12 px-6
            bg-[var(--color-accent-primary)]
            text-[oklch(10%_0_0)]
            font-medium
            rounded-lg
            shadow-md
            hover:bg-[var(--color-accent-hover)]
            hover:shadow-lg
            active:scale-[0.98]
            transition-all duration-200
          ">
            무료로 시작
          </button>
          <button className="
            h-12 px-6
            bg-[var(--color-surface-elevated)]
            text-[var(--color-text-primary)]
            font-medium
            rounded-lg
            border border-[var(--color-border-primary)]
            hover:bg-[var(--color-surface-elevated)]/80
            active:scale-[0.98]
            transition-all duration-200
          ">
            라이브 데모
          </button>
        </div>
        
        {/* Stats with Hairline */}
        <div className="
          relative pt-8
          before:content-['']
          before:absolute
          before:top-0
          before:left-0
          before:right-0
          before:h-px
          before:bg-gradient-to-r
          before:from-transparent
          before:via-[var(--color-border-primary)]
          before:to-transparent
        ">
          <dl className="grid grid-cols-3 gap-6">
            <div>
              <dt className="text-xs text-[var(--color-text-tertiary)] mb-1">
                당일 정산
              </dt>
              <dd className="text-2xl font-semibold text-[var(--color-text-primary)]">
                T+0
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-text-tertiary)] mb-1">
                매칭 SLA
              </dt>
              <dd className="text-2xl font-semibold text-[var(--color-text-primary)]">
                5분
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-text-tertiary)] mb-1">
                대비 게이트
              </dt>
              <dd className="text-2xl font-semibold text-[var(--color-text-primary)]">
                ≥4.5:1
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Right Visual (Glass Card with Skeletons) */}
      <div className="md:col-span-7 relative">
        {/* Glow Effect */}
        <div className="
          absolute -inset-8
          rounded-3xl
          opacity-40
          blur-3xl
          bg-[radial-gradient(60%_50%_at_30%_20%,oklch(71%_0.15_166_/_0.3),transparent_70%)]
          pointer-events-none
        " />
        
        {/* Glass Card */}
        <div className="
          relative
          p-8
          bg-[var(--color-surface-elevated)]/75
          backdrop-blur-2xl
          backdrop-saturate-150
          border border-[var(--color-border-primary)]
          rounded-2xl
          shadow-2xl
        ">
          {/* Main Skeleton */}
          <div className="
            h-64 md:h-80
            mb-4
            bg-[var(--color-surface-raised)]
            rounded-xl
            animate-pulse
          " />
          
          {/* Grid Skeletons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="h-24 bg-[var(--color-surface-raised)] rounded-lg animate-pulse" />
            <div className="h-24 bg-[var(--color-surface-raised)] rounded-lg animate-pulse" />
            <div className="h-24 bg-[var(--color-surface-raised)] rounded-lg animate-pulse" />
          </div>
          
          {/* Button Skeletons with Hairline */}
          <div className="
            relative pt-6
            before:content-['']
            before:absolute
            before:top-0
            before:left-0
            before:right-0
            before:h-px
            before:bg-gradient-to-r
            before:from-transparent
            before:via-[var(--color-border-primary)]
            before:to-transparent
          ">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-[var(--color-surface-raised)] rounded-lg animate-pulse" />
              <div className="h-10 bg-[var(--color-surface-raised)] rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

### C. Feature Grid (3-Column)

```tsx
<section className="py-24 bg-[var(--color-surface-base)]">
  <div className="container mx-auto max-w-7xl px-6">
    <div className="grid md:grid-cols-3 gap-6">
      {[
        { title: '즉시 매칭', desc: '반경·가게 가중치·과거 성과 기반 실시간 후보 10명.' },
        { title: '정책/리스크 가드', desc: '콘텐츠·위치·결제 규칙 자동 검증.' },
        { title: 'T+0 정산', desc: '승인 즉시 정산, 창구 비용↓ 체감↑.' }
      ].map((feature, i) => (
        <article
          key={i}
          className="
            group relative
            p-6
            bg-[var(--color-surface-elevated)]
            border border-[var(--color-border-primary)]
            rounded-xl
            hover:border-[var(--color-accent-primary)]/30
            hover:-translate-y-1
            transition-all duration-300
          "
        >
          {/* Icon Placeholder */}
          <div className="
            size-10 mb-4
            bg-[var(--color-accent-bg)]
            rounded-lg
            flex items-center justify-center
            group-hover:scale-110
            transition-transform duration-300
          ">
            <div className="size-5 bg-[var(--color-accent-primary)] rounded" />
          </div>
          
          {/* Title */}
          <h3 className="
            text-lg font-semibold
            text-[var(--color-text-primary)]
            mb-2
          ">
            {feature.title}
          </h3>
          
          {/* Description */}
          <p className="
            text-sm
            text-[var(--color-text-secondary)]
            leading-relaxed
          ">
            {feature.desc}
          </p>
          
          {/* Bottom Hairline */}
          <div className="
            absolute bottom-0 left-6 right-6
            h-px
            bg-gradient-to-r
            from-transparent
            via-[var(--color-border-primary)]
            to-transparent
          " />
        </article>
      ))}
    </div>
  </div>
</section>
```

---

## 🚀 즉시 적용 가능한 최종 파일

### `src/styles/globals.css` (최소화)

```css
@import 'tailwindcss';
@import './tokens.css';

body {
  background: var(--color-surface-base);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
}
```

### `src/app/layout.tsx` (다크 모드 강제)

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark">
      <body>{children}</body>
    </html>
  );
}
```

---

## 📊 체크리스트

- [ ] `tokens.css`: LCH 색상 시스템 완성
- [ ] 모든 컴포넌트: 커스텀 CSS 0%
- [ ] Tailwind 클래스만 사용 (arbitrary values 포함)
- [ ] Glass morphism: `backdrop-blur-2xl` + `bg-[color]/75`
- [ ] Hairline: `after:` pseudo 클래스 활용
- [ ] 그라디언트: `bg-gradient-to-*` + `bg-clip-text`
- [ ] 애니메이션: `animate-*` + `transition-*`
- [ ] 반응형: `md:`, `lg:` prefix 적극 활용

---

**다음 단계**: 위 패턴을 `src/app/page.tsx`에 직접 적용하시겠습니까?
