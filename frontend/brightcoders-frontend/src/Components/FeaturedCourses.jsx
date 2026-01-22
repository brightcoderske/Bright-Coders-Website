import React, { useEffect, useState } from "react";
import "../Css/FeaturedCourses.css";
import FeaturedCourseCard from "../Cards/FeaturedCourseCard";
import { MdReadMore } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import axios from "axios";

const FeaturedCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const SITE_URL = import.meta.env.VITE_SITE_URL;

  useEffect(() => {
    const fetchLiveCourses = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_BASE_URL;
        const response = await axios.get(`${API_URL}/courses/live`);
        const onlyFeatured = response.data.filter(
          (course) => course.is_featured === true,
        );
        setCourses(onlyFeatured);
      } catch (err) {
        console.error("Failed to fetch featured courses", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveCourses();
  }, []);

  const handleViewMoreBtn = (e) => {
    e.preventDefault();
    navigate("/programs");
  };

  // Generate JSON-LD structured data for Google
  const generateJSONLD = () => {
    if (!courses.length) return null;
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: courses.map((course, index) => ({
        "@type": "Course",
        position: index + 1,
        name: course.title,
        description: course.focus,
        provider: {
          "@type": "Organization",
          name: "Bright Coders",
          sameAs: SITE_URL,
        },
      })),
    };
  };

  return (
    <div className="featured">
   
      {/* Heading */}
      <h2 className="header">Featured Courses</h2>

      {/* Divider */}
      <div className="horizontal-line">
        <div className="actual-line"></div>
      </div>

      {/* Description */}
      <p className="header-paragraph">
        Explore our most popular programming courses this month — web
        development, mobile apps, and coding mentorship programs in Kenya.
      </p>

      {/* Courses */}
      {loading ? (
      <div className="loading-container" id="programs-grid">
              <div className="simple-spinner"></div>
              <p>Loading featured courses...</p>
            </div>
      ) : (
        <motion.div
          className="featured-cards-container"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {courses.map((course) => (
            <div className="features-card" key={course.id}>
              <FeaturedCourseCard
                image={course.image_url}
                level={course.level}
                title={course.title}
                focus={course.focus}
                duration={course.duration}
                fee={`Ksh. ${course.price}`}
                altText={`Bright Coders ${course.title} course - ${course.focus}`} // ✅ SEO alt
              />
            </div>
          ))}
        </motion.div>
      )}

      {/* CTA */}
      <button className="view-more-btn" onClick={handleViewMoreBtn}>
        View More Courses
        <MdReadMore className="arrow-right" />
      </button>
    </div>
  );
};

export default FeaturedCourses;
