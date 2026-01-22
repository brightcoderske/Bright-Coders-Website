import React from "react";
import "../Css/Founder.css";
import founderImg from "../assets/AirBrush_20250725153208.jpg"; // replace with your real image
import { Helmet } from "react-helmet-async";

const Founder = () => {
  const siteUrl = import.meta.env.VITE_SITE_URL;

  return (
    <>
      {/* ================= SEO ================= */}
      <Helmet>
        <title>Founder | Bright Coders – Inspiring Young Minds in Tech</title>
        <meta
          name="description"
          content="Meet Floyed Muchiri, founder of Bright Coders. Discover his passion for teaching coding, technology, and creativity to young learners in Kenya."
        />
        <meta
          name="keywords"
          content="Bright Coders founder, Floyed Muchiri, kids coding Kenya, coding for children, technology education"
        />
        <link rel="canonical" href={`${siteUrl}/founder`} />

        {/* Open Graph */}
        <meta property="og:title" content="Meet the Founder | Bright Coders" />
        <meta
          property="og:description"
          content="Floyed Muchiri inspires young learners through coding, technology, and creativity at Bright Coders."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/founder`} />
        <meta property="og:image" content={`${siteUrl}/og-founder.jpg`} />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: "Floyed Muchiri",
            jobTitle: "Founder & Lead Instructor",
            worksFor: {
              "@type": "Organization",
              name: "Bright Coders",
              url: siteUrl,
            },
            image: `${siteUrl}/images/founder.jpg`, // update if different
            url: `${siteUrl}/founder`,
            description:
              "Floyed Muchiri is the founder of Bright Coders, empowering children through coding, technology, and creativity.",
          })}
        </script>
      </Helmet>

      {/* ================= PAGE ================= */}
      <div className="founder-container">
        {/* Hero Section */}
        <div className="founder-hero">
          <h1>Meet the Founder</h1>
          <p>
            Inspiring young minds through creativity, technology, and
            innovation.
          </p>
        </div>

        {/* Founder Section */}
        <div className="founder-wrapper">
          <div className="founder-image">
            <img src={founderImg} alt="Floyed Muchiri, Founder of Bright Coders" />
          </div>

          <div className="founder-details">
            <h2>Floyed Muchiri</h2>
            <h4>Founder & Lead Instructor – Bright Coders</h4>

            <p className="bio-text">
              Floyed is a passionate educator and technology enthusiast
              dedicated to empowering the next generation through coding and
              digital creativity. With years of hands-on experience teaching
              young learners, he founded <strong>Bright Coders</strong> to give
              children the tools, mindset, and confidence they need to thrive
              in a fast-changing world.
            </p>

            <p className="bio-text">
              His teaching approach blends fun, creativity, and practical
              problem-solving—making coding accessible and exciting for kids of
              all learning levels.
            </p>

            <a href="/about" className="read-story-btn">
              Read Our Story
            </a>
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="founder-philosophy">
          <h2>My Teaching Philosophy</h2>

          <div className="philosophy-cards">
            <div className="philosophy-card">
              <h3>✨ Fun & Adventure</h3>
              <p>
                Kids learn best when the process is enjoyable. Every lesson blends
                creativity and exploration.
              </p>
            </div>

            <div className="philosophy-card">
              <h3>💡 Real Thinking</h3>
              <p>
                I encourage learners to think critically, experiment, and solve
                problems independently.
              </p>
            </div>

            <div className="philosophy-card">
              <h3>🚀 Confidence First</h3>
              <p>
                Students build confidence by creating projects they’re proud
                of—from games to websites.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Founder;
