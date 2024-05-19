const EVENT_NAMES = ["keydown", "keypress", "keyup", "pasted", "change"];
const TEXT_AREA = document.querySelector("#prompt-textarea");
window.getEventListeners(TEXT_AREA);
const BUTTON = document.querySelector("button.mb-1");

const go = (message = "testing") => {
  TEXT_AREA.focus();
  // set message
  TEXT_AREA.value = message;
  // dispatch event
  for (const eventName of EVENT_NAMES) {
    // // https://stackoverflow.com/a/2856602/1290781
    // const event = document.createEvent("HTMLEvents");
    // event.initEvent(eventName, true, true);
    // console.log(`dispatching ${eventName}`)
    // console.log({event})
    // TEXT_AREA.dispatchEvent(event);

    // // https://stackoverflow.com/questions/23892547/what-is-the-best-way-to-trigger-change-or-input-event-in-react-js
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    ).set;
    nativeInputValueSetter.call(TEXT_AREA, message);
    const event = new Event("input", { bubbles: true });
    TEXT_AREA.dispatchEvent(event);
  }
  // click button
  setTimeout(() => {
    BUTTON.click();
  });
};

go();
