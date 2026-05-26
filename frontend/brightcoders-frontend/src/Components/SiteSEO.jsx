import { Helmet } from "react-helmet-async";
import {
  DEFAULT_IMAGE,
  SITE_URL,
  buildOrganizationSchema,
  buildWebsiteSchema,
  getPageSeo,
} from "../Utils/seoData";

const privatePathPrefixes = [
  "/learn/dashboard",
  "/learn/course",
  "/learn/lesson",
  "/learn/reset-password",
  "/teacher/dashboard",
  "/teacher/reset-password",
];

const SiteSEO = ({ pathname }) => {
  const page = getPageSeo(pathname);
  const canonicalPath = page.path === "/" ? "" : page.path;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const isPrivate = privatePathPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  const graph = [
    buildOrganizationSchema(),
    buildWebsiteSchema(),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        ...(page.path === "/"
          ? []
          : [
              {
                "@type": "ListItem",
                position: 2,
                name: page.title.split("|")[0].trim(),
                item: canonicalUrl,
              },
            ]),
      ],
    },
  ];

  return (
    <Helmet>
      <title>{page.title}</title>
      <meta name="description" content={page.description} />
      <meta name="keywords" content={page.keywords} />
      <meta name="robots" content={isPrivate ? "noindex, nofollow" : "index, follow"} />
      <meta name="author" content="Bright Coders" />
      <meta name="geo.region" content="KE" />
      <meta name="geo.placename" content="Nairobi, Kenya" />
      <meta name="language" content="English" />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:locale" content="en_KE" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Bright Coders" />
      <meta property="og:title" content={page.title} />
      <meta property="og:description" content={page.description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={DEFAULT_IMAGE} />
      <meta property="og:image:alt" content="Bright Coders kids coding academy in Kenya" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={page.title} />
      <meta name="twitter:description" content={page.description} />
      <meta name="twitter:image" content={DEFAULT_IMAGE} />

      <script type="application/ld+json">{JSON.stringify({ "@graph": graph })}</script>
    </Helmet>
  );
};

export default SiteSEO;
