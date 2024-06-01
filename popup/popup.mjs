const newTabReady = async (options) => {
  const newTab = await chrome.tabs.create(options);
  const { id } = newTab;
  await new Promise((resolve) => {
    const x = (tabId, info) => {
      if (tabId === id && info.status === "complete") {
        chrome.tabs.update(tabId, { highlighted: true, active: true });
        chrome.tabs.onUpdated.removeListener(x);
        resolve();
      }
    };
    chrome.tabs.onUpdated.addListener(x);
  });
  return newTab;
};
const func = (selector = "html", html = false, all = false) =>
  all
    ? document
        .querySelectorAll(selector)
        .values()
        .toArray()
        .map((node) => node[html ? "innerHTML" : "innerText"])
        .join("\n\n")
    : document.querySelector(selector)[html ? "innerHTML" : "innerText"];

const solve =
  (autorun = false) =>
  async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        args: [
          document.getElementById("selector").value,
          document.getElementById("use-html").checked,
          document.getElementById("get-all").checked,
        ],
        func,
      });
      const data = result[0].result;
      const instruction = document.getElementById("instruction").value.trim();
      const instructionSet = Boolean(instruction);
      const prompt = instructionSet
        ? `${instruction}:

${data}`
        : data;

      const { id: newTabId } = await newTabReady({
        url: "https://chatgpt.com",
        active: false,
      });
      chrome.scripting.executeScript({
        // world: "MAIN",
        target: { tabId: newTabId },
        args: [prompt, autorun],
        func: (prompt, autorun) => {
          const MIN_WAIT = 500;
          const set = (prompt, TEXT_AREA, CHAT_BUTTON) => {
            if (!prompt || !TEXT_AREA || !CHAT_BUTTON) {
              return;
            }
            if (!TEXT_AREA) {
              return;
            }
            // set prompt text
            TEXT_AREA.value = prompt;
            // dispatch input event to make button active
            TEXT_AREA.dispatchEvent(new Event("input", { bubbles: true }));
            // click button
            if (autorun) {
              setTimeout(() => {
                if (!CHAT_BUTTON.disabled) {
                  CHAT_BUTTON.click();
                }
              }, MIN_WAIT + Math.random() * MIN_WAIT);
            }
          };
          const closestCousins = (element, target) => {
            let parent = document.querySelector(element)?.parentElement;
            while (parent) {
              let items;
              if ((items = parent.querySelectorAll(target)).length) {
                return items;
              }
              parent = parent.parentElement;
            }
            return document.querySelectorAll(null);
          };
          const loaded = () => {
            const TEXT_AREA = document.querySelector("textarea");
            const CHAT_BUTTON = closestCousins(
              "textarea",
              "button:only-of-type"
            )[0];
            set(prompt, TEXT_AREA, CHAT_BUTTON);
          };
          if (document.readyState === "complete") {
            loaded();
          } else {
            window.addEventListener("load", loaded);
          }
        },
      });
    } catch (error) {
      alert(`${error.message}`);
    } finally {
      const scripts = await chrome.scripting.getRegisteredContentScripts();
      const scriptIds = scripts.map((script) => script.id);
      return chrome.scripting.unregisterContentScripts(scriptIds);
    }
  };
const PASTE_BUTTON = document.getElementById("paste-button");
PASTE_BUTTON.addEventListener("click", solve(false));
const RUN_BUTTON = document.getElementById("run-button");
RUN_BUTTON.addEventListener("click", solve(true));
