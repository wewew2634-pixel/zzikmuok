"""ZZIK optional agent service.

This module demonstrates how to wire an orchestrated workflow using LangGraph or
CrewAI-style patterns.  The default entry point keeps the process dormant unless
API keys are provided; this allows deployments to keep the container disabled in
"cost zero" mode.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any, Dict

try:
    from langchain.chat_models import ChatOpenAI
    from langchain.schema import HumanMessage, SystemMessage
except ImportError:  # pragma: no cover - optional dependency guards
    ChatOpenAI = None  # type: ignore
    HumanMessage = SystemMessage = object  # type: ignore


@dataclass
class AgentConfig:
    model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    temperature: float = float(os.getenv("OPENAI_TEMPERATURE", "0.2"))


def build_agent(config: AgentConfig):
    if ChatOpenAI is None:
        raise RuntimeError("langchain is not installed in this environment")

    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError("OPENAI_API_KEY is not set; run in cost-zero mode instead")

    return ChatOpenAI(model=config.model, temperature=config.temperature)


def run_once(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Handle a single agent invocation.

    Parameters
    ----------
    payload: dict
        Arbitrary input data.  This implementation expects a `prompt` field.
    """

    agent = build_agent(AgentConfig())
    prompt = payload.get("prompt")
    if not prompt:
        raise ValueError("Missing prompt")

    messages = [
        SystemMessage(content="You are ZZIK's mission operations assistant."),
        HumanMessage(content=prompt),
    ]

    response = agent(messages)
    return {
        "output": response.content if hasattr(response, "content") else response,
        "model": agent.model_name,
    }


def main() -> None:
    mode = os.getenv("AGENT_MODE", "disabled")

    if mode == "disabled":
        print("agents workflow running in disabled mode (cost zero)")
        return

    if mode == "once":
        print(run_once({"prompt": "Health check"}))
        return

    raise ValueError(f"Unsupported AGENT_MODE: {mode}")


if __name__ == "__main__":
    main()
