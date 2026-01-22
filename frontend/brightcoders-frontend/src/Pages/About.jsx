import React from "react";
import {
  FaBullseye,
  FaEye,
  FaSmile,
  FaLaptopCode,
  FaLightbulb,
  FaUserCheck,
} from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import "../Css/AboutUs.css";
import about_image_1 from "../assets/about-image-1.webp";
import founder from "../assets/AirBrush_20250725153208.jpg";

const AboutUs = () => {
  const navigate = useNavigate();

  const handleEnrollBtn = (e) => {
    e.preventDefault();
    navigate("/register");
  };

  const siteUrl = import.meta.env.VITE_SITE_URL;

  return (
    <>
      {/* ================= SEO META ================= */}
      <Helmet>
        <title>About Bright Coders | Kids Coding School in Kenya</title>

        <meta
          name="description"
          content="Bright Coders is a children’s coding academy empowering kids aged 5–14 with fun, beginner-friendly programming, creativity, and digital skills."
        />

        <meta
          name="keywords"
          content="kids coding school, coding for children, programming for kids, Bright Coders Kenya, coding academy"
        />

        <link rel="canonical" href={`${siteUrl}/about`} />

        {/* Open Graph */}
        <meta property="og:title" content="About Bright Coders" />
        <meta
          property="og:description"
          content="Empowering young minds through creative and fun coding education."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/about`} />
        <meta property="og:image" content={`${siteUrl}/og-about.jpg`} />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: "Bright Coders",
            url: siteUrl,
            description:
              "Children’s coding academy teaching kids digital skills through fun and interactive learning.",
            areaServed: "Kenya",
            audience: {
              "@type": "EducationalAudience",
              audienceType: "Children",
            },
          })}
        </script>
      </Helmet>

      {/* ================= PAGE CONTENT ================= */}
      <motion.div
        className="about-page"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.5 }}
      >
        {/* HERO */}
        <section className="about-hero" aria-labelledby="about-heading">
          <h1 id="about-heading">About Bright Coders</h1>
          <p>
            Empowering young minds through creative and fun coding education.
          </p>
        </section>

        {/* WHO WE ARE */}
        <section className="who-we-are" aria-labelledby="who-heading">
          <div className="who-text">
            <h2 id="who-heading">Who We Are</h2>
            <p>
              Bright Coders is a children’s coding academy dedicated to helping
              young learners explore creativity, problem-solving, and digital
              skills. We offer beginner-friendly programming classes for ages
              5–14, building confidence and curiosity through hands-on learning.
            </p>
          </div>

          <div className="who-image">
            <img
              src="https://imgs.search.brave.com/-fZjMdjN_37wyOq_NmjnkEHycP7FhjRWd9RJ7HWdBPk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvNjIz/MDY1MDUwL3Bob3Rv/L2tpZHMtY29kaW5n/LWluLXNjaG9vbC5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/bGN3b055WWVnV3VU/U1RPb083NFJjSklG/SldfWDdtYnpiY0Zn/cGdnemFRST0"
              alt="Children learning coding in a classroom environment"
            />
          </div>
        </section>

        {/* MISSION & VISION */}
        <section className="mv" aria-labelledby="mv-heading">
          <h2 id="mv-heading" className="sr-only">
            Mission and Vision
          </h2>

         <div className="mission-vision">
           <article className="mv-card">
            <FaBullseye className="mv-icon" aria-hidden="true" />
            <h3>Our Mission</h3>
            <p>
              To inspire confidence, creativity, and computational thinking in
              children through guided, hands-on coding experiences.
            </p>
          </article>

          <article className="mv-card">
            <FaEye className="mv-icon" aria-hidden="true" />
            <h3>Our Vision</h3>
            <p>
              To become Africa’s leading coding school for young learners —
              nurturing creators, thinkers, and digital innovators.
            </p>
          </article>
         </div>
        </section>

        {/* VALUES */}
        <section className="values-section" aria-labelledby="values-heading">
          <h2 id="values-heading">What We Offer</h2>

          <div className="values-grid">
            <article className="value-card">
              <FaSmile className="value-icon" aria-hidden="true" />
              <h4>Fun & Interactive</h4>
              <p>Learning through games and hands-on activities.</p>
            </article>

            <article className="value-card">
              <FaLaptopCode className="value-icon" aria-hidden="true" />
              <h4>Beginner-Friendly</h4>
              <p>
                No prior experience needed — we guide students step by step.
              </p>
            </article>

            <article className="value-card">
              <FaLightbulb className="value-icon" aria-hidden="true" />
              <h4>Project-Based</h4>
              <p>
                Students build real projects to strengthen creativity and
                problem-solving skills.
              </p>
            </article>

            <article className="value-card">
              <FaUserCheck className="value-icon" aria-hidden="true" />
              <h4>Personalized Attention</h4>
              <p>Small class sizes ensure every child gets support.</p>
            </article>
          </div>
        </section>

        {/* OUR STORY */}
        <section className="our-story" aria-labelledby="story-heading">
          <div className="story-text">
            <h2 id="story-heading">Our Story</h2>
            <p>
              Bright Coders began with a simple vision — to help kids learn
              technology in a fun and engaging way. Today, it’s a growing
              community of young innovators excited about coding and digital
              creation.
            </p>
          </div>

          <div className="story-image">
            <img
              src={about_image_1}
              alt="Bright Coders founder teaching children coding concepts"
              loading="lazy"
            />
          </div>
        </section>

        {/* FOUNDER */}
        <section className="founder-preview" aria-labelledby="founder-heading">
          <div className="founder-img-section">
            <img
              src={founder}
              alt="Founder of Bright Coders inspiring young learners"
              className="founder-img"
              loading="lazy"
            />
          </div>

          <div className="founder-info">
            <h2 id="founder-heading">Meet the Founder</h2>
            <p>
              Our founder is passionate about empowering young learners and
              unlocking creativity through technology.
            </p>

            <button
              className="btn-read-more"
              onClick={() => navigate("/founder")}
              aria-label="Read the full story of the Bright Coders founder"
            >
              Read Full Story
            </button>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section" aria-labelledby="cta-heading">
          <h2 id="cta-heading">Ready to Enroll?</h2>
          <p>Give your child the chance to build real-world digital skills.</p>

          <button
            className="cta-btn"
            onClick={handleEnrollBtn}
            aria-label="Enroll your child at Bright Coders"
          >
            Enroll Now
          </button>
        </section>
      </motion.div>
    </>
  );
};

export default AboutUs;
