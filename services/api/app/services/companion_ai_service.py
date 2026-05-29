import json
import logging
import re
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Any

from app.core.config import Settings
from app.schemas.api import CompanionChatIn, CompanionChatOut, CompanionSuggestedAction

logger = logging.getLogger(__name__)

EMERGENCY_PATTERN = re.compile(
    r"(摔倒|跌倒|胸痛|胸闷|喘不过气|呼吸困难|不能呼吸|晕倒|昏倒|SOS|救命|急救|中风|失去意识)"
)
ATTENTION_PATTERN = re.compile(r"(头晕|心慌|难受|低落|害怕|孤独|想家|血压高|睡不着|疼)")


@dataclass
class CompanionContext:
    elder_name: str = "老人"
    elder_age: int | None = None
    location_label: str = ""
    health_summary: str = "暂无最新体征数据"
    recent_alerts: str = "暂无近期告警"


class CompanionAIService:
    def __init__(self, settings: Settings):
        self.settings = settings

    def chat(self, body: CompanionChatIn, context: CompanionContext) -> CompanionChatOut:
        safety_level = self.classify_safety(body.message, body.mood)
        if safety_level == "emergency":
            return self.emergency_fallback(context)

        if not self.settings.dashscope_api_key:
            return self.local_fallback(body, context, safety_level)

        try:
            content = self.call_dashscope(body, context)
            reply = self.clean_reply(content)
            if not reply:
                return self.local_fallback(body, context, safety_level)
            return CompanionChatOut(
                reply=reply,
                speak_text=reply,
                suggested_actions=self.actions_for(safety_level, body.scene),
                safety_level=safety_level,
            )
        except Exception as exc:
            logger.warning("Companion AI call failed: %s", exc)
            return self.local_fallback(body, context, safety_level)

    def call_dashscope(self, body: CompanionChatIn, context: CompanionContext) -> str:
        base_url = self.settings.ai_base_url.rstrip("/")
        url = f"{base_url}/chat/completions"
        payload = {
            "model": self.settings.ai_model,
            "messages": [
                {"role": "system", "content": self.system_prompt()},
                {"role": "user", "content": self.user_prompt(body, context)},
            ],
            "temperature": 0.7,
            "max_tokens": 320,
        }
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        request = urllib.request.Request(
            url,
            data=data,
            headers={
                "Authorization": f"Bearer {self.settings.dashscope_api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=12) as response:
                raw = response.read().decode("utf-8")
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"DashScope HTTP {exc.code}: {detail}") from exc

        parsed: dict[str, Any] = json.loads(raw)
        choices = parsed.get("choices") or []
        if not choices:
            return ""
        message = choices[0].get("message") or {}
        return str(message.get("content") or "")

    @staticmethod
    def system_prompt() -> str:
        return (
            "你是智慧养老小程序“鼋伴伴”的陪伴助手“小鼋”。"
            "你的对象主要是老人，必须温和、简短、明确，每次回答不超过120字。"
            "你可以陪聊天、安抚心情、解释健康摘要、提醒联系家人。"
            "你不是医生，不能诊断、开药、调整处方。"
            "你不能声称已经打电话、发消息、报警、下单、联系社区或完成任何外部操作；"
            "不要使用“拨通、发出、已通知、已联系、已报警”等表达；"
            "也不要说“我帮您打开”或编造按钮名；只能说“请点击下方的联系家人、看健康、去 SOS 等按钮”。"
            "遇到胸痛、摔倒、呼吸困难、意识异常、SOS 等紧急风险，必须建议立即求助、联系家人或社区/急救。"
        )

    @staticmethod
    def user_prompt(body: CompanionChatIn, context: CompanionContext) -> str:
        mood = body.mood or "未记录"
        return (
            f"老人：{context.elder_name}，年龄：{context.elder_age or '未知'}，位置：{context.location_label or '未知'}。\n"
            f"今日心情：{mood}。\n"
            f"最新体征：{context.health_summary}。\n"
            f"近期告警：{context.recent_alerts}。\n"
            f"场景：{body.scene}。\n"
            f"老人刚刚说：{body.message}\n"
            "如果需要引导点击，只能使用这些真实按钮名：联系家人、看健康、去 SOS、健康报告、鼋气罐。\n"
            "请用老人容易听懂的话回答，并给出一个下一步建议。"
        )

    @staticmethod
    def classify_safety(message: str, mood: str | None = None) -> str:
        text = f"{message} {mood or ''}"
        if EMERGENCY_PATTERN.search(text):
            return "emergency"
        if ATTENTION_PATTERN.search(text):
            return "attention"
        return "normal"

    @staticmethod
    def clean_reply(content: str) -> str:
        return re.sub(r"\s+", " ", content).strip()

    def local_fallback(
        self,
        body: CompanionChatIn,
        context: CompanionContext,
        safety_level: str,
    ) -> CompanionChatOut:
        if safety_level == "attention":
            reply = f"{context.elder_name}，我在呢。您先坐下慢慢缓一缓，我也建议您和家人说一声。"
        elif body.scene == "health" or "身体" in body.message or "健康" in body.message:
            reply = f"{context.elder_name}，我看了今天的记录：{context.health_summary}。如果不舒服，请及时联系家人。"
        elif body.scene == "mood" and body.mood:
            reply = f"已记录您今天的心情：{body.mood}。我会陪着您，也可以帮您联系家人聊一会儿。"
        else:
            reply = f"{context.elder_name}，我在呢。您可以慢慢说，我会陪您一起想办法。"
        return CompanionChatOut(
            reply=reply,
            speak_text=reply,
            suggested_actions=self.actions_for(safety_level, body.scene),
            safety_level=safety_level,
        )

    @staticmethod
    def emergency_fallback(context: CompanionContext) -> CompanionChatOut:
        reply = (
            f"{context.elder_name}，这可能比较紧急。请您先别移动，马上按 SOS，"
            "或让家人、社区人员帮您联系急救。"
        )
        return CompanionChatOut(
            reply=reply,
            speak_text=reply,
            suggested_actions=[
                CompanionSuggestedAction(key="sos", label="去 SOS", route="/pages/sos/index"),
                CompanionSuggestedAction(key="family", label="联系家人", route="/pages/family/index"),
            ],
            safety_level="emergency",
        )

    @staticmethod
    def actions_for(safety_level: str, scene: str) -> list[CompanionSuggestedAction]:
        if safety_level == "attention":
            return [
                CompanionSuggestedAction(key="family", label="联系家人", route="/pages/family/index"),
                CompanionSuggestedAction(key="health", label="看健康", route="/pages/health/index"),
            ]
        if scene == "health":
            return [CompanionSuggestedAction(key="report", label="健康报告", route="/pages/health-report/index")]
        if scene == "mood":
            return [CompanionSuggestedAction(key="yuanqi", label="鼋气罐", route="/pages/yuanqi/index")]
        return [CompanionSuggestedAction(key="family", label="联系家人", route="/pages/family/index")]
