# HookManager 설계

- 프레임워크에서 사용되는 상태를 관리하는 매니저를 설계한다.

## 개요

- render 함수 실행시 VNode를 순환하면서 type이 함수일 경우에 함수를 실행 시켜 내부의 코드를 실행시키게 된다.
- 이때 코드 내부에 hook이 등장할 경우 상태를 조작하는 로직이 있어야 한다.
- 하지만 상태를 조작하는 로직이 정상적으로 작동을 하려면 각 VNode에 해당하는 상태를 갖고있는 공간이 있어야 하는데 현재는 UI를 그릴 수 있는 VNode만 존재하고 내부의 데이터를 담을 수 있는 공간은 준비되지 않았다.
- 각 노드와 내부 상태를 연결해 주는 "무언가" 가 필요하다..!
  - 처음에는 1대1 대응 관계를 생각했는데 그럴 필요가 없다. 'internalRender'함수가 실행될때 내부 상태 코드가 실행되는데 이때 상태 관련 훅도 실행되게 되는데 이때 VNode안에 새로운 훅 관련 필드와 연결을 할 계획이다.
  - 세부 설계에서 자세하게 설명하겠다.
- 그래서 해당 매니저의 필요성을 느끼고 설계 하게 되었다.

## 설계

### 흐름 파악

- Render 이후에 createElement로 만들어진 VNode 트리를 순회하는 internalRender 함수에서 각 VNode를 순회하면서 type이 function일 경우에 함수를 실행시킨다.
- 이때 '함수를 실행시킨다' 하는 말은 즉, 해당 함수 내부의 코드들이 실행된다는 말이고, 내부에 상태를 조작하는 훅이 있으면 작성한 코드에 맞게 로직이 실행된다는 의미다.
- 그러면 internalRender 함수가 실행되는 타이밍에 상태를 관리해주는 로직(사용자가 사용할 수 있는 hook)이 있어야한다.
- 그래서 해당 HookManager가 등장하는 위치는 internalRender 함수로 결정 했다.
- 사실 처음에는 바로 useState 훅 부터 만드려고 했지만 전체적으로 hook들이 갖고 있는 공통적인 프로세스가 있어서 공통된 작업은 함수로 분리해서 관리를 하려고 했고 결국 생각한게 이 hookManger이다.

### 세부 설계

- 이때 앞서 말했듯이 internalRender 함수 내부에서 각 VNode를 순환한다고 했는데 이 말은 즉, internalRender함수에서 type 이 function인 순간에 해당하는 VNode에 접근할 수 있다는 말이 된다.

- 그래서 각각의 순환되는 VNode와 단위로 실행되는 함수 내부에 HookMetaData = {hooks:[],hooksPointer=0} 와 같은 필드를 먼저 생성한다. 해당 데이터는 HookManger 내부에서 사용된다.

- 입력: 매개변수를 입력 받지 않는다.

  - 하지만 해당 함수는 처음에 internal함수에서 해당하는 VNode객체를 사용할 수 있어야 한다.
  - 입력 없이 어떻게 사용하지...?
  - VNode를 설정 할 수 있는 전역 변수를 선언하고 hookManger함수에서 사용할 수 있도록 한다.

- 반환: VNode의 HookMetaData필드를 쉽게 관리 할 수 있는 함수를 반환한다.

  - meta 훅 등록 helper 함수\_registerHookHelper
  - 훅 상태 조회 훅
  - isEmpty 불리언 판단 함수

### 반환 함수 설계

-> 반환되는 함수들은 hook들에서 사용 될 수 있다.

- 먼저 반환 함수들이 훅 내부에서 사용되는 상황을 생각해 보자.

#### 흐름...?

- render 함수가 각 노드들을 순환하면서 함수 컴포넌트를 실행시키고 이때 hook함수도 실행이 된다.
- 이때 훅들이 실행 될때 해당 hooks[hooksPointer] 를 먼저 확인하고 비어있으면(isEmpty 함수로 확인)

#### registerHookHelper

- 입력: set함수에서 등록하려는 상태 값
- 행동: VNode의 메타 훅 배열의 상태를

- 해당하는 VNode.HookMetaData.hooks에 훅이 없으면
  currentVNode
  hookPointer

## 수정사항

### currentVNode관리 방식 수정

- 기존에

```javascript
let currentVNode: VNode;
export function getCurrentVNode(VNode: VNode) {
  currentVNode = VNode;
}
```

이런 식으로 단순하게 변수에 객체의 주소값을 할당하는 식으로 했지만 이렇게 되면 컴포넌트가 중첩되고 컴포넌트안에서 다른 컴포넌트를 호출하는데 호출한 컴포넌트안에 상태 관리 훅이 있으면 기존의 currentVNode를 덮어써서 뒤에서 훅이 실행될 때 원래의 VNode가 아닌 마지막으로 set된 VNode를 참조할 위험이 있음.

```javascript
function A() {
  const vnodeA = currentVNode; // A의 VNode
  B(); // 내부에서 또 getCurrentVNode 호출
  // …이후 A 훅이 실행될 때 currentVNode는 B의 VNode가 된다…
}
function B() {
  /* getCurrentVNode(vnodeB) */
}
```

---

- 스택 구조로 전환
  -> 정확한 VNode 참조를 위해 render 작업이 시작될 시점에 push로 해당 VNode를 넣어주고, 모든 작업이 끝나면 마지막에 pop으로 해당 VNode를 제거한다.

```javascript
let vnodeStack: VNode[] = [];

export function pushCurrentVNode(vnode: VNode) {
  vnodeStack.push(vnode);
}
export function popCurrentVNode() {
  vnodeStack.pop();
}

export function getCurrentVNode(): VNode {
  return vnodeStack[vnodeStack.length - 1];
}
```

