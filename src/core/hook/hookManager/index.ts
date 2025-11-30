import type {
  HookMetaData,
  HookMetaDataArr,
  VNode,
} from "@/shared/types/vnode";

let vnodeStack: VNode[] = []; // TODO: RenderedVNode 도 받을 수 있도록 type 수정 검토하기!
export function pushCurrentVNode(vnode: VNode) {
  vnodeStack.push(vnode);
}
export function popCurrentVNode() {
  vnodeStack.pop();
}

/**
 *
 * @returns 현재의 VNode의 참조값을 가져옵니다.
 *
 * hook함수 내부에서 현재의 VNode에 접근할 수 있습니다.
 */
export function getCurrentVNode(): VNode {
  return vnodeStack[vnodeStack.length - 1];
}
/**
 *
 * @returns [registerHookHelper, getVNode, isInit] 를 반환합니다.
 *
 * 위 3개의 헬퍼함수를 반환합니다.
 */
export function useHookManger(): [
  registerHookHelper: (state: any, setterFn: (newState: any) => void) => void,
  getVNode: () => VNode,
  getCurrentHookData: () => HookMetaData,
  isInit: () => boolean
] {
  //useHookManger함수가 호출 될때마다 호출된 VNode의 환경(hookMetaData)을 렉시컬 환경에 추가합니다.
  const hookMetaData = getCurrentVNode().hookMetaData!;
  const hooks: HookMetaDataArr = hookMetaData.hooks as HookMetaDataArr;

  /**
   *
   * @param state hook의 상태
   * @param setterFn 등록할 setter 함수
   *
   * hook의 상태,setter함수(클로저 이용)를 등록 합니다.
   * useHookManger 함수가 호출될때 현재의 VNode을 렉시컬 환경에 기억하는 해당 함수를 새롭게 만듭니다.
   */
  const registerHookHelper = (
    state: any,
    setterFn: (newState: any) => void
  ): void => {
    hooks.push([state, setterFn]);
    /**
     *  hooks[hookMetaData.pointer] = [state, setterFn];
     * hookMetaData.pointer++;
     */
  };

  /**
   *
   * @returns VNode의 pointer 필드를 이용해 올바른 순서의 hookData배열을 반환합니다.
   */
  const getCurrentHookData = (): HookMetaData => {
    const currentHookData = hooks[hookMetaData.pointer];
    hookMetaData.pointer++;
    return currentHookData;
  };

  /**
   *
   * @returns 현재의 VNode를 가져올 수 있습니다.
   */
  const getVNode = () => getCurrentVNode();

  /**
   *
   * @returns 마운트, 리렌더링 분기를 불리언 타입으로 반환 합니다.
   *
   * 초기 마운트 상황일 때는 true를 , 리렌더링 상황이면 hookMetaData.pointer필드에 값이 있으므로 false를 반환합니다.
   */
  const isInit = (): boolean => !hooks[hookMetaData.pointer];

  return [registerHookHelper, getVNode, getCurrentHookData, isInit];
}
