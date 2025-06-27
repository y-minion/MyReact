import type { RenderedVNode } from "../render/internalRender";

type MatchedVNode = RenderedVNode | null | undefined;
type DiffTarget = RenderedVNode | null;
/**
 *
 * @param oldVNodeArr 루트 트리의 노드 배열
 * @param currentNewVNode 리렌더링으로 새로 생성되는 VNode
 * @param currentIndex 새로 생성되는 currentNewVNode의 현재 index
 * @returns 리렌더링으로 새로 생성되는 currentNewVNode와 비교를 할 수 있는 root트리의 RenderedVNode를 반환 한다. 이때 비교 가능한 노드가 없으면 Null을 반환 한다.
 */
export function diffTargetFinder(
  oldVNodeArr: RenderedVNode["_renderedChildren"],
  currentNewVNode: RenderedVNode,
  currentIndex: number
): DiffTarget {
  let matchedVNode: MatchedVNode = null;
  let isKeyExist: Boolean = isNewVNodeKeyExist(currentNewVNode);

  if (isKeyExist) {
    matchedVNode = oldVNodeArr?.find(
      (VNode) => VNode.key === currentNewVNode.key
    );
    if (matchedVNode) {
      //타겟 찾는 즉시 함수 종료
      return matchedVNode;
    }
    //root에 일치하는 키가 없으면 index비교로 이동
    isKeyExist = false;
  } else if (!oldVNodeArr![currentIndex]) matchedVNode = null;
  // 비교할 대상이 없으므로 새로운 노드 생성을 간주_ 비교할 필요가 없다
  else {
    //비교할 수 있는 노드가 root 트리에 존재하는 경우
    matchedVNode = oldVNodeArr![currentIndex];
  }
  return matchedVNode as RenderedVNode | null;
}

const isNewVNodeKeyExist = (newVNode: RenderedVNode): Boolean =>
  newVNode.key !== null;
