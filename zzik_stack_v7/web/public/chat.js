/**
 * ZZMUK Chat Client
 * 바닐라 JS - 의존성 0, SSE 기반 스트리밍 채팅
 */
(() => {
  const REQUEST_TIMEOUT = 10000;

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
   * @param {"user" | "assistant"} role
   * @param {string} textChunk
   * @param {boolean} [final=false]
   */
  const addBubble = (role, textChunk, final = false) => {
    let el = $log.querySelector(`[data-stream="${role}"]:last-of-type`);

    if (!el || final) {
      el = document.createElement("div");
      el.dataset.stream = role;
      el.className = [
        "max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm transition-colors duration-200",
        role === "user"
          ? "ml-auto border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/60 text-[var(--color-text-primary)]"
          : "glass",
      ].join(" ");
      el.innerHTML = `<p class="text-sm leading-relaxed text-[var(--color-text-primary)]"></p>`;
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      el.setAttribute("aria-label", role === "user" ? "사용자 메시지" : "챗봇 응답");
      $log.appendChild(el);
    }

    const $p = el.querySelector("p");
    if ($p) {
      $p.textContent += textChunk;
    }

    $log.scrollTop = $log.scrollHeight;
  };

  /**
   * 폼 제출 핸들러
   */
  $form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = $inp.value.trim();
    if (!text) return;

    addBubble("user", text, true);
    history.push({ role: "user", content: text });
    $inp.value = "";

    let controller;
    let timer;

    try {
      controller = new AbortController();
      timer = setTimeout(
        () => controller.abort(new Error("timeout")),
        REQUEST_TIMEOUT,
      );

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let assistantText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const frame = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);

          if (frame.startsWith("data:")) {
            try {
              const payload = JSON.parse(frame.slice(5).trim());
              if (payload.delta) {
                assistantText += payload.delta;
                addBubble("assistant", payload.delta);
              }
            } catch (parseErr) {
              console.warn("Failed to parse SSE data:", parseErr);
            }
          } else if (frame.startsWith("event: done")) {
            history.push({ role: "assistant", content: assistantText });
          } else if (frame.startsWith("event: error")) {
            try {
              const lines = frame.split("\n");
              const dataLine = lines.find((l) => l.startsWith("data:"));
              if (dataLine) {
                const errorData = JSON.parse(dataLine.slice(5).trim());
                const label = errorData.message || "알 수 없는 오류";
                addBubble("assistant", `[오류: ${label}]`, true);
              }
            } catch (parseErr) {
              console.warn("Failed to parse error event:", parseErr);
            }
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      const label =
        err?.name === "AbortError" || err?.message === "timeout"
          ? "연결 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요."
          : err?.message || "알 수 없는 오류";
      addBubble("assistant", `[연결 오류: ${label}]`, true);
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  });

  /**
   * 키보드 단축키
   */
  $inp.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      $form.requestSubmit();
    }
  });

  /**
   * 초기화
   */
  setTimeout(() => {
    $log.innerHTML = "";
    addBubble(
      "assistant",
      "안녕하세요! ZZMUK 챗봇입니다. 무엇을 도와드릴까요?",
      true,
    );
  }, 400);
})();
