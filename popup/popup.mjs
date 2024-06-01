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
const funcs = {
  "www.hackerrank.com": () =>
    document.querySelector(".challenge-body-html").innerText,
  "leetcode.com": () =>
    document
      .getElementById("55f5d008-5f28-62ae-c1a9-fd8a685a89f9")
      .querySelector(
        "div > div.flex.w-full.flex-1.flex-col.gap-4.overflow-y-auto.px-4.py-5"
      ).innerText,
};

const solve = async () => {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const url = new URL(tab.url);
    const func = funcs[url.hostname];
    if (!func) {
      throw new Error(`host: ${url.hostname} not supported`);
    }
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func,
    });
    const language = document.getElementById("languages").value;
    const prompt = `please solve the following using ${language}:
${result[0].result}`;
    const { id: newTabId } = await newTabReady({
      url: "https://chatgpt.com",
      active: false,
    });
    chrome.scripting.executeScript({
      // world: "MAIN",
      target: { tabId: newTabId },
      args: [prompt],
      func: (prompt) => {
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
          setTimeout(() => {
            if (!CHAT_BUTTON.disabled) {
              CHAT_BUTTON.click();
            }
          }, MIN_WAIT + Math.random() * MIN_WAIT);
        };
        const closestCousins = (element, target) => {
          let parent = document.querySelector(element)?.parentElement;
          while (parent) {
            let item;
            if ((item = parent.querySelectorAll(target)).length) {
              return item;
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
const SOLVE_BUTTON = document.getElementById("solve-button");
SOLVE_BUTTON.addEventListener("click", solve);
