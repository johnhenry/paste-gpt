const set = (message, TEXT_AREA, BUTTON) => {
  if (!message) {
    return;
  }
  TEXT_AREA.value = message;
  TEXT_AREA.dispatchEvent(new Event("input", { bubbles: true }));
  // click button
  if (BUTTON) {
    setTimeout(() => {
      if (!BUTTON.disabled) {
        BUTTON.click();
      }
    });
  }
};
// set(
//   "what are you doing today?",
//   document.querySelector("#prompt-textarea"),
//   document.querySelector("button.mb-1")
// );
export default set;
