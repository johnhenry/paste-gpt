import { DEFAULT_OPTIONS } from "./default-options.mjs";

const FORM_OPTIONS = document.getElementById("form-options");
const BUTTON_SAVE = document.getElementById("button-save");
const BUTTON_APPENDPROMPT = document.getElementById("button-appendprompt");
const BUTTON_RESET = document.getElementById("button-reset");

const populate = (element, options) => {
  for (const [k, v] of Object.entries(options)) {
    console.log(k, v);
    const target = element.querySelector(`[name=${k}]`);
    console.log(target);
    if (target) {
      target.value = v || "";
    }
  }
  return element;
};
const appendPrompt = (options = {}) => {
  const form = document.getElementById("form-options");
  const button = document.getElementById("button-appendprompt");
  form.insertBefore(
    populate(
      document.getElementById("template-prompt").content.cloneNode(true),
      options
    ),
    button
  );
};

const saveOptions = () => {
  const data = new FormData(FORM_OPTIONS);
  const titles = data.getAll("title");
  const prompts = data.getAll("prompt");
  const options = [];
  for (let i = 0; i < titles.length; i++) {
    const title = titles[i];
    const prompt = prompts[i];
    options.push({ title, prompt });
  }
  chrome.storage.local.set({ options }, () => {
    alert("Options saved!");
  });
};

const loadOptions = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      "options",
      ({ options = DEFAULT_OPTIONS } = { options: DEFAULT_OPTIONS }) => {
        console.log(JSON.stringify(options, null, " "));
        for (const option of options) {
          appendPrompt(option);
        }
        resolve(options);
      }
    );
  });
};

FORM_OPTIONS.addEventListener("click", (event) => {
  // activate if event comes from button.button-removeprompt
  if (event.target.classList.contains("button-removeprompt")) {
    // remove prompt
    event.target.parentElement.remove();
    return;
  }
  event.preventDefault();
});

BUTTON_SAVE.addEventListener("click", saveOptions);
BUTTON_APPENDPROMPT.addEventListener("click", appendPrompt);

if (document.readyState === "complete") {
  // if windows is already loaded, set value directly
  loadOptions();
} else {
  // otherwise, wait for the window to load
  window.addEventListener("load", loadOptions);
}
BUTTON_RESET.addEventListener("click", () => {
  confirm("Reset All?") &&
    chrome.storage.local.set({ options: DEFAULT_OPTIONS }, () => {
      alert("Options reset!");
      window.location.reload();
    });
});
