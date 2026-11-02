# Intent Loop 프로토타입

Intent를 작성하고 목 에이전트 개발, 샘플 앱 검토, 수정 요청, 종료를 7단계로 확인하는 Next.js 프로토타입입니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. `샘플 프로젝트 사용`을 누르면 실제 폴더 없이 흐름을 확인할 수 있습니다.

## 구조

- `apps/web`: Cal.diy의 `apps/web` 배치를 따른 Next.js App Router 웹 앱
- `apps/web/src/features/intent-loop`: 이 작업의 화면과 상태 모델
- 루트 npm workspace: 앱을 실행하는 최소 모노레포 구성

Cal.diy의 Next.js 웹 앱과 앱 단위 모노레포 구조를 참고했습니다. 프로토타입 범위에 필요 없는 tRPC, Prisma, 인증, 데이터베이스는 추가하지 않았습니다.

## 프로토타입 범위

3단계 개발과 4단계 앱 실행은 목 데이터입니다. 프로젝트 선택은 브라우저가 허용한 폴더의 `package.json`에서 실행 명령과 포트를 읽으며, 실제 파일 수정이나 앱 실행을 하지 않습니다. 작성한 Intent는 브라우저 `localStorage`에 저장되고 `intent.md` 파일로 내려받을 수 있습니다. 선택한 프로젝트 폴더에 자동으로 기록되지는 않습니다.
