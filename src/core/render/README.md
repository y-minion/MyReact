# Rendering Pipeline & Event Delegation

## 🎯 Overview
`render` 모듈은 VNode 트리를 순회하며 실제 DOM을 생성하고, 브라우저에 마운트하는 역할을 수행합니다.
단순한 DOM 생성을 넘어, **재귀적 렌더링(Recursive Rendering)**과 **이벤트 위임(Event Delegation)**을 통해 효율적인 렌더링 파이프라인을 구축했습니다.

## ⚙️ Rendering Strategy

### 1. Recursive Rendering (재귀적 렌더링)
VNode 트리는 중첩된 구조를 가지므로, `internalRender` 함수는 재귀적으로 호출되며 트리를 탐색합니다.

*   **Host Component (`div`, `span`...)**: 실제 DOM 엘리먼트를 생성하고, 자식 노드들에 대해 재귀적으로 `render`를 호출합니다.
*   **Functional Component**: 함수를 실행하여 반환된 VNode(하위 트리)를 대상으로 다시 `render`를 호출합니다. 이때 `HookManager`를 통해 컴포넌트의 상태 컨텍스트를 설정합니다.

### 2. Event Delegation (이벤트 위임)
성능 최적화를 위해 개별 DOM 노드에 이벤트 리스너를 부착하지 않고, 루트 컨테이너에 하나의 리스너만 등록하는 **이벤트 위임** 방식을 채택했습니다.

#### 구현 상세
1.  **Event Binding**: VNode의 props 중 `on`으로 시작하는 이벤트 핸들러(예: `onClick`)를 감지합니다.
2.  **Metadata Storage**: 핸들러 함수를 DOM 요소에 직접 `addEventListener` 하는 대신, DOM 요소의 프로퍼티(메타데이터)로 저장합니다.
3.  **Root Listener**: 루트 컨테이너에 등록된 전역 리스너가 이벤트 버블링을 통해 이벤트를 포착합니다.
4.  **Dispatch**: `event.target`을 시작으로 상위로 올라가며(Bubbling), 각 노드에 저장된 핸들러를 찾아 실행합니다.

> **Why?**
> *   **메모리 절약**: 수천 개의 리스트 아이템이 있어도 리스너는 단 하나만 존재합니다.
> *   **동적 요소 처리**: 나중에 추가된 DOM 요소에 대해서도 별도의 리스너 등록 없이 이벤트 처리가 가능합니다.

## 🛠 Implementation Details

### `internalRender` Flow
1.  **Component Resolution**: VNode 타입이 함수라면 실행하여 자식 VNode를 얻습니다.
2.  **DOM Creation**: VNode 타입이 문자열이라면 `document.createElement`로 요소를 생성합니다.
3.  **Props Application**: `className`, `style` 등의 속성을 DOM에 적용합니다.
4.  **Children Processing**: 자식 배열을 순회하며 재귀적으로 렌더링하고, 부모 노드에 `appendChild` 합니다.
