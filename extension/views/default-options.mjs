const DEFAULT_OPTIONS = [
  {
    title: "Summarize",
    prompt:
      "Please summarize the following content:\n\nurl: {url}\n\n{content}",
  },
  {
    title: "Solve",
    prompt: "Please solve the following problem:\n\n{content}",
  },

  {
    title: "URL + Content",
    prompt: "url: {url}\n{content}",
  },
  {
    title: "Content",
    prompt: "",
  },
];

export { DEFAULT_OPTIONS };
export default DEFAULT_OPTIONS;
