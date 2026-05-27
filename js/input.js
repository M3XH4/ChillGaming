export function createInputManager({ mobile, onInput, onAction }) {
  const keyHandler = (event) => onInput(event.key, event);
  const touchHandler = (event) => {
    const actionButton = event.target.closest("[data-mobile-action]");
    if (actionButton) {
      onAction?.(actionButton.dataset.mobileAction, event);
      return;
    }
    const button = event.target.closest("[data-key]");
    if (!button) return;
    onInput(button.dataset.key, event);
  };

  document.addEventListener("keydown", keyHandler);
  mobile?.addEventListener("click", touchHandler);

  return {
    destroy() {
      document.removeEventListener("keydown", keyHandler);
      mobile?.removeEventListener("click", touchHandler);
    },
  };
}
