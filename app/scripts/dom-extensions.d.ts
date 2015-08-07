interface NodeSelector {
  // Generic query selectors
  querySelectorAll<TNode extends Node>(selectors: string): NodeListOf<TNode>;
  querySelector<TElement extends Element>(selectors: string): TElement;
}
