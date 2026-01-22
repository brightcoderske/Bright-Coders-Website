import React, { useState } from "react";
import { FaPhoneVolume, FaDonate, FaUsers, FaBullhorn, FaPhoneAlt } from "react-icons/fa";
import { MdLocalPhone, MdMarkEmailUnread } from "react-icons/md";
import { Helmet } from "react-helmet-async";
import "../Css/Contact.css";

const Contact = () => {
  const [results, setResults] = useState("");
  const [popupText, setPopupText] = useState("");
  const [activeContact, setActiveContact] = useState("");

  const siteUrl = import.meta.env.VITE_SITE_URL; // Use env for canonical & og URLs

  // Function for Hovering (Visual Only)
  const handleMouseEnter = (type) => {
    if (type === "email") {
      setPopupText("developerisaac92@gmail.com");
      setActiveContact("email");
    } else {
      setPopupText("+254 740 073 575");
      setActiveContact("phone");
    }
  };

  // Function for Leaving (Clears the visual)
  const handleMouseLeave = () => {
    setActiveContact("");
    setPopupText("");
  };

  // Function for Clicking (Triggers Action)
  const handleEmailClick = () => {
    const recipient = "developerisaac92@gmail.com";
    const subject = encodeURIComponent("Inquiry for Bright Coders");
    const body = encodeURIComponent(
      "Hello,\n\nI'm interested in learning more about your programs.",
    );

    // This opens the user's email client (Gmail/Outlook)
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  };

  const handlePhoneClick = () => {
    window.location.href = "tel:+254740073575";
  };

  // Form submission
  const handleOnSubmit = async (event) => {
    event.preventDefault();
    setResults("Sending...");
    const formData = new FormData(event.target);
    formData.append("access_key", "d9cfaaad-1342-424f-8bdf-011516147439");
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setResults("Form Submitted Successfully");
        event.target.reset();
      } else {
        setResults(data.message || "Something Went Wrong!");
      }
    } catch (err) {
      console.error(err);
      setResults("Something Went Wrong!");
    }
    setTimeout(() => setResults(""), 3000);
  };

  return (
    <>
      {/* ================= SEO ================= */}
      <Helmet>
        <title>Contact Bright Coders | Kids Coding Academy in Kenya</title>
        <meta
          name="description"
          content="Get in touch with Bright Coders, Kenya’s leading kids coding academy. Ask questions, enroll in programs, or support our mission."
        />
        <meta
          name="keywords"
          content="Bright Coders contact, kids coding Kenya, coding academy, contact form, donate, volunteer"
        />
        <link rel="canonical" href={`${siteUrl}/contact`} />

        {/* Open Graph */}
        <meta property="og:title" content="Contact Bright Coders" />
        <meta
          property="og:description"
          content="Reach out to Bright Coders to learn more, enroll, or support our kids coding programs."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/contact`} />
        <meta property="og:image" content={`${siteUrl}/og-contact.jpg`} />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Bright Coders",
            url: siteUrl,
            email: "brightcoderske@gmail.com",
            contactPoint: [
              {
                "@type": "ContactPoint",
                telephone: "+254740073575",
                contactType: "customer service",
                areaServed: "KE",
              },
            ],
            sameAs: [
              "https://www.facebook.com/brightcoders",
              "https://www.instagram.com/brightcoders",
            ],
          })}
        </script>
      </Helmet>

      {/* ================= PAGE CONTENT ================= */}
      <div className="contact-section">
        {/* CONTACT BANNER */}
        <section className="contact-banner">
          <h1>
            Contact <span>Us</span>
          </h1>
          <p>Get in touch and let’s start your learning journey together.</p>
        </section>

        {/* CONTACT BODY */}
        <section className="contact-body">
          <div className="left-contact">
            <h2>Talk to us today</h2>
            <p className="left-contact-p1">
              Get in touch and let’s start your learning journey together.
            </p>
            <div className="contact-data">
              {/* EMAIL BOX */}
              <div
                className={`email ${activeContact === "email" ? "active" : ""}`}
                onMouseEnter={() => handleMouseEnter("email")}
                onMouseLeave={handleMouseLeave}
                onClick={handleEmailClick}
                style={{ cursor: "pointer" }} // Makes it look clickable
              >
                <MdMarkEmailUnread />
                <p>Email</p>
              </div>

              {/* PHONE BOX */}
              <div
                className={`phone ${activeContact === "phone" ? "active" : ""}`}
                onMouseEnter={() => handleMouseEnter("phone")}
                onMouseLeave={handleMouseLeave}
                onClick={handlePhoneClick}
                style={{ cursor: "pointer" }}
              >
                <MdLocalPhone />
                <p>Phone</p>
              </div>

              {/* SHARED DETAILS DISPLAY */}
              <div className="email-Phone-details">
                <span>{popupText}</span>
              </div>
            </div>
          </div>

          <div className="right-contact">
            <form onSubmit={handleOnSubmit}>
              <div className="first-name input-section">
                <p>First Name</p>
                <input
                  type="text"
                  placeholder="e.g Isaac"
                  name="Name"
                  required
                />
              </div>
              <div className="contact-email input-section">
                <p>Email</p>
                <input
                  type="email"
                  placeholder="e.g isaac@gmail.com"
                  name="Email"
                  required
                />
              </div>
              <div className="contact-address">
                <p>Message</p>
                <textarea
                  name="Message"
                  placeholder="Enter your message"
                  maxLength={240}
                  required
                ></textarea>
              </div>
              <div className="btn-div">
                <button type="submit">Send Message</button>
              </div>
            </form>

            <div className="toast-message">
              <span
                style={{
                  color: "#041E43",
                  fontWeight: "600",
                  fontSize: "17px",
                  fontStyle: "italic",
                  fontFamily: "system-ui",
                  textAlign: "center",
                }}
              >
                {results}
              </span>
            </div>
          </div>
        </section>

        {/* SUPPORT US SECTION */}
        <section className="support-us-section">
          <h2>Support Bright Coders</h2>
          <p>
            Your support helps us reach more young learners and improve our
            programs. Here’s how you can help:
          </p>
          <div className="support-options">
            <div className="support-card">
              <FaDonate className="support-icon" />
              <h3>Donate</h3>
              <p>
                Contribute to our mission and help provide resources for coding
                classes.
              </p>
              <button>Donate Now</button>
            </div>
            <div className="support-card">
              <FaUsers className="support-icon" />
              <h3>Volunteer</h3>
              <p>
                Share your skills and time to mentor kids in coding and
                technology.
              </p>
              <button>Join as Volunteer</button>
            </div>
            <div className="support-card">
              <FaBullhorn className="support-icon" />
              <h3>Spread the Word</h3>
              <p>
                Help us reach more learners by sharing our programs with your
                network.
              </p>
              <button>Share</button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Contact;
