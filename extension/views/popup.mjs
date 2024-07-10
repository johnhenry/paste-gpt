const DEFAULT_SELECTOR = "html";

import { DEFAULT_OPTIONS } from "./default-options.mjs";

const replace = (template, values) => {
  return template.replace(/{(.*?)}/g, (match, token) => values[token] || match);
};

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
  (target = "chatgpt") =>
  async () => {
    document.getElementById("overlay").style.display = "flex";
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        args: [
          document.getElementById("selector").value || DEFAULT_SELECTOR,
          document.getElementById("use-html").checked,
          document.getElementById("get-all").checked,
        ],
        func,
      });
      const content = result[0].result.trim();
      const instruction = document.getElementById("instruction").value.trim();

      let url;
      let selector;
      switch (target) {
        case "claude":
          url = "https://claude.ai/new";
          selector = `[data-placeholder="How can Claude help you today?"]`;
          break;
        case "chatgpt":
        default:
          url = "https://chatgpt.com";
          selector = "textarea";
          break;
      }

      const prompt =
        replace(instruction, {
          url: tab.url,
          content: result[0].result,
        }) || content;
      const { id: newTabId } = await newTabReady({
        url,
        active: false,
      });
      chrome.scripting.executeScript({
        // world: "MAIN",
        target: { tabId: newTabId },
        args: [prompt || (defaultPrompt && prompt), target, selector],
        func: (prompt, target, selector) => {
          const waitForSelector = async (selector) => {
            return new Promise((resolve) => {
              const observer = new MutationObserver((mutationsList) => {
                for (const mutation of mutationsList) {
                  if (
                    mutation.type === "childList" &&
                    mutation.addedNodes.length > 0
                  ) {
                    const element = document.querySelector(selector);
                    if (element) {
                      observer.disconnect();
                      resolve(element);
                    }
                  }
                }
              });

              observer.observe(document.documentElement, {
                childList: true,
                subtree: true,
              });
            });
          };

          const set = (prompt, TEXT_AREA) => {
            if (!prompt || !TEXT_AREA) {
              return;
            }
            switch (target) {
              case "claude":
                TEXT_AREA.textContent = prompt;
                break;
              case "chatgpt":
              default:
                TEXT_AREA.value = prompt;
                TEXT_AREA.dispatchEvent(new Event("input", { bubbles: true }));
                break;
            }
          };
          const loaded = async () => {
            await waitForSelector(selector);
            const TEXT_AREA = document.querySelector(selector);
            set(prompt, TEXT_AREA);
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
const PASTE_BUTTON_CHATGPT = document.getElementById("paste-chatgpt");
PASTE_BUTTON_CHATGPT.addEventListener("click", solve("chatgpt"));
const PASTE_BUTTON_CLAUDEAI = document.getElementById("paste-claudeai");
PASTE_BUTTON_CLAUDEAI.addEventListener("click", solve("claude"));

const INSTRUCTION_TEXTAREA = document.getElementById("instruction");

const SELECT_PROMPTS = document.getElementById("prompts");
SELECT_PROMPTS.addEventListener("change", () => {
  INSTRUCTION_TEXTAREA.value = SELECT_PROMPTS.value;
});

const loadOptions = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      "options",
      ({ options = DEFAULT_OPTIONS } = { options: DEFAULT_OPTIONS }) => {
        resolve(options);
      }
    );
  });
};
try {
  const options = await loadOptions();
  options.forEach((item, index) => {
    const option = document.createElement("option");
    option.textContent = item.title;
    option.value = item.prompt;
    if (index === 0) {
      option.selected = true;
    }
    // option.selected = !index || null;
    SELECT_PROMPTS.appendChild(option);
  });
} catch (error) {
  console.error("There was a problem with the fetch operation:", error);
}
SELECT_PROMPTS.dispatchEvent(new Event("change"));
