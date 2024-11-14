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
  (target = "chatgpt", run = false) =>
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

      const selector = {};
      switch (target) {
        case "claude":
          selector.url = "https://claude.ai/new";
          selector.textbox = `[data-placeholder="How can Claude help you today?"]`;
          selector.button = `fieldset [aria-label="Write your prompt to Claude"]~div button`;
          break;
        case "chatgpt":
        default:
          selector.url = "https://chatgpt.com";
          selector.textbox = "#prompt-textarea";
          selector.button =
            "#composer-background button[data-testid='send-button']";
          break;
      }

      const prompt =
        replace(instruction, {
          url: tab.url,
          content: result[0].result,
        }) || content;
      const { id: newTabId } = await newTabReady({
        url: selector.url,
        active: false,
      });
      chrome.scripting.executeScript({
        // world: "MAIN",
        target: { tabId: newTabId },
        args: [prompt || (defaultPrompt && prompt), target, selector, run],
        func: (prompt, target, selector, run) => {
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

          const set = async (prompt, TEXT_AREA) => {
            if (!prompt || !TEXT_AREA) {
              return;
            }
            TEXT_AREA.textContent = prompt;
            if (run) {
              const button = await waitForSelector(selector.button);
              switch (target) {
                case "claude":
                  //
                  break;
                case "chatgpt":
                default:
                  TEXT_AREA.dispatchEvent(
                    new Event("input", { bubbles: true })
                  );
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                  button.removeAttribute("disabled");
                  break;
              }
              button.click();
            }
          };
          const loaded = async () => {
            const TEXT_AREA = await waitForSelector(selector.textbox);
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
const RUN_BUTTON_CHATGPT = document.getElementById("run-chatgpt");
RUN_BUTTON_CHATGPT.addEventListener("click", solve("chatgpt", true));

const PASTE_BUTTON_CLAUDEAI = document.getElementById("paste-claudeai");
PASTE_BUTTON_CLAUDEAI.addEventListener("click", solve("claude"));
const RUN_BUTTON_CLAUDEAI = document.getElementById("run-claudeai");
RUN_BUTTON_CLAUDEAI.addEventListener("click", solve("claude", true));

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

// Download
const EXTRACT_CONVERSATION_BUTTON = document.getElementById(
  "extract-conversation"
);
let domain;
chrome.tabs.query({ active: true, currentWindow: true }, function ([tabs]) {
  domain = new URL(tabs.url).hostname;
  if (domain !== "chatgpt.com" && domain !== "claude.ai") {
    domain = undefined;
  }
  if (!domain) {
    EXTRACT_CONVERSATION_BUTTON.style.display = "none";
  }
});

EXTRACT_CONVERSATION_BUTTON.addEventListener("click", async () => {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const extractChatGPTConversation = async () => {
      const turns = Array.from(
        document.querySelectorAll('[data-testid^="conversation-turn-"]')
      );
      const conversation = [];

      for (const turn of turns) {
        const role =
          turn
            .querySelector("h5,h6")
            ?.textContent.replace(" said:", "")
            .toLowerCase() || "unknown";
        const textContent = turn.querySelector(".markdown")?.textContent || "";

        const attachments = await Promise.all(
          Array.from(turn.querySelectorAll("img")).map(async (img) => {
            try {
              const response = await fetch(img.src);
              const blob = await response.blob();
              return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () =>
                  resolve({
                    type: blob.type,
                    originalUrl: img.src,
                    base64: reader.result,
                    alt: img.alt,
                    width: img.width,
                    height: img.height,
                  });
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
            } catch (error) {
              console.warn(`Failed to convert attachment to base64: ${error}`);
              return {
                type: "unknown",
                originalUrl: img.src,
                alt: img.alt,
                width: img.width,
                height: img.height,
                error: "Failed to convert to base64",
              };
            }
          })
        );

        const codeBlocks = Array.from(turn.querySelectorAll("pre code")).map(
          (code) => ({
            language: code.className.replace("hljs language-", ""),
            code: code.textContent,
          })
        );

        conversation.push({
          role,
          content: textContent,
          attachments,
          codeBlocks,
          timestamp: new Date().toISOString(),
        });
      }

      return conversation;
    };

    const extractClaudeConversation = async () => {
      const turns = Array.from(
        document.querySelectorAll("[data-test-render-count]")
      );
      const conversation = [];

      for (const turn of turns) {
        const userDiv = turn.querySelector('[data-testid="user-message"]');
        const role = userDiv ? "user" : "assistant";

        let textContent = "";
        if (role === "user") {
          textContent = userDiv?.textContent || "";
        } else {
          const messageDiv = turn.querySelector(".font-claude-message");
          textContent = messageDiv?.textContent || "";
        }

        const attachments = await Promise.all(
          Array.from(turn.querySelectorAll("img")).map(async (img) => {
            try {
              const response = await fetch(img.src);
              const blob = await response.blob();
              return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () =>
                  resolve({
                    type: blob.type,
                    originalUrl: img.src,
                    base64: reader.result,
                    alt: img.alt,
                    width: img.width,
                    height: img.height,
                  });
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
            } catch (error) {
              console.warn(`Failed to convert attachment to base64: ${error}`);
              return {
                type: "unknown",
                originalUrl: img.src,
                alt: img.alt,
                width: img.width,
                height: img.height,
                error: "Failed to convert to base64",
              };
            }
          })
        );

        const codeBlocks = Array.from(turn.querySelectorAll("pre code")).map(
          (code) => ({
            language: code.className.replace("language-", ""),
            code: code.textContent,
          })
        );

        const artifacts = Array.from(
          turn.querySelectorAll('[data-testid^="artifact-"]')
        ).map((artifact) => ({
          id: artifact.dataset.testid.replace("artifact-", ""),
          type: artifact.dataset.type || "unknown",
          content: artifact.textContent,
        }));

        conversation.push({
          role,
          content: textContent,
          attachments,
          codeBlocks,
          artifacts,
          timestamp: new Date().toISOString(),
        });
      }

      return conversation;
    };

    const downloadJSON = (data, filename) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const extractFunc =
      domain === "chatgpt.com"
        ? extractChatGPTConversation
        : extractClaudeConversation;
    const filename =
      domain === "chatgpt.com"
        ? "chatgpt-conversation.json"
        : "claude-conversation.json";

    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractFunc,
    });

    const conversation = result[0].result;
    downloadJSON(conversation, filename);
  } catch (error) {
    console.error("Failed to extract conversation:", error);
    alert(`Failed to extract conversation: ${error.message}`);
  }
});
