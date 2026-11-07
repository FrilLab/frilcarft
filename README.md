# FrilCraft

**Craft interactive experiences for the web.**

FrilCraft는 필요한 효과만 독립적으로 가져다 쓸 수 있는 인터랙티브 웹 컴포넌트 프로젝트입니다. FrilStudio에서 실제로 사용하고 검증한 패턴을 재사용 가능한 오픈소스로 발전시키는 것을 목표로 합니다.

> **Status: architecture scaffold (not released).** 현재는 초기 폴더 구조와 설계 계약만 있습니다. 동작하는 컴포넌트, Playground, npm 패키지 또는 shadcn Registry는 아직 제공하지 않습니다.

## Principles

- **Vanilla-first:** 프레임워크 비종속 로직은 Vanilla TypeScript와 브라우저 기본 API로 구현합니다.
- **React optional:** React API는 Vanilla 엔진의 어댑터로 제공합니다. Vanilla 사용자가 React를 설치할 필요가 없어야 합니다.
- **Native Web APIs first:** CSS, WAAPI, Pointer Events, ResizeObserver, IntersectionObserver, requestAnimationFrame 등을 우선 사용합니다. Motion/GSAP/R3F는 기본 의존성이 아닙니다.
- **Three.js only when needed:** 3D 기능에서만 선택적으로 Three.js를 사용하며, DOM 효과에는 포함되지 않아야 합니다.
- **Stage owns rendering:** Stage별 Canvas와 Renderer는 최대 하나씩만 소유합니다. 각 View와 Scene은 자체적으로 Canvas를 만들지 않습니다.
- **View-first:** View는 HTML 영역을 Stage의 렌더링 영역에 연결합니다. Scene 전환은 Canvas 재생성 없이 수행합니다.
- **Independent distribution:** 개별 소스 복사와 Vanilla/React 진입점을 우선하고, shadcn Registry는 선택적 배포 방식으로 추가합니다.
- **No hidden telemetry:** 배포되는 컴포넌트에는 사용자 추적 및 FrilCraft 서버 호출을 내장하지 않습니다.

## Structure

```text
apps/
  playground/              # 향후 갤러리·시각적 설정·코드 생성
packages/
  interactive/
    src/
      core/
        stage/              # Stage 소유권과 생명주기 계약
        view/               # View 등록·영역 계약
      vanilla/              # 프레임워크 독립 진입점(예정)
      adapters/react/       # React 래퍼(예정)
      backends/three/       # 선택적 Three.js 백엔드(예정)
      components/dom/       # Native DOM 인터랙션(예정)
      components/three/     # Three.js 기반 장면(예정)
registry/                   # 선택적 shadcn Registry(예정)
examples/
  vanilla/
  react/
tests/
  consumers/                # 별도 소비자 앱 검증(예정)
docs/
  architecture/
```

빈 디렉터리는 Git에서 추적할 수 없으므로 필요한 위치만 `.gitkeep`으로 예약합니다. 폴더가 존재한다고 해서 해당 기능이 구현되었다는 뜻은 아닙니다.

## Development

```bash
npm install
npm run typecheck
```

현재 `typecheck`는 초기 TypeScript 계약의 정적 검사만 수행합니다. 런타임·브라우저 테스트와 빌드/배포 파이프라인은 구현 단계에서 추가합니다.

## Next

1. Stage/View 소유권 규칙과 Vanilla 생명주기 구현 및 테스트
2. 한 Canvas에서 여러 View를 렌더링하는 Three.js 백엔드 검증
3. 동일 Vanilla 엔진을 소비하는 React 어댑터
4. 첫 독립 컴포넌트와 Playground, 이후 선택적 Registry 배포

자세한 결정과 구현 전 검증 기준은 [Rendering Foundations](docs/architecture/rendering-foundations.md)를 참고하세요.

## License

오픈소스 라이선스는 공개 배포 전에 결정합니다. 라이선스가 추가되기 전까지 이 저장소 코드를 별도 허락 없이 재사용·재배포할 수 있다고 가정하지 마세요.
