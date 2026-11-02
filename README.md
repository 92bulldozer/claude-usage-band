# claude-usage-band

Claude Code의 프롬프트 위 한 줄(밴드)에 사용량을 보여 주는 mod입니다.

```text
컨텍스트 ▰▰▱ 42%  세션 ▰▱▱ 31%  주간 ▰▱▱ 30%  에이전트 3 · Opus 1 · Haiku 2
```

- **컨텍스트, 세션(5시간), 주간(7일)**: 막대 게이지와 퍼센트
- **히트 효과**: 수치가 바뀐 게이지가 흰색으로 번쩍였다가 돌아갑니다
- **에이전트**: 실행 중인 서브에이전트 수와 모델별 개수

세션·주간 값은 Claude 구독에서 첫 응답을 받은 뒤부터 나옵니다. 화면 표시만 하므로 토큰을 쓰지 않습니다.

## 설치

Claude Code 터미널 세션의 프롬프트에서:

```text
/plugin install claude-usage-band --marketplace 92bulldozer/claude-usage-band
```

셸에서:

```bash
claude plugin install claude-usage-band --marketplace 92bulldozer/claude-usage-band
```

Claude Code 2.1.287 이상(Desktop 앱은 2.1.286 이상)이 필요합니다.

## 출처

Anthropic의 [`token-weather`](https://github.com/anthropics/claude-code-playground/tree/main/claude-code/mods/token-weather) 샘플을 수정해 만들었습니다. Apache License 2.0을 따르며, 전문은 [LICENSE](LICENSE)에 있습니다.
