# Intent Loop 프로토타입

Intent를 작성하고 목 에이전트 개발, 샘플 앱 검토, 수정 요청, 종료를 4단계로 확인하는 Next.js 프로토타입입니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. `샘플 프로젝트 사용`을 누르면 실제 폴더 없이 흐름을 확인할 수 있습니다.

## 구조

Cal.diy의 레이어 배치를 따릅니다.

- `apps/web/app`: App Router 라우트 (얇게 유지, 화면은 `modules`에서 가져옴)
- `apps/web/modules/intent-loop`: 화면(`components`), 훅(`hooks`), 브라우저 전용 유틸(`lib`)
- `apps/web/styles`: 전역·화면 스타일
- `packages/features/intent-loop`: 상태 모델과 순수 상태 전이 (`@intent-loop/features`, barrel 없이 파일 직접 import)
- 루트 npm workspace: `apps/*`, `packages/*`

작업 흐름은 프로젝트 설정 → Intent 작성 → 개발·검토 루프(Workbench) → 종료 4단계입니다.

Cal.diy의 Next.js 웹 앱과 앱 단위 모노레포 구조를 참고했습니다. 프로토타입 범위에 필요 없는 tRPC, Prisma, 인증, 데이터베이스는 추가하지 않았습니다.

## 프로토타입 범위

3단계 개발과 4단계 앱 실행은 목 데이터입니다. 프로젝트 선택은 브라우저가 허용한 폴더의 `package.json`에서 실행 명령과 포트를 읽으며, 실제 파일 수정이나 앱 실행을 하지 않습니다. 작성한 Intent는 브라우저 `localStorage`에 저장되고 `intent.md` 파일로 내려받을 수 있습니다. 선택한 프로젝트 폴더에 자동으로 기록되지는 않습니다.
