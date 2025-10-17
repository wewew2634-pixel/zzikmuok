'use client';
import React from 'react';

export function GuidelineDrawer() {
  return (
    <dialog id="guideline" className="backdrop:bg-black/40 rounded-2xl p-0">
      <div className="p-5 w-[360px] max-w-[92vw]">
        <h2 className="text-lg font-semibold">콘텐츠 제작 가이드</h2>
        <div className="mt-3 space-y-3 text-sm">
          <section>
            <h3 className="font-medium">✅ 해야 할 것</h3>
            <ul className="list-disc ml-4 text-neutral-300">
              <li>밝고 선명한 화질(권장 1080p, 30fps)</li>
              <li>장소·메뉴·가격 등 사실 기반 정보 표기</li>
              <li>BGM은 **라이선스 확인 가능한 소스** 사용(예: 유튜브 오디오 라이브러리, Pixabay Audio)</li>
            </ul>
          </section>
          <section>
            <h3 className="font-medium">🚫 금지</h3>
            <ul className="list-disc ml-4 text-neutral-300">
              <li>경쟁사·가격 비교·과장 표현</li>
              <li>초상권/개인정보 침해(동의 없는 얼굴 근접 촬영 등)</li>
              <li>과도한 필터·편집으로 사실 왜곡</li>
            </ul>
          </section>
          <section className="text-xs text-neutral-400">
            <p>※ 제출 전 체크: 저작권·초상권·상표권 문제 없음 / 현장 촬영 허용 확인.</p>
            <p>※ 위반 시 반려·정산 보류될 수 있습니다.</p>
          </section>
        </div>
        <div className="mt-4 flex gap-2 justify-end">
          <button className="h-9 px-3 rounded-xl bg-neutral-700" onClick={()=> (document.getElementById('guideline') as HTMLDialogElement)?.close()}>닫기</button>
          <button className="h-9 px-3 rounded-xl bg-orange-500 text-white" onClick={()=> (document.getElementById('guideline') as HTMLDialogElement)?.close()}>확인</button>
        </div>
      </div>
    </dialog>
  );
}

export function openGuideline() {
  (document.getElementById('guideline') as HTMLDialogElement)?.showModal();
}
