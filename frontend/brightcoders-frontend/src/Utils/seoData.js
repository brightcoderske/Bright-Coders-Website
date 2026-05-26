export const SITE_URL =
  (import.meta.env.VITE_SITE_URL || "https://www.brightcoderske.co.ke").replace(
    /\/$/,
    "",
  );

export const BRAND_NAME = "Bright Coders";
export const DEFAULT_IMAGE = `${SITE_URL}/logo2.png`;
export const CONTACT_PHONE = "+254740073575";
export const CONTACT_EMAIL = "brightcoderske@gmail.com";

export const publicPages = [
  {
    path: "/",
    title: "Coding Classes for Kids & Teens in Kenya | Bright Coders",
    description:
      "Fun coding, robotics, Scratch, Python and web design classes for kids and teens in Kenya. Small groups, certificates and parent updates.",
    keywords:
      "coding classes for kids Kenya, coding for kids Nairobi, programming for kids Kenya, robotics classes for kids Kenya, Scratch coding Kenya, Python for kids Kenya",
    priority: "1.0",
  },
  {
    path: "/programs",
    title: "Kids Coding Programs in Kenya | Scratch, Python & Web Design",
    description:
      "Explore beginner-friendly coding programs for Grades 1-9: Scratch games, HTML, CSS, JavaScript, Python and machine learning for kids.",
    keywords:
      "kids coding programs Kenya, Scratch coding classes Nairobi, Python for kids Kenya, web design for kids, online coding classes Kenya",
    priority: "0.95",
  },
  {
    path: "/register",
    title: "Enroll in Kids Coding Classes in Kenya | Bright Coders",
    description:
      "Register your child for Bright Coders coding classes in Kenya. Choose Scratch, Python, web design, JavaScript and AI programs.",
    keywords:
      "enroll coding classes Kenya, register coding for kids Nairobi, kids programming course Kenya",
    priority: "0.9",
  },
  {
    path: "/about",
    title: "About Bright Coders | Kids Coding Academy in Kenya",
    description:
      "Bright Coders helps Kenyan kids and teens build confidence through practical coding, robotics, problem-solving and project-based learning.",
    keywords:
      "kids coding academy Kenya, coding school Nairobi, Bright Coders Kenya",
    priority: "0.8",
  },
  {
    path: "/contact",
    title: "Contact Bright Coders | Kids Coding Classes Kenya",
    description:
      "Talk to Bright Coders about coding classes, fees, schedules, online lessons and enrollment for children and teens in Kenya.",
    keywords:
      "Bright Coders contact, coding classes Kenya phone, kids coding Nairobi contact",
    priority: "0.85",
  },
  {
    path: "/student-work",
    title: "Student Coding Projects | Bright Coders Kenya",
    description:
      "See projects built by Bright Coders learners, including Scratch games, web pages, AI demos and creative digital work.",
    keywords:
      "student coding projects Kenya, kids coding portfolio, Scratch projects Kenya",
    priority: "0.75",
  },
  {
    path: "/blogs",
    title: "Kids Coding Blog Kenya | Bright Coders",
    description:
      "Parent guides on kids coding, STEM education, Scratch, Python, online classes and digital skills for Kenyan learners.",
    keywords:
      "kids coding blog Kenya, STEM education Kenya, coding for beginners Kenya",
    priority: "0.75",
  },
  {
    path: "/faqs",
    title: "Kids Coding Classes FAQs | Bright Coders Kenya",
    description:
      "Answers for parents about age groups, laptops, fees, online and physical coding classes, certificates and class sizes.",
    keywords:
      "kids coding classes FAQ Kenya, coding class fees Kenya, online coding classes for kids Kenya",
    priority: "0.7",
  },
  {
    path: "/testimonials",
    title: "Parent Reviews & Student Success | Bright Coders Kenya",
    description:
      "Read Bright Coders parent testimonials and learner success stories from our coding and technology programs in Kenya.",
    keywords:
      "Bright Coders reviews, kids coding testimonials Kenya, coding school reviews Nairobi",
    priority: "0.7",
  },
  {
    path: "/founder",
    title: "Founder of Bright Coders | Kids Tech Education Kenya",
    description:
      "Meet the founder behind Bright Coders and the mission to help children in Kenya learn coding, creativity and technology.",
    keywords:
      "Bright Coders founder, kids tech education Kenya, coding mentor Kenya",
    priority: "0.65",
  },
  {
    path: "/verify",
    title: "Verify Bright Coders Certificate | Kenya",
    description:
      "Verify the authenticity of a Bright Coders learner certificate using the official certificate verification page.",
    keywords: "Bright Coders certificate verification, coding certificate Kenya",
    priority: "0.5",
  },
];

export const getPageSeo = (pathname) => {
  const cleanPath = pathname === "" ? "/" : pathname.replace(/\/$/, "") || "/";

  if (cleanPath.startsWith("/blog/")) {
    return {
      path: cleanPath,
      title: "Kids Coding Article | Bright Coders Blog",
      description:
        "Read Bright Coders insights for parents on kids coding, STEM learning, digital skills and beginner programming in Kenya.",
      keywords:
        "kids coding Kenya, coding for beginners, STEM education Kenya, Bright Coders blog",
      priority: "0.6",
    };
  }

  return publicPages.find((page) => page.path === cleanPath) || publicPages[0];
};

export const buildOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": ["EducationalOrganization", "LocalBusiness"],
  name: BRAND_NAME,
  url: SITE_URL,
  logo: DEFAULT_IMAGE,
  image: DEFAULT_IMAGE,
  description:
    "Bright Coders provides coding, robotics, Scratch, Python, web design and digital skills classes for kids and teens in Kenya.",
  telephone: CONTACT_PHONE,
  email: CONTACT_EMAIL,
  priceRange: "KSh 4,000+",
  areaServed: [
    { "@type": "Country", name: "Kenya" },
    { "@type": "City", name: "Nairobi" },
    { "@type": "City", name: "Kahawa West" },
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kahawa West",
    addressCountry: "KE",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: CONTACT_PHONE,
    contactType: "admissions",
    areaServed: "KE",
    availableLanguage: ["English", "Swahili"],
  },
  knowsAbout: [
    "Coding for kids",
    "Scratch programming",
    "Python for kids",
    "Web development",
    "Robotics",
    "Machine learning for kids",
  ],
  sameAs: [
    "https://www.instagram.com/brightcoders",
    "https://www.facebook.com/brightcoders",
  ],
});

export const buildWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: BRAND_NAME,
  url: SITE_URL,
  inLanguage: "en-KE",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/blogs?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});
