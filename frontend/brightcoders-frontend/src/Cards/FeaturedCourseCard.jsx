import React from "react";
import "../Css/FeaturedCourseCard.css";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const FeaturedCourseCard = ({
  title,
  focus,
  duration,
  fee,
  image,
  header,
  DurationIcon,
}) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    // Corrected preventDefault call
    if (e.preventDefault) e.preventDefault();
    navigate("/register");
    console.log("Navigating to register...");
  };

  // --- Helper to handle the focus data safely ---
  const renderFocusTags = () => {
    // 1. If focus is missing, return null
    if (!focus) return null;

    // 2. If focus is already an array, map it directly
    if (Array.isArray(focus)) {
      return focus.map((item, index) => (
        <span key={index} className="focus-tag">
          {item}
        </span>
      ));
    }

    // 3. If it's a string, split and map
    if (typeof focus === "string") {
      return focus.split(",").map((item, index) => (
        <span key={index} className="focus-tag">
          {item.trim()}
        </span>
      ));
    }

    return null;
  };

  return (
    <div className="featured-card" onClick={handleClick}>
      <div className="card-inner">
        <div className="image-section">
          <img src={image} alt={title} />
          <p className="time-box">
            {DurationIcon && <DurationIcon />}
            {duration}
          </p>
        </div>

        <h2>{title}</h2>

        <div className="card-data">
          <div className="focus-data">
            <p className="focus-title">
              <strong>Focus: </strong>
            </p>
            <div className="focus-tags-container">{renderFocusTags()}</div>
          </div>

          <div className="money-section">
            <p className="fee-p">
              <strong> {fee} </strong>
            </p>
            <h4 className="card-header">{header}</h4>
          </div>
        </div>
      </div>

      <div className="caption">
        <h1>
          Enroll Now <FaArrowRight className="arrow-icon" />
        </h1>
      </div>
    </div>
  );
};

export default FeaturedCourseCard;
