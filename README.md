# Micro-React: Deep Dive into Framework Architecture

> **"React의 마법을 이해하기 위해 처음부터 다시 구축한다면 어떨까?"**

이 프로젝트는 React의 핵심 원리인 **Virtual DOM**, **Reconciliation**, **Hook System**을 바닐라 TypeScript로 직접 구현하며, 프레임워크 수준의 아키텍처를 깊이 있게 탐구한 결과물입니다.

단순한 기능 구현을 넘어, **"왜 React는 이렇게 설계되었을까?"** 라는 질문에 대한 답을 찾는 과정을 담았습니다.

---

## Architecture Deep Dive (핵심 설계)

이 프로젝트의 핵심은 **"상태(State)와 렌더링(Rendering)의 분리 및 연결"**입니다. 각 모듈은 독립적인 역할을 수행하며 유기적으로 연결됩니다.

### 1. Hook System: Closure & Call Stack
React Hook이 왜 **호출 순서(Call Order)**에 의존하는지, 컴포넌트가 함수임에도 불구하고 어떻게 **상태를 유지(State Preservation)**하는지 직접 구현했습니다.

*   **핵심 구현**: `HookManager`는 전역 스택(`vnodeStack`)을 사용하여 현재 실행 중인 VNode를 추적하고, 클로저를 통해 상태를 각 VNode에 격리합니다.
*   **Deep Dive 문서**:
    *   [👉 Hook System Architecture (설계 의도)](src/core/hook/hookManager/README.md)
    *   [👉 useState Implementation (구현 상세)](src/core/hook/useState/README.md)

### 2. Virtual DOM & Rendering Pipeline
JSX가 `createElement`를 통해 VNode로 변환되고, `render` 함수가 이를 재귀적으로 순회하며 DOM을 구축하는 전체 파이프라인을 설계했습니다.

*   **핵심 구현**: `internalRender` 함수는 재귀적으로 VNode 트리를 순회하며, 이벤트 위임(Event Delegation)을 통해 성능을 최적화합니다.
*   **Deep Dive 문서**:
    *   [👉 Virtual DOM & createElement](src/core/createElement/README.md)
    *   [👉 Rendering Strategy & Event Delegation](src/core/render/README.md)

### 3. Type System
TypeScript의 강력한 타입 시스템을 활용하여 프레임워크의 안정성을 확보했습니다.
*   [👉 VNode & Hook Type Definitions](src/shared/types/vnode.ts)

---

## Project Structure

```bash
src/
├── core/
│   ├── createElement/  # JSX -> VNode 변환
│   ├── render/         # VNode -> DOM 변환 (Recursive)
│   ├── hook/           # Hook System (useState, HookManager)
│   ├── reconcile/      # Diffing Algorithm (진행 중)
│   └── rootVNodeTree/  # Root 관리
└── shared/
    └── types/          # 핵심 타입 정의 (VNode, HookMetaData)
```

---

## 🚀 Getting Started

### Installation & Run
```bash
npm install
npm run dev
```

### Testing
Vitest와 JSDOM을 활용하여 브라우저 환경을 모킹하고, 렌더링 로직을 검증합니다.
```bash
npm run test
```

---

## 📝 Dev Log & ADR (Architecture Decision Records)
개발 과정에서 마주친 문제들과 해결 과정을 기록했습니다.

*   **Hook의 상태 보존**: 함수형 컴포넌트가 리렌더링 될 때 변수는 초기화되지만, `HookManager`를 통해 외부 저장소(VNode.hookMetaData)에 상태를 저장하여 값을 유지합니다.
*   **이벤트 위임**: 개별 노드에 이벤트를 붙이는 대신, 루트 레벨에서 이벤트를 위임받아 처리하여 메모리 사용량을 최적화했습니다.

