# claude-usage-band 설치

다른 컴퓨터에 설치하는 방법입니다. 프롬프트 위에 컨텍스트·세션·주간 사용량 게이지가 나타납니다.

## 1. 버전 확인

mod는 터미널의 Claude Code 2.1.287 이상, Desktop 앱은 2.1.286 이상에서 동작합니다.

```bash
claude --version
```

Desktop 앱은 Code 탭의 로컬 세션에서 `/status`를 입력하고 **Claude Code** 행을 확인합니다.

## 2. 설치

터미널에서 Claude Code를 실행하고 프롬프트에 입력합니다.

```text
/plugin install claude-usage-band --marketplace 92bulldozer/claude-usage-band
```

마켓플레이스 추가를 물으면 `y`를 누르고, 설치 범위를 고릅니다.

셸에서 바로 설치할 수도 있습니다.

```bash
claude plugin install claude-usage-band --marketplace 92bulldozer/claude-usage-band
```

세션이 열려 있었다면 그 세션에서 `/reload-plugins`를 실행합니다.

## 3. 확인

- 프롬프트에서 `/plugin`을 실행해 `claude-usage-band`가 있는지 봅니다.
- 입력창 위에 `컨텍스트` 게이지가 보이면 됩니다.
- `세션`, `주간`은 첫 응답을 받은 뒤부터 나옵니다.

## Desktop 앱에서 안 보일 때

저장소를 내려받아 폴더로 직접 불러옵니다.

```bash
git clone https://github.com/92bulldozer/claude-usage-band.git
```

`~/.claude/settings.json`의 `env`에 받은 폴더의 절대 경로를 넣고 앱을 다시 시작합니다.

```json
{
  "env": {
    "CLAUDE_CODE_PLUGIN_DIRS": "C:\\경로\\claude-usage-band"
  }
}
```

macOS와 Linux는 `/경로/claude-usage-band` 형식으로 씁니다. 여러 개는 Windows에서 `;`, 그 외에서 `:`로 구분합니다.

## 끄기

`/plugin`의 **Installed** 탭에서 비활성화하거나 제거합니다.
