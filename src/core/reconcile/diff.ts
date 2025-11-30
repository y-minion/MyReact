import type { VNode } from "@/shared/types/vnode";
import type { RenderedVNode } from "../render/internalRender";

/**
 *
 * @param oldRenderedVNode 기존에 존재하던 root VNode tree 입니다.
 * @param reRenderedVNode setter 함수로 인해 새롭게 리렌더링이 발생하는 노드입니다.
 * @returns 반환값은 없습니다. 사이드 이펙트 유발 함수입니다.
 *
 * setter함수로 인해 리렌더링이 발생하면 해당하는 VNode를 리렌더링 시킵니다. 이때 해당 노드가 리렌더링되면서 하위의 노드들이 새롭게 생기는데,
 * diff 함수를 통해 새롭게 변화된 부분만 기존의 rootTree의 VNode에 적용시켜 업데이트 합니다.
 */
export function diff(reRenderedVNode: RenderedVNode): void {
  let matchedNode;
  // type이 함수일 경우에만 실행하도록 타입 가드를 추가합니다.
  if (typeof reRenderedVNode.type === "function") {
    // 이 블록 안에서 TypeScript는 reRenderedVNode.type을 함수로 안전하게 추론합니다.
    const resolvedComponent: VNode = reRenderedVNode.type(
      reRenderedVNode.props
    );
    const oldChildren = reRenderedVNode._renderedChildren;
    const newChildren = resolvedComponent.props.children;
    newChildren?.forEach((newChild, idx) => {
      //new노드가 key가 존재할 경우
      if (newChild && typeof newChild === "object" && newChild.key) {
        matchedNode = oldChildren?.find(
          (oldChild) => oldChild.key === newChild.key
        );
      }
    });
  }
}
