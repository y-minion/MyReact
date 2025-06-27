import { describe, it, expect } from "vitest";
import { diffFinder } from "@/core/reconcile/diffFinder";
import type { RenderedVNode } from "@/core/render/internalRender";

describe("diffFinder 테스트", () => {
  function Test1() {
    return "Test1 컴포넌트입니다.";
  }
  function Test2() {
    return "Test2 컴포넌트입니다.";
  }
  const createVNode = (type: string | Function): RenderedVNode => ({
    type,
    props: {},
    key: null,
    ref: null,
    domRef: document.createElement("div"),
    _renderedChildren: [],
  });

  it("두 노드의 타입이 모두 Function이고, type이 동일한 경우 true를 반환해야합니다.", () => {
    const oldVNode = createVNode(Test1);
    const newVNode = createVNode(Test1);

    const result = diffFinder(oldVNode, newVNode);

    expect(result).toBe(true);
  });

  it("두 노드의 타입이 모두 Function이고, type이 다른 경우 false를 반환해야합니다.", () => {
    const oldVNode = createVNode(Test1);
    const newVNode = createVNode(Test2);

    const result = diffFinder(oldVNode, newVNode);

    expect(result).toBe(false);
  });

  it("두 노드의 타입이 호스트 엘리먼트이고, 서로 같을 경우 true를 반환 해야 합니다.", () => {
    const oldVNode = createVNode("div");
    const newVNode = createVNode("div");

    const result = diffFinder(oldVNode, newVNode);

    expect(result).toBe(true);
  });
  it("두 노드의 타입이 호스트 엘리먼트이고, 서로 다른경우 false를 반환 해야 합니다.", () => {
    const oldVNode = createVNode("div");
    const newVNode = createVNode("span");

    const result = diffFinder(oldVNode, newVNode);

    expect(result).toBe(false);
  });

  it("두 노드의 타입이 function과 호스트 엘리먼트로 서로 다른경우 false를 반환 해야 합니다.", () => {
    const oldVNode = createVNode(Test1);
    const newVNode = createVNode("span");

    const result = diffFinder(oldVNode, newVNode);

    expect(result).toBe(false);
  });
});
