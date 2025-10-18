/**
 * ZZMUK Chat Client
 * 바닐라 JS - 의존성 0, SSE 기반 스트리밍 채팅
 */
(() => {
  // DOM Elements
  const $log = document.querySelector("#chat-log");
  const $form = document.querySelector("#chat-form");
  const $inp = document.querySelector("#chat-input");

  // Guard: 요소 없으면 종료
  if (!$log || !$form || !$inp) {
    console.warn("Chat elements not found");
    return;
  }

  // Conversation history
  const history = [];

  /**
   * 말풍선 추가/업데이트
   * @param {string} role - "user" | "assistant"
   * @param {string} textChunk - 추가할 텍스트
   * @param {boolean} final - 새 말풍선 강제 생성 여부
   */
  const addBubble = (role, textChunk, final = false) => {
    let el = $log.querySelector(`[data-stream="${role}"]:last-of-type`);

    // 새 말풍선 생성 조건
    if (!el || final) {
      el = document.createElement("div");
      el.dataset.stream = role;
      el.className = [
        "max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl",
        role === "user"
          ? "ml-auto border border-[var(--stroke)]"
          : "glass",
      ].join(" ");
      el.innerHTML = `<p class="text-sm leading-relaxed whitespace-pre-wrap"></p>`;
      $log.appendChild(el);
    }

    // 텍스트 추가
    const $p = el.querySelector("p");
    if ($p) {
      $p.textContent += textChunk;
    }

    // 스크롤 하단 고정
    $log.scrollTop = $log.scrollHeight;
  };

  /**
   * 폼 제출 핸들러
   */
  $form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = $inp.value.trim();
    if (!text) return;

    // 1) 사용자 메시지 표시 & 히스토리 추가
    addBubble("user", text, true);
    history.push({ role: "user", content: text });
    $inp.value = "";

    // 2) 서버 스트림 열기 (SSE over fetch)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let assistantText = "";

      // SSE 스트림 읽기
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE 프레임 파싱 (빈 줄로 구분)
        let idx;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const frame = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);

          // data: 프레임
          if (frame.startsWith("data:")) {
            try {
              const payload = JSON.parse(frame.slice(5).trim());
              if (payload.delta) {
                assistantText += payload.delta;
                addBubble("assistant", payload.delta); // 증분 표시
              }
            } catch (parseErr) {
              console.warn("Failed to parse SSE data:", parseErr);
            }
          }
          // event: done
          else if (frame.startsWith("event: done")) {
            history.push({ role: "assistant", content: assistantText });
          }
          // event: error
          else if (frame.startsWith("event: error")) {
            try {
              const lines = frame.split("\n");
              const dataLine = lines.find((l) => l.startsWith("data:"));
              if (dataLine) {
                const errorData = JSON.parse(dataLine.slice(5).trim());
                console.error("Stream error:", errorData);
                addBubble(
                  "assistant",
                  `[오류: ${errorData.message || "알 수 없는 오류"}]`,
                  true
                );
              }
            } catch (parseErr) {
              console.warn("Failed to parse error event:", parseErr);
            }
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      addBubble(
        "assistant",
        `[연결 오류: ${err.message || "알 수 없는 오류"}]`,
        true
      );
    }
  });

  /**
   * 키보드 단축키
   * - Shift+Enter: 줄바꿈
   * - Enter: 전송
   */
  $inp.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      $form.requestSubmit();
    }
  });

  /**
   * 초기화: 스켈레톤 제거 & 웰컴 메시지
   */
  setTimeout(() => {
    $log.innerHTML = "";
    addBubble(
      "assistant",
      "안녕하세요! ZZMUK 챗봇입니다. 무엇을 도와드릴까요?",
      true
    );
  }, 500);
})();
