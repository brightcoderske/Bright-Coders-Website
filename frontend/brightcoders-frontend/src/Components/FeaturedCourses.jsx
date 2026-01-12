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

  useEffect(() => {
    const fetchLiveCourses = async () => {
      try {
        setLoading(true);
        // This hits router.get("/live", handleGetLiveCourses)
        const response = await axios.get(
          "http://localhost:8000/api/courses/live"
        );
        const onlyFeatured = response.data.filter(
          (course) => course.is_featured === true
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

  return (
    <div className="featured">
      <h1 className="header">Featured Courses</h1>
      <div className="horizontal-line">
        <div className="actual-line"></div>
      </div>
      <p className="header-paragraph">
        Explore our most popular courses this month.
      </p>

      {loading ? (
        <div
          className="loading-container"
          style={{ display: "flex", justifyContent: "center", padding: "40px" }}
        >
          <Loader2 className="spinner" size={40} />
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
                image={course.image_url} // Matching your DB column
                level={course.level}
                title={course.title}
                focus={course.focus}
                duration={course.duration}
                fee={`Ksh. ${course.price}`}
                // Since icons aren't in DB, we use a default or keep logic for it
              />
            </div>
          ))}
        </motion.div>
      )}

      <button className="view-more-btn" onClick={handleViewMoreBtn}>
        View More Courses
        <MdReadMore className="arrow-right" />
      </button>
    </div>
  );
};

export default FeaturedCourses;
