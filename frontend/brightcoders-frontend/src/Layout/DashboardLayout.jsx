import { Helmet } from "react-helmet-async";
import Home from "../Components/Home";
import FeaturedCourses from "../Components/FeaturedCourses";
import WhyChoseUs from "../Components/WhyChoseUs";
import HowItWorks from "../Components/HowItWorks";
import AboutHomepage from "../Components/AboutHomepage";
import Testimonials from "../Components/Testimonials";
import { DEFAULT_IMAGE, SITE_URL } from "../Utils/seoData";

const DashboardLayout = () => {
  const baseUrl = SITE_URL;
  const fullImageUrl = DEFAULT_IMAGE;

  return (
    <>
      <Helmet>
        {/* Standard SEO */}
        <title>Coding Classes for Kids & Teens in Kenya | Bright Coders</title>
        <meta
          name="description"
          content="Fun coding, robotics, Scratch, Python and web design classes for kids and teens in Kenya. Small groups, certificates and parent updates."
        />
        <meta
          name="keywords"
          content="coding classes for kids Kenya, coding for kids Nairobi, programming for kids Kenya, robotics classes for kids Kenya, Scratch coding Kenya, Python for kids Kenya"
        />
        <link rel="canonical" href={baseUrl} />

        {/* Open Graph */}

        <meta property="og:type" content="website" />
        <meta property="og:url" content={baseUrl} />
        <meta
          property="og:title"
          content="Coding Classes for Kids & Teens in Kenya | Bright Coders"
        />
        <meta
          property="og:description"
          content="Small-group coding classes for Kenyan kids and teens: Scratch, Python, JavaScript, web design, robotics and AI basics."
        />
        <meta property="og:image" content={fullImageUrl} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Coding Classes for Kids & Teens in Kenya | Bright Coders"
        />
        <meta
          name="twitter:description"
          content="Fun project-based coding classes for kids and teens in Kenya."
        />
        <meta name="twitter:image" content={fullImageUrl} />

        {/* ✅ JSON-LD Structured Data */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "Bright Coders",
              "url": "${baseUrl}",
              "logo": "${fullImageUrl}",
              "description": "Fun, friendly coding classes for kids in Kenya.",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "KE"
              }
            }
          `}
        </script>
      </Helmet>

      <main>
        <Home />
        <FeaturedCourses />
        <WhyChoseUs />
        <HowItWorks />
        <AboutHomepage />
        <Testimonials />
      </main>
    </>
  );
};

export default DashboardLayout;
