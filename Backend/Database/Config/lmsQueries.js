import bcrypt from "bcryptjs";
import crypto from "crypto";
import { query } from "./config.db.js";

const WEB_COURSE_SLUG = "web-development";

const hashResetToken = (token) =>
  crypto.createHash("sha256").update(String(token)).digest("hex");

export const lmsTableSchema = `
CREATE TABLE IF NOT EXISTS learner_accounts (
  id SERIAL PRIMARY KEY,
  registration_id INTEGER REFERENCES registrations(id) ON DELETE SET NULL,
  parent_email VARCHAR(255) NOT NULL,
  child_email VARCHAR(255),
  learner_email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(80) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  points INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  reset_token VARCHAR(255),
  reset_expires TIMESTAMP,
  last_activity_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lms_courses (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(80) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lms_modules (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  module_order INTEGER NOT NULL,
  unlock_points INTEGER DEFAULT 0,
  UNIQUE(course_id, module_order)
);

CREATE TABLE IF NOT EXISTS lms_lessons (
  id SERIAL PRIMARY KEY,
  module_id INTEGER NOT NULL REFERENCES lms_modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  notes TEXT NOT NULL,
  example_html TEXT DEFAULT '',
  example_css TEXT DEFAULT '',
  example_js TEXT DEFAULT '',
  task_prompt TEXT NOT NULL,
  required_html TEXT[] DEFAULT '{}',
  required_css TEXT[] DEFAULT '{}',
  required_js TEXT[] DEFAULT '{}',
  tasks JSONB DEFAULT '[]'::jsonb,
  min_study_seconds INTEGER DEFAULT 60,
  unlock_at TIMESTAMP,
  is_locked BOOLEAN DEFAULT FALSE,
  content_locked_by_admin BOOLEAN DEFAULT FALSE,
  lesson_order INTEGER NOT NULL,
  points_available INTEGER DEFAULT 100,
  is_published BOOLEAN DEFAULT TRUE,
  UNIQUE(module_id, lesson_order)
);

CREATE TABLE IF NOT EXISTS lms_quiz_questions (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER NOT NULL REFERENCES lms_lessons(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank')),
  options JSONB DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  question_order INTEGER NOT NULL,
  UNIQUE(lesson_id, question_order)
);

CREATE TABLE IF NOT EXISTS learner_course_enrollments (
  id SERIAL PRIMARY KEY,
  learner_id INTEGER NOT NULL REFERENCES learner_accounts(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  registration_id INTEGER REFERENCES registrations(id) ON DELETE SET NULL,
  status VARCHAR(30) DEFAULT 'active',
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(learner_id, course_id)
);

CREATE TABLE IF NOT EXISTS learner_lesson_progress (
  id SERIAL PRIMARY KEY,
  learner_id INTEGER NOT NULL REFERENCES learner_accounts(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES lms_lessons(id) ON DELETE CASCADE,
  html_code TEXT DEFAULT '',
  css_code TEXT DEFAULT '',
  js_code TEXT DEFAULT '',
  quiz_score INTEGER DEFAULT 0,
  code_score INTEGER DEFAULT 0,
  completion_score INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  points_awarded INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  status VARCHAR(30) DEFAULT 'in_progress',
  strengths TEXT,
  improvements TEXT,
  teacher_comment TEXT,
  is_public_portfolio BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(learner_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS lms_parent_email_log (
  id SERIAL PRIMARY KEY,
  learner_id INTEGER REFERENCES learner_accounts(id) ON DELETE SET NULL,
  lesson_id INTEGER REFERENCES lms_lessons(id) ON DELETE SET NULL,
  parent_email VARCHAR(255) NOT NULL,
  child_email VARCHAR(255),
  subject TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'queued',
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teacher_accounts (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  verification_expires TIMESTAMP,
  reset_token VARCHAR(255),
  reset_expires TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lms_classes (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  teacher_id INTEGER REFERENCES teacher_accounts(id) ON DELETE SET NULL,
  name VARCHAR(140) NOT NULL,
  capacity INTEGER DEFAULT 15 CHECK (capacity <= 15),
  status VARCHAR(30) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lms_class_learners (
  id SERIAL PRIMARY KEY,
  class_id INTEGER NOT NULL REFERENCES lms_classes(id) ON DELETE CASCADE,
  learner_id INTEGER NOT NULL REFERENCES learner_accounts(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(class_id, learner_id)
);

ALTER TABLE learner_accounts ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
ALTER TABLE learner_accounts ADD COLUMN IF NOT EXISTS reset_expires TIMESTAMP;
ALTER TABLE teacher_accounts ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
ALTER TABLE teacher_accounts ADD COLUMN IF NOT EXISTS reset_expires TIMESTAMP;
ALTER TABLE lms_lessons ADD COLUMN IF NOT EXISTS tasks JSONB DEFAULT '[]'::jsonb;
ALTER TABLE lms_lessons ADD COLUMN IF NOT EXISTS min_study_seconds INTEGER DEFAULT 60;
ALTER TABLE lms_lessons ADD COLUMN IF NOT EXISTS unlock_at TIMESTAMP;
ALTER TABLE lms_lessons ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;
ALTER TABLE lms_lessons ADD COLUMN IF NOT EXISTS content_locked_by_admin BOOLEAN DEFAULT FALSE;
`;

const modules = [
  ["Introduction to Web Development", "Internet, websites, browsers, files, and tools."],
  ["HTML Basics", "Tags, structure, headings, paragraphs, links, and images."],
  ["HTML Forms & Tables", "Inputs, buttons, labels, forms, and tables."],
  ["CSS Basics", "Colors, fonts, spacing, borders, and backgrounds."],
  ["CSS Layout", "Flexbox, grid, cards, sections, and responsive design."],
  ["JavaScript Basics", "Variables, buttons, events, alerts, and simple logic."],
  ["Interactive Websites", "DOM, forms, validation, calculators, and mini apps."],
  ["Project Building", "Landing pages, profiles, school websites, and portfolios."],
  ["Publishing Websites", "Hosting, links, folders, and basic security."],
  ["Final Web Project", "A complete learner website."],
];

const buildLessonTasks = (lesson) => [
  {
    title: "Build the basic structure",
    prompt: `${lesson.taskPrompt} Start with the correct HTML structure. Do not copy the example exactly; use your own topic and text.`,
    requiredHtml: lesson.requiredHtml,
    requiredCss: [],
    requiredJs: [],
  },
  {
    title: "Style the work",
    prompt:
      "Improve your page with the CSS skills from this lesson. Add your own colors, spacing, and layout choices.",
    requiredHtml: [],
    requiredCss: lesson.requiredCss,
    requiredJs: [],
  },
  {
    title: "Finish and test",
    prompt:
      "Complete the final version. If this lesson has JavaScript, make it interactive. If not, polish the design and content.",
    requiredHtml: lesson.requiredHtml.slice(0, 2),
    requiredCss: lesson.requiredCss.slice(0, 2),
    requiredJs: lesson.requiredJs,
  },
];

const buildEnhancedNotes = (lesson, moduleTitle) => {
  const htmlTargets = lesson.requiredHtml.length
    ? `HTML focus: ${lesson.requiredHtml.join(", ")}.`
    : "HTML focus: keep the structure meaningful and easy to read.";
  const cssTargets = lesson.requiredCss.length
    ? `CSS focus: ${lesson.requiredCss.join(", ")}.`
    : "CSS focus: keep spacing, readability, and consistency in mind.";
  const jsTargets = lesson.requiredJs.length
    ? `JavaScript focus: ${lesson.requiredJs.join(", ")}.`
    : "JavaScript focus: no script is required for this lesson unless you want to extend it.";

  return `${lesson.notes}

In this ${moduleTitle} lesson, read the example carefully and notice what each part is doing before you write your own version. Do not copy the example word-for-word. Change the topic, text, names, colors, and layout choices so your work shows that you understand the idea.

${htmlTargets}
${cssTargets}
${jsTargets}

Good practice steps: first build the structure, then add style, then test the page in the preview. If something does not appear, check spelling, closing tags, selectors, and whether your JavaScript is selecting the right element.`;
};

const buildQuizSet = (lesson) => {
  const firstQuestion = lesson.quiz?.[0] || [
    `What is the main idea in ${lesson.title}?`,
    ["Structure", "Random typing", "Deleting files", "Guessing"],
    "Structure",
  ];

  return [
    firstQuestion,
    [
      `Which code area is most important to start this ${lesson.title} task?`,
      ["HTML structure", "Browser history", "File size only", "Keyboard color"],
      "HTML structure",
    ],
    [
      "What should you do before submitting your work?",
      ["Test it in the preview", "Close the browser", "Remove all headings", "Copy the example exactly"],
      "Test it in the preview",
    ],
    [
      `Type one HTML item required in this lesson.`,
      [],
      String(lesson.requiredHtml?.[0] || "html").replace(/[<>=]/g, ""),
    ],
    [
      `Type one CSS or JavaScript keyword used in this lesson.`,
      [],
      String(lesson.requiredCss?.[0] || lesson.requiredJs?.[0] || "style").replace(/[<>=]/g, ""),
    ],
  ];
};

const slugifyCourse = (title = "") =>
  String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const moduleLessons = [
  [
    {
      title: "How Websites Work",
      notes:
        "A website is a collection of files opened by a browser. The browser requests a page through the internet, reads HTML for structure, CSS for styling, and JavaScript for behavior. Developers organize files in folders so pages, images, and styles are easy to maintain.",
      exampleHtml:
        "<main>\n  <h1>My First Website</h1>\n  <p>This page is made from HTML, CSS, and JavaScript.</p>\n  <a href=\"https://www.brightcoderske.co.ke\">Visit Bright Coders</a>\n</main>",
      exampleCss:
        "body { font-family: Arial; background: #f0f9ff; color: #0f172a; }\nmain { max-width: 680px; margin: 40px auto; }",
      exampleJs: "console.log('The browser loaded my web page');",
      taskPrompt:
        "Create a welcome page explaining what a browser, website, and file are. Include a heading, paragraph, and link.",
      requiredHtml: ["<main", "<h1", "<p", "<a"],
      requiredCss: ["font-family", "background"],
      requiredJs: ["console.log"],
      quiz: [
        ["Which language gives a page its structure?", ["HTML", "CSS", "JavaScript", "JPEG"], "HTML"],
        ["A browser reads website files and displays them.", ["true", "false"], "true"],
      ],
    },
    {
      title: "Tools and Project Folders",
      notes:
        "A clean web project normally has an index.html file, a CSS file, a JavaScript file, and an assets folder for images. Good file names use lowercase letters and hyphens. This makes your work easier to publish later.",
      exampleHtml:
        "<section>\n  <h2>My Project Folder</h2>\n  <ul><li>index.html</li><li>style.css</li><li>script.js</li></ul>\n</section>",
      exampleCss:
        "section { border: 2px solid #2563eb; padding: 20px; border-radius: 8px; }\nli { margin: 6px 0; }",
      exampleJs: "document.body.dataset.project = 'ready';",
      taskPrompt:
        "Build a project checklist showing the files needed for a simple website.",
      requiredHtml: ["<section", "<ul", "<li"],
      requiredCss: ["border", "padding"],
      requiredJs: ["dataset"],
      quiz: [
        ["What is the common homepage file name?", ["index.html", "home.word", "photo.png", "folder.css"], "index.html"],
        ["Spaces and random symbols are best for file names.", ["true", "false"], "false"],
      ],
    },
  ],
  [
    {
      title: "HTML Page Structure",
      notes:
        "HTML uses elements such as headings, paragraphs, images, and links. A strong page has meaningful structure: header for the top area, main for the main content, section for grouped content, and footer for the bottom.",
      exampleHtml:
        "<header><h1>Junior Developer</h1></header>\n<main><section><h2>About Me</h2><p>I build websites.</p></section></main>\n<footer>Made by me</footer>",
      exampleCss:
        "header, footer { background: #2563eb; color: white; padding: 16px; }\nmain { padding: 20px; }",
      exampleJs: "",
      taskPrompt:
        "Create a personal profile page using header, main, section, h1, h2, paragraph, and footer.",
      requiredHtml: ["<header", "<main", "<section", "<footer"],
      requiredCss: ["background", "padding"],
      requiredJs: [],
      quiz: [
        ["Which tag is usually the biggest page heading?", ["h1", "p", "img", "a"], "h1"],
        ["The footer is normally used for bottom page information.", ["true", "false"], "true"],
      ],
    },
    {
      title: "Links and Images",
      notes:
        "Links use the anchor tag and href attribute. Images use the img tag with src and alt. Alt text helps accessibility and also explains the image if it fails to load.",
      exampleHtml:
        "<h1>My Learning Links</h1>\n<a href=\"https://scratch.mit.edu\">Open Scratch</a>\n<img src=\"https://placehold.co/300x160\" alt=\"Sample project preview\">",
      exampleCss:
        "img { max-width: 100%; border-radius: 8px; display: block; margin-top: 12px; }\na { color: #0f766e; font-weight: bold; }",
      exampleJs: "",
      taskPrompt:
        "Add a heading, a useful link, and an image with meaningful alt text.",
      requiredHtml: ["<a", "href=", "<img", "alt="],
      requiredCss: ["max-width", "border-radius"],
      requiredJs: [],
      quiz: [
        ["Which attribute stores a link destination?", ["href", "src", "alt", "class"], "href"],
        ["Images should have alt text.", ["true", "false"], "true"],
      ],
    },
  ],
  [
    {
      title: "Forms for User Input",
      notes:
        "Forms collect information from users. Labels describe inputs, inputs collect data, and buttons submit or trigger actions. Every important input should have a label so the form is easy to understand.",
      exampleHtml:
        "<form>\n  <label for=\"name\">Name</label>\n  <input id=\"name\" type=\"text\" placeholder=\"Enter name\">\n  <button type=\"submit\">Send</button>\n</form>",
      exampleCss:
        "form { display: grid; gap: 10px; max-width: 360px; }\ninput, button { padding: 10px; }",
      exampleJs: "",
      taskPrompt:
        "Build a contact form with labels, text input, email input, textarea, and submit button.",
      requiredHtml: ["<form", "<label", "<input", "<button"],
      requiredCss: ["gap", "padding"],
      requiredJs: [],
      quiz: [
        ["Which tag describes an input field?", ["label", "table", "footer", "style"], "label"],
        ["A form can contain buttons.", ["true", "false"], "true"],
      ],
    },
    {
      title: "Tables for Organized Data",
      notes:
        "Tables show information in rows and columns. Use table for the whole table, tr for each row, th for headings, and td for normal cells. Tables are good for timetables, marks, and simple lists.",
      exampleHtml:
        "<table>\n  <tr><th>Day</th><th>Topic</th></tr>\n  <tr><td>Monday</td><td>HTML</td></tr>\n</table>",
      exampleCss:
        "table { border-collapse: collapse; width: 100%; }\nth, td { border: 1px solid #94a3b8; padding: 10px; }",
      exampleJs: "",
      taskPrompt:
        "Create a weekly class timetable with at least two rows and two columns.",
      requiredHtml: ["<table", "<tr", "<th", "<td"],
      requiredCss: ["border-collapse", "border"],
      requiredJs: [],
      quiz: [
        ["Which tag creates a table row?", ["tr", "td", "th", "row"], "tr"],
        ["Tables are useful for structured row-and-column data.", ["true", "false"], "true"],
      ],
    },
  ],
  [
    {
      title: "Colors, Fonts, and Spacing",
      notes:
        "CSS controls how HTML looks. Color changes text, background changes the page or section background, font-family changes the typeface, and margin or padding creates breathing space.",
      exampleHtml:
        "<section class=\"hero\"><h1>My Styled Page</h1><p>CSS makes pages feel alive.</p></section>",
      exampleCss:
        ".hero { background: #dbeafe; color: #1e3a8a; padding: 32px; }\nh1 { font-family: Arial; }",
      exampleJs: "",
      taskPrompt:
        "Style a hero section using background color, text color, font family, and padding.",
      requiredHtml: ["class=", "<section", "<h1"],
      requiredCss: ["background", "color", "font-family", "padding"],
      requiredJs: [],
      quiz: [
        ["Which property changes inside spacing?", ["padding", "href", "src", "button"], "padding"],
        ["CSS can change fonts and colors.", ["true", "false"], "true"],
      ],
    },
    {
      title: "Borders and Cards",
      notes:
        "Cards are small content blocks used in many websites. A good card often has padding, border, border-radius, and a subtle shadow. Cards help users scan information quickly.",
      exampleHtml:
        "<article class=\"card\"><h2>Coding Club</h2><p>Build, test, improve.</p></article>",
      exampleCss:
        ".card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; box-shadow: 0 8px 20px #0001; }",
      exampleJs: "",
      taskPrompt:
        "Create three course cards with a title, short description, border, radius, and spacing.",
      requiredHtml: ["<article", "class=", "<h2"],
      requiredCss: ["border", "border-radius", "padding"],
      requiredJs: [],
      quiz: [
        ["Which property rounds corners?", ["border-radius", "font-size", "href", "alt"], "border-radius"],
        ["Cards can be used to group related content.", ["true", "false"], "true"],
      ],
    },
  ],
  [
    {
      title: "Flexbox Layout",
      notes:
        "Flexbox arranges items in a row or column. Use display: flex on the parent. Gap controls space between items. Justify-content and align-items help position content.",
      exampleHtml:
        "<div class=\"nav\"><a>Home</a><a>Programs</a><a>Contact</a></div>",
      exampleCss:
        ".nav { display: flex; gap: 16px; justify-content: center; padding: 14px; background: #0f172a; }\n.nav a { color: white; }",
      exampleJs: "",
      taskPrompt:
        "Build a navigation bar using flexbox with at least three links.",
      requiredHtml: ["<div", "<a"],
      requiredCss: ["display: flex", "gap", "justify-content"],
      requiredJs: [],
      quiz: [
        ["Which value turns a parent into a flex container?", ["display: flex", "font: flex", "href: flex", "img: flex"], "display: flex"],
        ["Gap adds space between flex items.", ["true", "false"], "true"],
      ],
    },
    {
      title: "Responsive Grids",
      notes:
        "CSS Grid is useful for cards and galleries. Responsive layouts adapt to different screen sizes. A common pattern is repeat(auto-fit, minmax(220px, 1fr)).",
      exampleHtml:
        "<div class=\"grid\"><article>HTML</article><article>CSS</article><article>JS</article></div>",
      exampleCss:
        ".grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; }\narticle { padding: 20px; background: #ecfeff; }",
      exampleJs: "",
      taskPrompt:
        "Create a responsive course grid with at least three cards.",
      requiredHtml: ["<article", "<div"],
      requiredCss: ["display: grid", "grid-template-columns", "gap"],
      requiredJs: [],
      quiz: [
        ["Which layout system is strong for rows and columns?", ["CSS Grid", "alt text", "table only", "console"], "CSS Grid"],
        ["Responsive design helps pages work on phones and laptops.", ["true", "false"], "true"],
      ],
    },
  ],
  [
    {
      title: "Variables and Buttons",
      notes:
        "JavaScript stores values in variables and responds to user actions. A button can run code when clicked. Use querySelector to find an element and addEventListener to listen for clicks.",
      exampleHtml:
        "<h1 id=\"message\">Hello</h1>\n<button id=\"changeBtn\">Change Message</button>",
      exampleCss:
        "button { padding: 10px 14px; background: #2563eb; color: white; border: 0; border-radius: 8px; }",
      exampleJs:
        "const button = document.querySelector('#changeBtn');\nbutton.addEventListener('click', function () {\n  document.querySelector('#message').textContent = 'JavaScript works!';\n});",
      taskPrompt:
        "Create a button that changes text on the page when clicked.",
      requiredHtml: ["id=", "<button"],
      requiredCss: ["button", "background"],
      requiredJs: ["querySelector", "addEventListener", "textContent"],
      quiz: [
        ["Which method listens for clicks?", ["addEventListener", "border-radius", "href", "src"], "addEventListener"],
        ["JavaScript can change page text after loading.", ["true", "false"], "true"],
      ],
    },
    {
      title: "Simple Logic",
      notes:
        "Logic helps a website make decisions. If statements check conditions. You can use them to show messages, validate forms, or control a small game.",
      exampleHtml:
        "<input id=\"age\" type=\"number\" placeholder=\"Age\">\n<button id=\"check\">Check</button>\n<p id=\"result\"></p>",
      exampleCss:
        "input, button { padding: 10px; margin: 5px; }\n#result { font-weight: bold; }",
      exampleJs:
        "document.querySelector('#check').addEventListener('click', function () {\n  const age = Number(document.querySelector('#age').value);\n  document.querySelector('#result').textContent = age >= 10 ? 'Ready for advanced projects' : 'Start with basics';\n});",
      taskPrompt:
        "Build a simple age checker or score checker using an input, button, and if-style logic.",
      requiredHtml: ["<input", "<button", "id="],
      requiredCss: ["padding"],
      requiredJs: ["Number", "textContent", "addEventListener"],
      quiz: [
        ["What does an if statement help with?", ["decisions", "images only", "borders only", "file names"], "decisions"],
        ["Inputs can give JavaScript values to work with.", ["true", "false"], "true"],
      ],
    },
  ],
  [
    {
      title: "DOM Selection and Updates",
      notes:
        "The DOM is the browser's live version of your HTML. JavaScript can select DOM elements, update text, add classes, and react to user input.",
      exampleHtml:
        "<h1 id=\"title\">DOM Practice</h1>\n<button id=\"paint\">Paint Title</button>",
      exampleCss:
        ".highlight { color: white; background: #16a34a; padding: 12px; }",
      exampleJs:
        "document.querySelector('#paint').addEventListener('click', function () {\n  document.querySelector('#title').classList.add('highlight');\n});",
      taskPrompt:
        "Make a button that adds a class to an element and changes its appearance.",
      requiredHtml: ["id=", "<button"],
      requiredCss: [".highlight", "background"],
      requiredJs: ["classList.add", "querySelector"],
      quiz: [
        ["What is the DOM?", ["The browser's live page structure", "A CSS color", "An image file", "A table row"], "The browser's live page structure"],
        ["classList.add can add a CSS class with JavaScript.", ["true", "false"], "true"],
      ],
    },
    {
      title: "Mini Calculator",
      notes:
        "Interactive websites often read values, calculate something, then show a result. Calculators are great practice because they combine HTML inputs, CSS layout, and JavaScript logic.",
      exampleHtml:
        "<input id=\"a\" type=\"number\"><input id=\"b\" type=\"number\"><button id=\"add\">Add</button><p id=\"answer\"></p>",
      exampleCss:
        "input { width: 80px; padding: 8px; }\nbutton { padding: 8px 12px; }",
      exampleJs:
        "document.querySelector('#add').addEventListener('click', function () {\n  const total = Number(a.value) + Number(b.value);\n  answer.textContent = total;\n});",
      taskPrompt:
        "Build a mini calculator that adds two numbers and displays the answer.",
      requiredHtml: ["type=\"number\"", "<button", "id="],
      requiredCss: ["padding"],
      requiredJs: ["Number", "textContent", "addEventListener"],
      quiz: [
        ["Why use Number()?", ["To convert input text into a number", "To make CSS blue", "To add an image", "To create a link"], "To convert input text into a number"],
        ["A calculator is an interactive mini app.", ["true", "false"], "true"],
      ],
    },
  ],
  [
    {
      title: "Landing Page Project",
      notes:
        "A landing page introduces an idea clearly. It usually has a hero section, short benefits, visual cards, and a call-to-action button. Good landing pages are easy to scan.",
      exampleHtml:
        "<section class=\"hero\"><h1>School Coding Club</h1><p>Learn by building.</p><button>Join</button></section>",
      exampleCss:
        ".hero { text-align: center; padding: 48px; background: #eef2ff; }\nbutton { background: #4f46e5; color: white; padding: 12px 18px; border: 0; }",
      exampleJs: "",
      taskPrompt:
        "Create a landing page for a school club with hero, benefits, and a button.",
      requiredHtml: ["class=\"hero\"", "<button", "<section"],
      requiredCss: ["text-align", "padding", "background"],
      requiredJs: [],
      quiz: [
        ["What is a call-to-action?", ["A clear next step button or link", "A broken image", "A CSS file", "A table cell"], "A clear next step button or link"],
        ["Landing pages should be easy to scan.", ["true", "false"], "true"],
      ],
    },
    {
      title: "Portfolio Page",
      notes:
        "A portfolio shows who you are and what you can build. It should include a short intro, skills, projects, and contact section. It is one of the best beginner web projects.",
      exampleHtml:
        "<main><h1>My Portfolio</h1><section><h2>Projects</h2><article>Calculator App</article></section></main>",
      exampleCss:
        "main { max-width: 900px; margin: auto; }\narticle { border: 1px solid #ddd; padding: 16px; }",
      exampleJs: "",
      taskPrompt:
        "Build a portfolio page with an intro, skills section, projects section, and contact section.",
      requiredHtml: ["<main", "<section", "<article", "<h2"],
      requiredCss: ["max-width", "border", "padding"],
      requiredJs: [],
      quiz: [
        ["What does a portfolio show?", ["Your projects and skills", "Only tables", "Only images", "Only passwords"], "Your projects and skills"],
        ["A project card can be inside a portfolio.", ["true", "false"], "true"],
      ],
    },
  ],
  [
    {
      title: "Preparing to Publish",
      notes:
        "Before publishing, check file names, links, images, spelling, mobile layout, and private information. Never publish passwords, private phone numbers, or secret keys inside website code.",
      exampleHtml:
        "<section><h1>Publish Checklist</h1><ul><li>Links work</li><li>Images load</li><li>No private data</li></ul></section>",
      exampleCss:
        "section { max-width: 700px; margin: 40px auto; }\nli { margin-bottom: 8px; }",
      exampleJs: "",
      taskPrompt:
        "Create a publish checklist page with at least five checks.",
      requiredHtml: ["<ul", "<li", "<section"],
      requiredCss: ["max-width", "margin"],
      requiredJs: [],
      quiz: [
        ["What should never be published in frontend code?", ["Passwords", "Headings", "Paragraphs", "Colors"], "Passwords"],
        ["You should test links before publishing.", ["true", "false"], "true"],
      ],
    },
    {
      title: "Hosting and Links",
      notes:
        "Hosting puts your website online. A published site has a URL that people can visit. Good developers test the URL, share it safely, and update their files when they improve the project.",
      exampleHtml:
        "<h1>My Published Website</h1><p>My site will have a public link when hosted.</p><a href=\"#\">Project link</a>",
      exampleCss:
        "a { color: #2563eb; font-weight: bold; }\nbody { line-height: 1.6; }",
      exampleJs: "",
      taskPrompt:
        "Build a page explaining where your project will be hosted and what users can do there.",
      requiredHtml: ["<a", "<p", "<h1"],
      requiredCss: ["color", "line-height"],
      requiredJs: [],
      quiz: [
        ["What does hosting do?", ["Makes a website available online", "Deletes HTML", "Changes a password", "Makes only images"], "Makes a website available online"],
        ["A URL is a web address.", ["true", "false"], "true"],
      ],
    },
  ],
  [
    {
      title: "Plan the Final Website",
      notes:
        "A final project starts with a plan. Decide the website purpose, audience, pages or sections, colors, content, and features. A simple plan prevents confusion while building.",
      exampleHtml:
        "<section><h1>Final Project Plan</h1><p>Purpose: Help students learn coding.</p><ul><li>Home</li><li>Projects</li><li>Contact</li></ul></section>",
      exampleCss:
        "section { padding: 24px; background: #f8fafc; border-left: 5px solid #2563eb; }",
      exampleJs: "",
      taskPrompt:
        "Create a final project plan page with purpose, audience, sections, and features.",
      requiredHtml: ["<section", "<ul", "<li"],
      requiredCss: ["padding", "background", "border"],
      requiredJs: [],
      quiz: [
        ["Why plan before building?", ["To organize purpose and features", "To avoid all HTML", "To remove CSS", "To hide the website"], "To organize purpose and features"],
        ["A final project should have a clear audience.", ["true", "false"], "true"],
      ],
    },
    {
      title: "Build the Final Website",
      notes:
        "Your final website should combine structure, design, and interaction. Use semantic HTML, responsive CSS, and at least one JavaScript interaction. Keep private information out of the page.",
      exampleHtml:
        "<main><section class=\"hero\"><h1>My Final Website</h1><button id=\"start\">Start</button></section><section><h2>Projects</h2></section></main>",
      exampleCss:
        ".hero { min-height: 240px; display: grid; place-items: center; background: #dbeafe; }\nmain { font-family: Arial; }",
      exampleJs:
        "document.querySelector('#start').addEventListener('click', function () {\n  alert('Welcome to my final project');\n});",
      taskPrompt:
        "Build a complete website with at least two sections, responsive styling, and one JavaScript interaction.",
      requiredHtml: ["<main", "<section", "<button"],
      requiredCss: ["display", "background", "font-family"],
      requiredJs: ["addEventListener", "alert"],
      quiz: [
        ["What should the final project combine?", ["HTML, CSS, and JavaScript", "Only passwords", "Only screenshots", "Only tables"], "HTML, CSS, and JavaScript"],
        ["Private information should be kept out of public websites.", ["true", "false"], "true"],
      ],
    },
  ],
];

export const seedWebDevelopmentCourse = async () => {
  const courseRows = await query(
    `
    INSERT INTO lms_courses (slug, title, description, is_public)
    VALUES ($1, $2, $3, true)
    ON CONFLICT (slug) DO UPDATE
      SET title = EXCLUDED.title,
          description = EXCLUDED.description
    RETURNING *
    `,
    [
      WEB_COURSE_SLUG,
      "Web Development",
      "A guided beginner course for learners to build websites with HTML, CSS, and JavaScript.",
    ],
  );

  const course = courseRows[0];

  for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex += 1) {
    const [title, summary] = modules[moduleIndex];
    const moduleRows = await query(
      `
      INSERT INTO lms_modules (course_id, title, summary, module_order, unlock_points)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (course_id, module_order) DO UPDATE
        SET title = EXCLUDED.title,
            summary = EXCLUDED.summary,
            unlock_points = EXCLUDED.unlock_points
      RETURNING *
      `,
      [course.id, title, summary, moduleIndex + 1, moduleIndex * 120],
    );

    const module = moduleRows[0];

    const lessonTemplates = moduleLessons[moduleIndex] || moduleLessons[0];

    for (let lessonIndex = 0; lessonIndex < lessonTemplates.length; lessonIndex += 1) {
      const lesson = lessonTemplates[lessonIndex];
      const lessonRows = await query(
        `
        INSERT INTO lms_lessons (
          module_id, title, notes, example_html, example_css, example_js,
          task_prompt, required_html, required_css, required_js, tasks,
          min_study_seconds, lesson_order
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        ON CONFLICT (module_id, lesson_order) DO UPDATE
          SET title = CASE WHEN lms_lessons.content_locked_by_admin THEN lms_lessons.title ELSE EXCLUDED.title END,
              notes = CASE WHEN lms_lessons.content_locked_by_admin THEN lms_lessons.notes ELSE EXCLUDED.notes END,
              example_html = CASE WHEN lms_lessons.content_locked_by_admin THEN lms_lessons.example_html ELSE EXCLUDED.example_html END,
              example_css = CASE WHEN lms_lessons.content_locked_by_admin THEN lms_lessons.example_css ELSE EXCLUDED.example_css END,
              example_js = CASE WHEN lms_lessons.content_locked_by_admin THEN lms_lessons.example_js ELSE EXCLUDED.example_js END,
              task_prompt = CASE WHEN lms_lessons.content_locked_by_admin THEN lms_lessons.task_prompt ELSE EXCLUDED.task_prompt END,
              required_html = CASE WHEN lms_lessons.content_locked_by_admin THEN lms_lessons.required_html ELSE EXCLUDED.required_html END,
              required_css = CASE WHEN lms_lessons.content_locked_by_admin THEN lms_lessons.required_css ELSE EXCLUDED.required_css END,
              required_js = CASE WHEN lms_lessons.content_locked_by_admin THEN lms_lessons.required_js ELSE EXCLUDED.required_js END,
              tasks = CASE WHEN lms_lessons.content_locked_by_admin THEN lms_lessons.tasks ELSE EXCLUDED.tasks END,
              min_study_seconds = CASE WHEN lms_lessons.content_locked_by_admin THEN lms_lessons.min_study_seconds ELSE EXCLUDED.min_study_seconds END
        RETURNING *
        `,
        [
          module.id,
          lesson.title,
          buildEnhancedNotes(lesson, title),
          lesson.exampleHtml,
          lesson.exampleCss,
          lesson.exampleJs,
          lesson.taskPrompt,
          lesson.requiredHtml,
          lesson.requiredCss,
          lesson.requiredJs,
          JSON.stringify(buildLessonTasks(lesson)),
          90,
          lessonIndex + 1,
        ],
      );

      const savedLesson = lessonRows[0];
      const quizSet = buildQuizSet(lesson);
      for (let quizIndex = 0; quizIndex < quizSet.length; quizIndex += 1) {
        const [question, options, answer] = quizSet[quizIndex];
        await query(
          `
          INSERT INTO lms_quiz_questions (
            lesson_id, question_text, question_type, options, correct_answer,
            explanation, question_order
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (lesson_id, question_order) DO UPDATE
            SET question_text = EXCLUDED.question_text,
                question_type = EXCLUDED.question_type,
                options = EXCLUDED.options,
                correct_answer = EXCLUDED.correct_answer,
                explanation = EXCLUDED.explanation
          `,
          [
            savedLesson.id,
            question,
            options.length ? "multiple_choice" : "fill_blank",
            JSON.stringify(options),
            answer,
            "Review the lesson notes and try the task again if this felt tricky.",
            quizIndex + 1,
          ],
        );
      }
    }
  }

  const publicCourses = await query(
    `SELECT title, description FROM courses WHERE is_public = true ORDER BY created_at ASC`,
  );
  for (const publicCourse of publicCourses) {
    const slug = slugifyCourse(publicCourse.title);
    if (!slug || slug === WEB_COURSE_SLUG) continue;
    const description =
      typeof publicCourse.description === "object"
        ? publicCourse.description?.intro || publicCourse.description?.summary || publicCourse.title
        : publicCourse.title;
    await query(
      `
      INSERT INTO lms_courses (slug, title, description, is_public)
      VALUES ($1, $2, $3, true)
      ON CONFLICT (slug) DO UPDATE
        SET title = EXCLUDED.title,
            description = EXCLUDED.description,
            is_public = true
      `,
      [slug, publicCourse.title, description],
    );
  }
};

export const isWebDevelopmentCourseName = (courseName = "") => {
  return /web\s*development|webdevelopment|website/i.test(courseName);
};

export const generateLearnerPassword = () => {
  return `BC-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
};

export const provisionLearnerForRegistration = async (registration, plainPassword) => {
  const courseRows = await query(
    `
    SELECT *
    FROM lms_courses
    WHERE LOWER(title) = LOWER($1)
       OR ($2 = true AND slug = $3)
    LIMIT 1
    `,
    [registration.course_name, isWebDevelopmentCourseName(registration.course_name), WEB_COURSE_SLUG],
  );
  const course = courseRows[0];
  if (!course) return null;

  const learnerEmail =
    registration.child_email || registration.parent_email;
  const passwordHash = await bcrypt.hash(plainPassword, 10);
  const displayName = registration.child_name.split(/\s+/)[0] || "Learner";

  const learnerRows = await query(
    `
    INSERT INTO learner_accounts (
      registration_id, parent_email, child_email, learner_email,
      password_hash, display_name, full_name
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    ON CONFLICT (learner_email) DO UPDATE
      SET registration_id = EXCLUDED.registration_id,
          parent_email = EXCLUDED.parent_email,
          child_email = EXCLUDED.child_email,
          password_hash = EXCLUDED.password_hash,
          display_name = EXCLUDED.display_name,
          full_name = EXCLUDED.full_name,
          is_active = true
    RETURNING *
    `,
    [
      registration.id,
      registration.parent_email,
      registration.child_email,
      learnerEmail,
      passwordHash,
      displayName,
      registration.child_name,
    ],
  );

  const learner = learnerRows[0];

  await query(
    `
    INSERT INTO learner_course_enrollments (learner_id, course_id, registration_id)
    VALUES ($1, $2, $3)
    ON CONFLICT (learner_id, course_id) DO UPDATE
      SET registration_id = EXCLUDED.registration_id,
          status = 'active'
    `,
    [learner.id, course.id, registration.id],
  );

  return { learner, course, plainPassword };
};

export const findLearnerByEmail = async (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const rows = await query(`SELECT * FROM learner_accounts WHERE LOWER(learner_email) = $1`, [
    normalizedEmail,
  ]);
  return rows[0] || null;
};

export const setLearnerResetToken = async (email, token, expires) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const tokenHash = hashResetToken(token);
  const rows = await query(
    `
    UPDATE learner_accounts
    SET reset_token = $1,
        reset_expires = $2
    WHERE LOWER(learner_email) = $3
    RETURNING id, display_name, learner_email, parent_email, child_email
    `,
    [tokenHash, expires, normalizedEmail],
  );
  return rows[0] || null;
};

export const resetLearnerPassword = async (token, password) => {
  const passwordHash = await bcrypt.hash(password, 10);
  const tokenHash = hashResetToken(token);
  const rows = await query(
    `
    UPDATE learner_accounts
    SET password_hash = $1,
        reset_token = NULL,
        reset_expires = NULL
    WHERE reset_token = $2
      AND reset_expires > CURRENT_TIMESTAMP
    RETURNING id, learner_email, display_name
    `,
    [passwordHash, tokenHash],
  );
  return rows[0] || null;
};

export const findLearnerById = async (id) => {
  const rows = await query(
    `
    SELECT id, registration_id, parent_email, child_email, learner_email,
           display_name, full_name, is_active, points, streak_count,
           last_activity_at, created_at
    FROM learner_accounts
    WHERE id = $1
    `,
    [id],
  );
  return rows[0] || null;
};

export const compareLearnerPassword = async (plain, hash) => {
  return bcrypt.compare(plain, hash);
};

export const getLearnerCourses = async (learnerId) => {
  return await query(
    `
    SELECT c.*, e.status AS enrollment_status
    FROM learner_course_enrollments e
    JOIN lms_courses c ON c.id = e.course_id
    WHERE e.learner_id = $1 AND e.status = 'active'
    ORDER BY c.created_at ASC
    `,
    [learnerId],
  );
};

export const getCourseTreeForLearner = async (learnerId, slug) => {
  const courseRows = await query(
    `
    SELECT c.*
    FROM lms_courses c
    JOIN learner_course_enrollments e ON e.course_id = c.id
    WHERE c.slug = $1 AND e.learner_id = $2 AND e.status = 'active'
    `,
    [slug, learnerId],
  );
  const course = courseRows[0];
  if (!course) return null;

  const modulesRows = await query(
    `
    SELECT * FROM lms_modules
    WHERE course_id = $1
    ORDER BY module_order ASC
    `,
    [course.id],
  );

  const lessonsRows = await query(
    `
    SELECT l.*, p.status, p.total_score, p.points_awarded, p.completed_at
    FROM lms_lessons l
    JOIN lms_modules m ON m.id = l.module_id
    LEFT JOIN learner_lesson_progress p
      ON p.lesson_id = l.id AND p.learner_id = $2
    WHERE m.course_id = $1
      AND l.is_published = true
      AND l.is_locked = false
      AND (l.unlock_at IS NULL OR l.unlock_at <= CURRENT_TIMESTAMP)
    ORDER BY m.module_order ASC, l.lesson_order ASC
    `,
    [course.id, learnerId],
  );

  return {
    ...course,
    modules: modulesRows.map((module) => ({
      ...module,
      lessons: lessonsRows.filter((lesson) => lesson.module_id === module.id),
    })),
  };
};

export const getLessonForLearner = async (learnerId, lessonId) => {
  const rows = await query(
    `
    SELECT l.*, m.title AS module_title, c.title AS course_title, c.slug AS course_slug,
           p.html_code, p.css_code, p.js_code, p.status, p.total_score,
           p.quiz_score, p.code_score, p.completion_score, p.teacher_comment
    FROM lms_lessons l
    JOIN lms_modules m ON m.id = l.module_id
    JOIN lms_courses c ON c.id = m.course_id
    JOIN learner_course_enrollments e ON e.course_id = c.id
    LEFT JOIN learner_lesson_progress p
      ON p.lesson_id = l.id AND p.learner_id = e.learner_id
    WHERE l.id = $1 AND e.learner_id = $2 AND e.status = 'active'
      AND l.is_published = true
      AND l.is_locked = false
      AND (l.unlock_at IS NULL OR l.unlock_at <= CURRENT_TIMESTAMP)
    `,
    [lessonId, learnerId],
  );
  const lesson = rows[0];
  if (!lesson) return null;

  const questions = await query(
    `
    SELECT id, question_text, question_type, options, question_order
    FROM lms_quiz_questions
    WHERE lesson_id = $1
    ORDER BY question_order ASC
    `,
    [lessonId],
  );

  const siblingRows = await query(
    `
    SELECT l.id
    FROM lms_lessons l
    JOIN lms_modules m ON m.id = l.module_id
    WHERE m.course_id = (
      SELECT m2.course_id
      FROM lms_lessons l2
      JOIN lms_modules m2 ON m2.id = l2.module_id
      WHERE l2.id = $1
    )
      AND l.is_published = true
      AND l.is_locked = false
      AND (l.unlock_at IS NULL OR l.unlock_at <= CURRENT_TIMESTAMP)
    ORDER BY m.module_order ASC, l.lesson_order ASC
    `,
    [lessonId],
  );
  const index = siblingRows.findIndex((row) => Number(row.id) === Number(lessonId));

  return {
    ...lesson,
    questions,
    previousLessonId: index > 0 ? siblingRows[index - 1].id : null,
    nextLessonId: index >= 0 && index < siblingRows.length - 1 ? siblingRows[index + 1].id : null,
  };
};

export const saveLearnerCode = async ({ learnerId, lessonId, html, css, js }) => {
  const rows = await query(
    `
    INSERT INTO learner_lesson_progress (learner_id, lesson_id, html_code, css_code, js_code)
    VALUES ($1,$2,$3,$4,$5)
    ON CONFLICT (learner_id, lesson_id) DO UPDATE
      SET html_code = EXCLUDED.html_code,
          css_code = EXCLUDED.css_code,
          js_code = EXCLUDED.js_code,
          updated_at = CURRENT_TIMESTAMP
    RETURNING *
    `,
    [learnerId, lessonId, html || "", css || "", js || ""],
  );
  return rows[0];
};

export const getQuizAnswers = async (lessonId) => {
  return await query(
    `
    SELECT id, correct_answer
    FROM lms_quiz_questions
    WHERE lesson_id = $1
    `,
    [lessonId],
  );
};

export const completeLesson = async ({
  learnerId,
  lessonId,
  html,
  css,
  js,
  quizScore,
  codeScore,
  completionScore,
  totalScore,
  pointsAwarded,
  strengths,
  improvements,
}) => {
  const rows = await query(
    `
    INSERT INTO learner_lesson_progress (
      learner_id, lesson_id, html_code, css_code, js_code, quiz_score,
      code_score, completion_score, total_score, points_awarded, attempts,
      status, strengths, improvements, completed_at, updated_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,1,'completed',$11,$12,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
    ON CONFLICT (learner_id, lesson_id) DO UPDATE
      SET html_code = EXCLUDED.html_code,
          css_code = EXCLUDED.css_code,
          js_code = EXCLUDED.js_code,
          quiz_score = EXCLUDED.quiz_score,
          code_score = EXCLUDED.code_score,
          completion_score = EXCLUDED.completion_score,
          total_score = EXCLUDED.total_score,
          points_awarded = GREATEST(learner_lesson_progress.points_awarded, EXCLUDED.points_awarded),
          attempts = learner_lesson_progress.attempts + 1,
          status = 'completed',
          strengths = EXCLUDED.strengths,
          improvements = EXCLUDED.improvements,
          completed_at = COALESCE(learner_lesson_progress.completed_at, CURRENT_TIMESTAMP),
          updated_at = CURRENT_TIMESTAMP
    RETURNING *
    `,
    [
      learnerId,
      lessonId,
      html || "",
      css || "",
      js || "",
      quizScore,
      codeScore,
      completionScore,
      totalScore,
      pointsAwarded,
      strengths,
      improvements,
    ],
  );

  await query(
    `
    UPDATE learner_accounts
    SET points = (
      SELECT COALESCE(SUM(points_awarded), 0)
      FROM learner_lesson_progress
      WHERE learner_id = $1
    ),
    streak_count = streak_count + 1,
    last_activity_at = CURRENT_TIMESTAMP
    WHERE id = $1
    `,
    [learnerId],
  );

  return rows[0];
};

export const getLearnerDashboard = async (learnerId) => {
  const courses = await getLearnerCourses(learnerId);
  const progress = await query(
    `
    SELECT p.*, l.title AS lesson_title, m.title AS module_title, c.title AS course_title
    FROM learner_lesson_progress p
    JOIN lms_lessons l ON l.id = p.lesson_id
    JOIN lms_modules m ON m.id = l.module_id
    JOIN lms_courses c ON c.id = m.course_id
    WHERE p.learner_id = $1
    ORDER BY p.updated_at DESC
    `,
    [learnerId],
  );
  return { courses, progress };
};

export const getModuleCompletionForLesson = async (learnerId, lessonId) => {
  const moduleRows = await query(
    `
    SELECT m.id AS module_id, m.title AS module_title, c.id AS course_id,
           c.title AS course_title, c.slug AS course_slug
    FROM lms_lessons l
    JOIN lms_modules m ON m.id = l.module_id
    JOIN lms_courses c ON c.id = m.course_id
    WHERE l.id = $1
    `,
    [lessonId],
  );
  const moduleInfo = moduleRows[0];
  if (!moduleInfo) return null;

  const lessons = await query(
    `
    SELECT l.id, l.title, l.lesson_order, p.total_score, p.quiz_score,
           p.code_score, p.status, p.strengths, p.improvements, p.completed_at
    FROM lms_lessons l
    LEFT JOIN learner_lesson_progress p
      ON p.lesson_id = l.id AND p.learner_id = $2
    WHERE l.module_id = $1 AND l.is_published = true
    ORDER BY l.lesson_order ASC
    `,
    [moduleInfo.module_id, learnerId],
  );

  return {
    ...moduleInfo,
    lessons,
    isComplete: lessons.length > 0 && lessons.every((lesson) => lesson.status === "completed"),
  };
};

export const getCourseReportForLesson = async (learnerId, lessonId) => {
  const courseRows = await query(
    `
    SELECT c.id AS course_id, c.title AS course_title, c.slug AS course_slug
    FROM lms_lessons l
    JOIN lms_modules m ON m.id = l.module_id
    JOIN lms_courses c ON c.id = m.course_id
    WHERE l.id = $1
    `,
    [lessonId],
  );
  const course = courseRows[0];
  if (!course) return null;

  const rows = await query(
    `
    SELECT m.id AS module_id, m.title AS module_title, m.module_order,
           l.id AS lesson_id, l.title AS lesson_title, l.lesson_order,
           p.total_score, p.quiz_score, p.code_score, p.status,
           p.strengths, p.improvements, p.completed_at
    FROM lms_modules m
    JOIN lms_lessons l ON l.module_id = m.id AND l.is_published = true
    LEFT JOIN learner_lesson_progress p
      ON p.lesson_id = l.id AND p.learner_id = $2
    WHERE m.course_id = $1
    ORDER BY m.module_order ASC, l.lesson_order ASC
    `,
    [course.course_id, learnerId],
  );

  const modulesMap = new Map();
  rows.forEach((row) => {
    if (!modulesMap.has(row.module_id)) {
      modulesMap.set(row.module_id, {
        id: row.module_id,
        title: row.module_title,
        moduleOrder: row.module_order,
        lessons: [],
      });
    }
    modulesMap.get(row.module_id).lessons.push(row);
  });

  return {
    ...course,
    modules: Array.from(modulesMap.values()),
    isComplete: rows.length > 0 && rows.every((row) => row.status === "completed"),
  };
};

export const getLeaderboard = async (courseSlug = WEB_COURSE_SLUG) => {
  return await query(
    `
    SELECT la.display_name,
           la.points AS total_points,
           COUNT(p.id)::int AS completed_lessons,
           COALESCE(ROUND(AVG(p.total_score)), 0)::int AS average_score
    FROM learner_accounts la
    JOIN learner_course_enrollments e ON e.learner_id = la.id
    JOIN lms_courses c ON c.id = e.course_id
    LEFT JOIN learner_lesson_progress p
      ON p.learner_id = la.id AND p.status = 'completed'
    WHERE c.slug = $1 AND la.is_active = true
    GROUP BY la.id
    ORDER BY la.points DESC, average_score DESC
    LIMIT 50
    `,
    [courseSlug],
  );
};

export const getAdminLmsOverview = async () => {
  const learners = await query(
    `
    SELECT la.id, la.display_name, la.full_name, la.parent_email,
           la.learner_email, la.points, la.streak_count, la.last_activity_at,
           COUNT(p.id)::int AS completed_lessons,
           COALESCE(ROUND(AVG(p.total_score)), 0)::int AS average_score
    FROM learner_accounts la
    LEFT JOIN learner_lesson_progress p
      ON p.learner_id = la.id AND p.status = 'completed'
    GROUP BY la.id
    ORDER BY la.created_at DESC
    `,
  );

  const lessons = await query(
    `
    SELECT l.id, l.title, m.title AS module_title,
           COUNT(p.id)::int AS attempts,
           COALESCE(ROUND(AVG(p.total_score)), 0)::int AS average_score
    FROM lms_lessons l
    JOIN lms_modules m ON m.id = l.module_id
    LEFT JOIN learner_lesson_progress p ON p.lesson_id = l.id
    GROUP BY l.id, m.title
    ORDER BY average_score ASC, attempts DESC
    `,
  );

  return { learners, lessons };
};

export const logParentEmail = async ({
  learnerId,
  lessonId,
  parentEmail,
  childEmail,
  subject,
  status,
  errorMessage,
}) => {
  await query(
    `
    INSERT INTO lms_parent_email_log (
      learner_id, lesson_id, parent_email, child_email, subject, status, error_message
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    `,
    [learnerId, lessonId, parentEmail, childEmail, subject, status, errorMessage],
  );
};

export const hasParentEmailSubject = async ({ learnerId, subject }) => {
  const rows = await query(
    `
    SELECT id
    FROM lms_parent_email_log
    WHERE learner_id = $1 AND subject = $2 AND status = 'sent'
    LIMIT 1
    `,
    [learnerId, subject],
  );
  return Boolean(rows[0]);
};

export const createTeacherAccount = async ({
  fullName,
  email,
  phone,
  plainPassword,
  verificationToken,
  verificationExpires,
}) => {
  const passwordHash = await bcrypt.hash(plainPassword, 10);
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const rows = await query(
    `
    INSERT INTO teacher_accounts (
      full_name, email, phone, password_hash, verification_token, verification_expires
    )
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING id, full_name, email, phone, is_active, email_verified, created_at
    `,
    [fullName, normalizedEmail, phone || null, passwordHash, verificationToken, verificationExpires],
  );
  return rows[0];
};

export const findTeacherByEmail = async (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const rows = await query(`SELECT * FROM teacher_accounts WHERE LOWER(email) = $1`, [
    normalizedEmail,
  ]);
  return rows[0] || null;
};

export const setTeacherResetToken = async (email, token, expires) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const tokenHash = hashResetToken(token);
  const rows = await query(
    `
    UPDATE teacher_accounts
    SET reset_token = $1,
        reset_expires = $2
    WHERE LOWER(email) = $3
    RETURNING id, full_name, email
    `,
    [tokenHash, expires, normalizedEmail],
  );
  return rows[0] || null;
};

export const resetTeacherPassword = async (token, password) => {
  const passwordHash = await bcrypt.hash(password, 10);
  const tokenHash = hashResetToken(token);
  const rows = await query(
    `
    UPDATE teacher_accounts
    SET password_hash = $1,
        reset_token = NULL,
        reset_expires = NULL,
        email_verified = true
    WHERE reset_token = $2
      AND reset_expires > CURRENT_TIMESTAMP
    RETURNING id, email, full_name
    `,
    [passwordHash, tokenHash],
  );
  return rows[0] || null;
};

export const verifyTeacherAccount = async (teacherId) => {
  const rows = await query(
    `
    UPDATE teacher_accounts
    SET email_verified = true,
        verification_token = NULL,
        verification_expires = NULL,
        is_active = true
    WHERE id = $1
    RETURNING id, full_name, email, is_active, email_verified
    `,
    [teacherId],
  );
  return rows[0] || null;
};

export const deleteTeacherAccount = async (teacherId) => {
  const rows = await query(
    `
    DELETE FROM teacher_accounts
    WHERE id = $1
    RETURNING id, full_name, email
    `,
    [teacherId],
  );
  return rows[0] || null;
};

export const findTeacherById = async (id) => {
  const rows = await query(
    `
    SELECT id, full_name, email, phone, is_active, email_verified,
           last_login, created_at
    FROM teacher_accounts
    WHERE id = $1
    `,
    [id],
  );
  return rows[0] || null;
};

export const verifyTeacherEmailToken = async (token) => {
  const rows = await query(
    `
    UPDATE teacher_accounts
    SET email_verified = true,
        verification_token = NULL,
        verification_expires = NULL
    WHERE verification_token = $1
      AND verification_expires > CURRENT_TIMESTAMP
    RETURNING id, full_name, email, email_verified
    `,
    [token],
  );
  return rows[0] || null;
};

export const compareTeacherPassword = async (plain, hash) => {
  return bcrypt.compare(plain, hash);
};

export const updateTeacherLastLogin = async (id) => {
  await query(`UPDATE teacher_accounts SET last_login = CURRENT_TIMESTAMP WHERE id = $1`, [
    id,
  ]);
};

export const getAllTeachers = async () => {
  return await query(
    `
    SELECT t.id, t.full_name, t.email, t.phone, t.is_active, t.email_verified,
           COUNT(DISTINCT c.id)::int AS classes_count,
           COUNT(cl.id)::int AS learners_count
    FROM teacher_accounts t
    LEFT JOIN lms_classes c ON c.teacher_id = t.id AND c.status = 'active'
    LEFT JOIN lms_class_learners cl ON cl.class_id = c.id
    GROUP BY t.id
    ORDER BY t.created_at DESC
    `,
  );
};

export const getCourseBySlug = async (slug = WEB_COURSE_SLUG) => {
  const rows = await query(`SELECT * FROM lms_courses WHERE slug = $1`, [slug]);
  return rows[0] || null;
};

export const createClassForTeacher = async ({ teacherId, courseId, name }) => {
  const rows = await query(
    `
    INSERT INTO lms_classes (teacher_id, course_id, name, capacity)
    VALUES ($1,$2,$3,15)
    RETURNING *
    `,
    [teacherId, courseId, name],
  );
  return rows[0];
};

export const getClasses = async () => {
  return await query(
    `
    SELECT c.*, co.title AS course_title, t.full_name AS teacher_name,
           COUNT(cl.id)::int AS learner_count
    FROM lms_classes c
    JOIN lms_courses co ON co.id = c.course_id
    LEFT JOIN teacher_accounts t ON t.id = c.teacher_id
    LEFT JOIN lms_class_learners cl ON cl.class_id = c.id
    GROUP BY c.id, co.title, t.full_name
    ORDER BY c.created_at DESC
    `,
  );
};

export const autoAllocateLearnersToTeachers = async (courseSlug = WEB_COURSE_SLUG) => {
  const course = await getCourseBySlug(courseSlug);
  if (!course) return { assigned: 0 };

  const teachers = await query(
    `
    SELECT id, full_name
    FROM teacher_accounts
    WHERE is_active = true AND email_verified = true
    ORDER BY created_at ASC
    `,
  );
  if (!teachers.length) return { assigned: 0, message: "No verified teachers." };

  const learners = await query(
    `
    SELECT la.id, la.display_name
    FROM learner_accounts la
    JOIN learner_course_enrollments e ON e.learner_id = la.id
    WHERE e.course_id = $1
      AND la.is_active = true
      AND NOT EXISTS (
        SELECT 1
        FROM lms_class_learners cl
        JOIN lms_classes c ON c.id = cl.class_id
        WHERE cl.learner_id = la.id AND c.course_id = $1 AND c.status = 'active'
      )
    ORDER BY la.created_at ASC
    `,
    [course.id],
  );

  let assigned = 0;
  let teacherIndex = 0;

  for (const learner of learners) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < teachers.length + 1) {
      const teacher = teachers[teacherIndex % teachers.length];
      teacherIndex += 1;
      attempts += 1;

      let classRows = await query(
        `
        SELECT c.*, COUNT(cl.id)::int AS learner_count
        FROM lms_classes c
        LEFT JOIN lms_class_learners cl ON cl.class_id = c.id
        WHERE c.teacher_id = $1 AND c.course_id = $2 AND c.status = 'active'
        GROUP BY c.id
        HAVING COUNT(cl.id) < c.capacity
        ORDER BY c.created_at ASC
        LIMIT 1
        `,
        [teacher.id, course.id],
      );

      if (!classRows.length) {
        const classNumberRows = await query(
          `SELECT COUNT(*)::int AS total FROM lms_classes WHERE teacher_id = $1 AND course_id = $2`,
          [teacher.id, course.id],
        );
        const classNumber = (classNumberRows[0]?.total || 0) + 1;
        const newClass = await createClassForTeacher({
          teacherId: teacher.id,
          courseId: course.id,
          name: `${course.title} - ${teacher.full_name} Class ${classNumber}`,
        });
        classRows = [{ ...newClass, learner_count: 0 }];
      }

      const targetClass = classRows[0];
      if (Number(targetClass.learner_count) < Number(targetClass.capacity)) {
        await query(
          `
          INSERT INTO lms_class_learners (class_id, learner_id)
          VALUES ($1,$2)
          ON CONFLICT DO NOTHING
          `,
          [targetClass.id, learner.id],
        );
        assigned += 1;
        placed = true;
      }
    }
  }

  return { assigned };
};

export const getTeacherDashboard = async (teacherId) => {
  const classes = await query(
    `
    SELECT c.*, co.title AS course_title, COUNT(cl.id)::int AS learner_count
    FROM lms_classes c
    JOIN lms_courses co ON co.id = c.course_id
    LEFT JOIN lms_class_learners cl ON cl.class_id = c.id
    WHERE c.teacher_id = $1 AND c.status = 'active'
    GROUP BY c.id, co.title
    ORDER BY c.created_at DESC
    `,
    [teacherId],
  );

  const learners = await query(
    `
    SELECT c.id AS class_id, c.name AS class_name, la.id AS learner_id,
           la.display_name, la.full_name, la.points,
           COUNT(p.id)::int AS completed_lessons,
           COALESCE(ROUND(AVG(p.total_score)), 0)::int AS average_score,
           MAX(p.updated_at) AS last_work_at
    FROM lms_classes c
    JOIN lms_class_learners cl ON cl.class_id = c.id
    JOIN learner_accounts la ON la.id = cl.learner_id
    LEFT JOIN learner_lesson_progress p ON p.learner_id = la.id AND p.status = 'completed'
    WHERE c.teacher_id = $1 AND c.status = 'active'
    GROUP BY c.id, la.id
    ORDER BY c.name ASC, la.display_name ASC
    `,
    [teacherId],
  );

  const work = await query(
    `
    SELECT p.*, la.display_name, la.full_name, l.title AS lesson_title,
           m.title AS module_title, c.name AS class_name
    FROM learner_lesson_progress p
    JOIN learner_accounts la ON la.id = p.learner_id
    JOIN lms_lessons l ON l.id = p.lesson_id
    JOIN lms_modules m ON m.id = l.module_id
    JOIN lms_class_learners cl ON cl.learner_id = la.id
    JOIN lms_classes c ON c.id = cl.class_id
    WHERE c.teacher_id = $1
    ORDER BY p.updated_at DESC
    LIMIT 100
    `,
    [teacherId],
  );

  return { classes, learners, work };
};

export const saveTeacherComment = async ({ teacherId, progressId, comment }) => {
  const rows = await query(
    `
    UPDATE learner_lesson_progress p
    SET teacher_comment = $1,
        updated_at = CURRENT_TIMESTAMP
    FROM lms_class_learners cl
    JOIN lms_classes c ON c.id = cl.class_id
    WHERE p.id = $2
      AND p.learner_id = cl.learner_id
      AND c.teacher_id = $3
    RETURNING p.*
    `,
    [comment, progressId, teacherId],
  );
  return rows[0] || null;
};
