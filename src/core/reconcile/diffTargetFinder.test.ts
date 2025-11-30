import { describe, it, expect } from "vitest";
import { diffTargetFinder } from "@/core/reconcile/diffTargetFinder";
import type { RenderedVNode } from "@/core/render/internalRender";

describe("diffTargetFinder가 올바른 비교 대상을 찾아야 합니다. target을 비교하기 전 target을 찾는 테스트를 진행합니다.", () => {
  const createVNode = (
    key: string | number | null,
    type = "div"
  ): RenderedVNode => ({
    type,
    props: {},
    key,
    ref: null,
    domRef: document.createElement("div"),
    _renderedChildren: [],
  });

  it("리렌링시 새롭게 생성되는 노드의 key를 기준으로 동일한 key인 노드를 root 트리의 노드에서 target을 찾아야 합니다.", () => {
    const oldVNodeArr: RenderedVNode[] = [
      createVNode("a"),
      createVNode("b"),
      createVNode("c"),
    ];
    const newVNode = createVNode("b");

    const result = diffTargetFinder(oldVNodeArr, newVNode, 0);

    expect(result).toBe(oldVNodeArr[1]);
  });

  it("key가 존재하지 않는경우 index를 기준으로 root 트리의 노드에서 동일한 index에 해당하는 target을 찾아야 합니다.", () => {
    const oldVNodeArr: RenderedVNode[] = [
      createVNode(null, "span"),
      createVNode(null, "h1"),
      createVNode(null),
    ];
    const newVNode = createVNode(null);

    const result = diffTargetFinder(oldVNodeArr, newVNode, 1);

    expect(result).toBe(oldVNodeArr[1]);
  });

  it("키가 없고 매치되는 인덱스도 존재하지 않을 경우 null을 반환해야 합니다.", () => {
    const oldVNodeArr: RenderedVNode[] = [createVNode(null)];
    const newVNode = createVNode(null);

    const result = diffTargetFinder(oldVNodeArr, newVNode, 1);

    expect(result).toBe(null);
  });

  it("oldVNodeArr에 있는 VNode들이 key가 존재하더라도 리렌더링된 노드의 key와 일치 하지 않으면 index비교를 진행해 동일한 index에 있는 노드를 반환해야합니다.", () => {
    const oldVNodeArr: RenderedVNode[] = [
      createVNode("x"),
      createVNode("y"),
      createVNode("z"),
    ];
    const newVNode = createVNode("no-match");

    const result = diffTargetFinder(oldVNodeArr, newVNode, 0);

    expect(result).toBe(oldVNodeArr[0]); // 키가 없다고 간주되므로 인덱스 0 위치 비교
  });
  it("oldVNodeArr에 있는 VNode들이 key가 존재하더라도 리렌더링된 노드의 key와 일치 하지 않으면 index비교를 진행하는데, 만약 index와 일치하는 노드가 없다면 null을 반환해야 합니다.", () => {
    const oldVNodeArr: RenderedVNode[] = [
      createVNode("x"),
      createVNode("y"),
      createVNode("z"),
    ];
    const newVNode = createVNode("no-match");

    const result = diffTargetFinder(oldVNodeArr, newVNode, 4);

    expect(result).toBe(null); // 키가 없다고 간주되므로 인덱스 0 위치 비교
  });
});
