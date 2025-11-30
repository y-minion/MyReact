import type { VNode } from "@/shared/types/vnode";
import { mapPropToAttr } from "./mapPropToAttr";
import { attachHandlers } from "./attachHandlers";
import { pushCurrentVNode, popCurrentVNode } from "../hook/hookManager";

export interface RenderedVNode extends VNode {
  _renderedChildVNode?: RenderedVNode;
  _renderedChildren?: RenderedVNode[];
  domRef?: HTMLElement | Text;
}

export function internalRender(vnode: VNode, parent: Node): RenderedVNode {
  let renderedVNode: RenderedVNode = { ...vnode, _renderedChildren: [] };

  if (typeof vnode.type === "function") {
    pushCurrentVNode(renderedVNode);
    const resolvedComponent: VNode = vnode.type(vnode.props); //컴포넌트 해소

    // 해소된 Vnode를 internalRender 함수로 재귀한 값인 RenderedVNode를 상위노드와 연결해야 트리 구조가 만들어 진다.
    renderedVNode._renderedChildVNode = internalRender(
      resolvedComponent,
      parent
    );
    popCurrentVNode();
    return renderedVNode;
  }

  //루트노드 생성(연결고리의 시작점) -> 속성 확인하기 Node | HTMLElement
  const rootNode: HTMLElement = document.createElement(vnode.type as string);
  renderedVNode.domRef = rootNode;

  //VNode의 props 순회
  Object.entries(vnode.props).forEach(([prop, value]) => {
    if (prop === "children" && value != null && Array.isArray(value)) {
      childrenHandler(rootNode, value as ChildElementType[], renderedVNode);
    } else if (
      //이벤트 핸들러 props
      isEventHandlerProp(prop, value)
    ) {
      const eventName = mapPropToAttr(prop);
      attachHandlers(rootNode, eventName, value);
    }
    //표준 HTML 속성
    // JavaScript 값으로 null, undefined, 또는 boolean false가 전달되면 해당 속성은 설정되지 않습니다.
    // 속성 값으로 문자열 "false"를 사용하려면, 명시적으로 "false" 문자열을 전달해야 합니다.
    // 예: <input aria-hidden="false"> 를 원하면 value로 "false" (문자열)를 전달합니다.
    else if (value != null && value !== false) {
      const attribute = mapPropToAttr(prop);
      rootNode.setAttribute(attribute, value);
    }
  });
  parent.appendChild(rootNode);
  return renderedVNode;
}

function isEventHandlerProp(prop: string, value: any): boolean {
  return !!prop && prop !== "children" && typeof value === "function";
}

// 자식으로 올 수 있는 요소들의 타입을 정의합니다.
// null 또는 undefined는 렌더링 시 무시될 수 있는 값입니다.
type ChildElementType = string | VNode | number;

function childrenHandler(
  rootNode: HTMLElement,
  value: ChildElementType[],
  renderedVNode: RenderedVNode
) {
  value.forEach((child: ChildElementType) => {
    // 1) 문자열 또는 숫자면 텍스트 노드
    if (typeof child === "string" || typeof child === "number") {
      const textNode = document.createTextNode(String(child));
      rootNode.appendChild(textNode);
      const textRenderedVNode: RenderedVNode = {
        type: "#text",
        props: { nodeValue: String(child) },
        domRef: textNode,
        key: null,
        ref: null,
      };
      renderedVNode._renderedChildren!.push(textRenderedVNode);
      return;
    } else if (child !== null && child !== undefined) {
      renderedVNode._renderedChildren!.push(internalRender(child, rootNode));
      return;
    }
  });
}
