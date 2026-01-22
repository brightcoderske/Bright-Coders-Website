import React, { useState, useEffect } from "react";
import "../Css/FAQs.css";
import { FaChevronDown } from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import faqs from "../Utils/faqsData";

const FAQs = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [visibleFaqs, setVisibleFaqs] = useState([]);
  const [remainingFaqs, setRemainingFaqs] = useState([...faqs]);

  const siteUrl = import.meta.env.VITE_SITE_URL;

  // Load initial 5 FAQs on component mount
  useEffect(() => {
    const initialBatch = faqs.slice(0, 5);
    const initialRemaining = faqs.slice(5);
    setVisibleFaqs(initialBatch);
    setRemainingFaqs(initialRemaining);
  }, []);

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const loadMoreFaqs = () => {
    if (remainingFaqs.length === 0) return;

    const nextBatch = remainingFaqs.slice(0, 5);
    const newRemaining = remainingFaqs.slice(5);

    setVisibleFaqs((prev) => [...prev, ...nextBatch]);
    setRemainingFaqs(newRemaining);
  };

  // ================= Structured Data for SEO =================
  const generateJSONLD = () => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  });

  return (
    <>
      {/* ================= SEO ================= */}
      <Helmet>
        <title>FAQs | Bright Coders | Kids Coding School in Kenya</title>
        <meta
          name="description"
          content="Find answers to frequently asked questions about Bright Coders, Kenya’s coding academy for children aged 5–14."
        />
        <meta
          name="keywords"
          content="Bright Coders FAQ, kids coding questions, children coding school Kenya, programming for kids"
        />
        <link rel="canonical" href={`${siteUrl}/faqs`} />

        {/* Open Graph */}
        <meta property="og:title" content="FAQs | Bright Coders" />
        <meta
          property="og:description"
          content="Get answers to common questions about Bright Coders, the leading kids coding school in Kenya."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/faqs`} />
        <meta property="og:image" content={`${siteUrl}/og-faqs.jpg`} />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(generateJSONLD())}
        </script>
      </Helmet>

      {/* ================= PAGE CONTENT ================= */}
      <div className="faq-container">
        <div className="faq-header-section">
          <h1 className="faq-title">Frequently Asked Questions</h1>
          <p className="faq-subtitle">
            Everything you need to know before enrolling at Bright Coders.
          </p>
        </div>

        <div className="faq-list">
          {visibleFaqs.map((item, index) => (
            <div
              key={index}
              className={`faq-item ${activeIndex === index ? "active" : ""}`}
              onClick={() => toggleFaq(index)}
              role="button"
              tabIndex={0}
              aria-expanded={activeIndex === index}
            >
              <div className="faq-question">
                <span>{item.question}</span>
                <FaChevronDown className="faq-icon" aria-hidden="true" />
              </div>

              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            </div>
          ))}

          {/* LOAD MORE BUTTON SECTION */}
          <div className="faq-action-area">
            {remainingFaqs.length > 0 ? (
              <button
                className="load-more-btn"
                onClick={loadMoreFaqs}
                aria-label="Load more FAQ questions"
              >
                Load More Questions
              </button>
            ) : (
              visibleFaqs.length > 0 && (
                <p className="end-message">You’ve reached the end of the FAQs!</p>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQs;
