# createElement & Virtual DOM Specification

## 🎯 개요
`createElement` 함수는 JSX가 트랜스파일링된 결과물로, **Virtual DOM(VNode)** 트리를 생성하는 진입점입니다.
React의 `React.createElement`와 동일한 역할을 수행하며, UI의 구조를 가벼운 JavaScript 객체로 표현합니다.

## ⚙️ VNode Structure (설계)

VNode는 실제 DOM 노드에 대한 메타데이터를 담고 있는 불변 객체입니다.

```typescript
interface VNode {
  type: string | Function; // HTML 태그명 또는 컴포넌트 함수
  props: VNodeProps;       // 속성 및 children
  key: string | number | null; // 리스트 렌더링 최적화를 위한 키
  ref: any;                // DOM 요소에 대한 직접 참조
  hookMetaData?: HookMetaData; // (Function Component Only) Hook 상태 저장소
}
```

## 🛠 Implementation Details

### 1. Children Flattening (자식 평탄화)
`createElement`는 가변 인자로 자식들을 받습니다 (`...children`).
이때 중첩된 배열(예: `map` 함수 사용 시)이 들어올 수 있으므로, 이를 **1차원 배열로 평탄화(Flattening)** 하여 처리합니다.

```typescript
const normalizedChildren: Children = Array.isArray(children)
  ? (children.flat(Infinity) as Child[])
  : null;
```
*   **Why?**: 렌더링 엔진이 트리를 순회할 때 일관된 구조(배열)를 기대할 수 있게 하여 복잡도를 낮춥니다.

### 2. Props Normalization
`key`와 `ref`는 일반적인 `props`와 다르게 처리됩니다.
이들은 프레임워크 내부에서 특별한 목적으로 사용되므로, `props` 객체에서 분리하여 VNode의 최상위 속성으로 배치합니다.

### 3. Functional Component Support
`type`이 함수인 경우(함수형 컴포넌트), 해당 VNode는 상태를 가질 수 있어야 합니다.
따라서 `hookMetaData` 필드를 초기화하여 추후 `HookManager`가 상태를 저장할 공간을 미리 확보합니다.

```typescript
if (typeof type === "function") {
  vnode.hookMetaData = {
    hooks: [],
    pointer: 0,
  };
}
```

## 📚 References
이 구현은 React의 설계 철학을 바탕으로 합니다.
*   [React Virtual DOM에서 자식 목록을 평탄화(flatten)하는 이유](https://velog.io/@y-minion/React-Virtual-DOM에서-자식-목록을-평탄화flatten하는-이유)
*   [DOM 구조는 왜 '평평한 목록'인가?](https://velog.io/@y-minion/DOM-구조는-왜-평평한-목록인가-그리고-React는-왜-이를-평탄화flatten해야-하는가)
