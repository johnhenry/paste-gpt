const DEFAULT_OPTIONS = [
  {
    title: "Summarize (simple)",
    prompt:
      "Please summarize the following \n\n ---- \n\nurl: {url}\n\n{content}",
  },
  {
    title: "Summarize",
    prompt: `Summarize the text that follows this prompt. You may use the source URL for context. Your summary should capture the main points and key information while adhering to these guidelines:

Identify the overall topic or theme.
Extract the most important ideas, facts, or arguments.
Use any existing structure (e.g., headings, sections) to organize your summary.
For unstructured content, group related information logically.
Highlight significant data, statistics, or central quotes.
If HTML is present, focus on textual information rather than markup.
Aim for a summary length of about 20% of the original, adjusting for complexity.
Use clear, concise language, avoiding unnecessary details or repetition.
For multiple distinct topics, provide a brief overview of each.
Conclude with the main takeaway or central message.

Your summary should allow someone unfamiliar with the content to quickly grasp its essence and decide if they need to read the full text.
Begin your response with "Summary:" followed by your concise summary. After the summary, add a line break and then write "Original word count:" followed by the number of words in the original text, and "Summary word count:" followed by the number of words in your summary.
The content to be summarized begins immediately after this prompt:

----

url: {url}

{content}`,
  },
  {
    title: "Extract Data",
    prompt: `Analyze the provided web page content and extract all useful data into a well-structured table. Follow these guidelines:

1. Identify the main topic or purpose of the web page.

2. Scan the content for structured data such as:
   - Lists
   - Tables
   - Product information
   - User profiles
   - Event details
   - Statistical data
   - Any other relevant structured information

3. For each set of structured data, create a table with the following format:
   - Use markdown table syntax
   - Include a clear, descriptive title for the table
   - Create appropriate column headers
   - Fill in the data in a logical and consistent manner

4. If there are multiple distinct sets of data, create separate tables for each.

5. For any important unstructured data, create a table with two columns:
   - "Category" (e.g., "Main Description", "Key Features", "About the Author")
   - "Details" (containing the relevant information)

6. If the page contains forms, create a table listing the form fields and their types.

7. For navigation menus or site structures, create a table representing the hierarchy.

8. If there are recurring patterns (e.g., product listings), ensure consistency in how you represent this data across entries.

9. Include metadata about the page in a separate table (e.g., page title, URL, last updated date if available).

10. If there are images with relevant information, create a table with columns for image description and alt text.

11. For any data that doesn't fit neatly into a table structure, provide a brief explanation of why it was excluded and how it might be relevant.

Begin your response with a brief overview of the web page's content and the number of tables you've created. Then present each table, separated by horizontal lines.

Example of table format:

| Column 1 Header | Column 2 Header | Column 3 Header |
|-----------------|-----------------|-----------------|
| Row 1, Col 1    | Row 1, Col 2    | Row 1, Col 3    |
| Row 2, Col 1    | Row 2, Col 2    | Row 2, Col 3    |

The web page content to be analyzed begins immediately after this prompt:

----

url: {url}

{content}`,
  },

  {
    title: "Explain Like I'm Five",
    prompt: `Please explain the following in simple terms that a five-year-old would understand: \n\n ---- \n\nurl: {url}\n\n{content}`,
  },

  {
    title: "Summarize (simple)",
    prompt:
      "Please summarize the following \n\n ---- \n\nurl: {url}\n\n{content}",
  },

  {
    title: "Headlines and Sub Headings (simple)",
    prompt:
      "Please Extract all the headlines and subheadings from this text. \n\n ---- \n\nurl: {url}\n\n{content}",
  },
  {
    title: "Links and Urls",
    prompt:
      "Please extract all links and the URLs from the following content. Group them by domain.\n\n ---- \n\nurl: {url}\n\n{content}",
  },

  {
    title: "Story Style ",
    prompt:
      "Please write a fictional short story in the style of the following conent content. It should have a beginning, a middle featuring a climax, and an end that features a twist: \n\n ---- \n\nurl: {url}\n\n{content}",
  },
  {
    title: "Magic Mirror",
    prompt:
      "Please extract the main content from this text and create a near-clone that mimics the style, structure, word choice, tone, and voice... But it has modified content -- locations, people, events, and general situations are all made up by you. \n\n ---- \n\n{content}",
  },
  {
    title: "Evil Twin",
    prompt:
      "Please extract the main content from this text and create a near-clone that mimics the style, structure, word choice, tone, and voice... But the content is polar opposite. Relationships are reversed. Good things are bad, bad things are good, and vice versa. \n\n ---- \n\n{content}",
  },
  {
    title: "Opposite Day",
    prompt:
      "Please extract the main content from this text and create a near-clone except every situation, thing, etc is litterally the opposite or reversed. \n\n ---- \n\n{content}",
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
