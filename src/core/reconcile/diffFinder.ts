import type { VNode } from "@/shared/types/vnode";
import type { RenderedVNode } from "../render/internalRender";

/**
 *
 * @param oldVNode 리렌더링되기 전의 노드
 * @param newVNode 리렌더링후 새롭게 생겨난 노드
 * @returns 기존 노드를 재사용할지 불리언 타입으로 반환합니다.
 *
 * 이미 어떤 VNode를 비교할 지 결정된 후 사용되는 함수입니다.
 * 매개 변수로 받은 두개의 노드를 비교하여 기존의 노드 재사용 여부를 반환합니다.
 */
export function diffFinder(
  oldVNode: RenderedVNode,
  newVNode: RenderedVNode
): Boolean {
  const oldVNodeType = oldVNode.type;
  const newVNodeType = newVNode.type;
  const isDifferent: Boolean = isSameNode(oldVNodeType, newVNodeType)
    ? true
    : false;

  return isDifferent;
}

const isSameNode = (
  oldVNodeType: VNode["type"],
  newVNodeType: VNode["type"]
): Boolean => oldVNodeType === newVNodeType;
