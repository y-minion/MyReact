# useState Implementation Deep Dive

## 🎯 설계 목표
`useState`는 함수형 컴포넌트가 **상태(State)**를 가질 수 있게 하는 핵심 Hook입니다.
이 문서에서는 **"함수가 종료되면 사라지는 지역 변수와 달리, 어떻게 상태가 유지되는가?"**에 대한 구현 원리를 설명합니다.

## ⚙️ Core Logic: Closure & HookManager

`useState`의 마법은 **클로저(Closure)**와 **HookManager**의 연동에 있습니다.

### 1. 상태의 저장소 (Where)
상태는 컴포넌트 함수 내부가 아니라, **VNode 객체의 `hookMetaData`** 라는 외부 저장소에 저장됩니다.
`HookManager`는 현재 실행 중인 VNode(`currentVNode`)를 추적하고, `useState`는 이 VNode에 접근하여 상태를 읽거나 씁니다.

### 2. 실행 흐름 (Flow)

#### A. 최초 마운트 (Mount)
1. `render` 함수가 컴포넌트를 실행합니다.
2. `useState(initialValue)`가 호출됩니다.
3. `HookManager.isInit()`이 `true`를 반환합니다.
4. 초기값을 `VNode.hookMetaData.hooks` 배열에 저장합니다.
5. `setState` 함수를 생성합니다. 이때 `setState`는 **자신이 속한 VNode를 클로저로 기억**합니다.

#### B. 리렌더링 (Re-render)
1. `setState`가 호출되면, 클로저로 기억해둔 VNode를 찾아 리렌더링을 트리거합니다.
2. 컴포넌트 함수가 다시 실행됩니다.
3. `useState`가 다시 호출됩니다.
4. 이번에는 `HookManager.isInit()`이 `false`입니다.
5. `VNode.hookMetaData.hooks` 배열에서 `pointer` 인덱스를 사용해 **이전 상태값**을 꺼내옵니다.
6. 이 값을 반환하여 컴포넌트가 상태를 유지하게 합니다.

## 📝 Code Analysis

```typescript
export function useState(initalValue: State) {
  // 1. HookManager를 통해 현재 컨텍스트(VNode)에 접근할 수 있는 헬퍼들을 가져옵니다.
  const [registerHookHelper, getVNode, getCurrentHookData, isInit] = useHookManger();
  
  let state: State;
  let setState: SetState;

  if (isInit()) {
    // [Mount] 초기화 로직
    state = initalValue;
    setState = (arg: any) => {
      // ... 상태 업데이트 로직 ...
      // 리렌더링 트리거 (diff & patch)
    };
    // VNode에 Hook 등록
    registerHookHelper(state, setState);
  } else {
    // [Re-render] 상태 복구 로직
    // 현재 포인터가 가리키는 저장된 상태를 가져옴
    const [currentState, currentSetState] = getCurrentHookData();
    state = currentState;
    setState = currentSetState;
  }
  
  return [state, setState];
}
```

## 🔍 Key Takeaways
*   **순서 의존성**: `hooks` 배열을 인덱스(`pointer`)로 접근하기 때문에, Hook의 호출 순서가 항상 일정해야 합니다. (조건문 안에서 Hook을 쓰면 안 되는 이유)
*   **클로저의 활용**: `setState`는 자신이 생성된 시점의 VNode를 기억해야 하므로 클로저가 필수적입니다.
