import React, { useState, useRef, useEffect, useMemo } from "react";
import { Bell, UserPlus, MessageSquare, Newspaper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./Notification.css";

const NotificationCenter = ({
  enrolments = [],

  testimonials = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. Convert your raw data into a "Notification" format
  const notifications = useMemo(() => {
    const list = [];
const fallbackDate = new Date();
    // Map recent enrolments
    enrolments.slice(0, 3).forEach((item) => {
      list.push({
        id: `enrol-${item.id}`,
        text: `New student: ${item.child_name || "Someone"} joined ${
          item.course_name || "a course"
        }`,
        time: "Recent",
        type: "enrolment",
      date: item.created_at ? new Date(item.created_at) : fallbackDate,
      });
    });

    // Map pending testimonials
    testimonials
      .filter((t) => !t.is_approved)
      .forEach((item) => {
        list.push({
          id: `test-${item.id}`,
          text: `New testimonial pending from ${item.user_name}`,
          time: "Pending",
          type: "testimonial",
          date: item.created_at ? new Date(item.created_at) : fallbackDate,
        });
      });

    // Sort by most recent first
    return list.sort((a, b) => b.date - a.date);
  }, [enrolments, testimonials]);

  return (
    <div className="notification-container" ref={dropdownRef}>
      <button className="action-icon-btn" onClick={() => setIsOpen(!isOpen)}>
        <Bell size={20} />
        {notifications.length > 0 && <span className="notification-dot"></span>}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div className="notifications-dropdown">
            <div className="dropdown-header">
              <h3>Recent Activity</h3>
            </div>
            <div className="notifications-list">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div key={n.id} className="notification-item">
                    <div className="notif-icon">
                      {n.type === "enrolment" ? (
                        <UserPlus size={14} />
                      ) : (
                        <MessageSquare size={14} />
                      )}
                    </div>
                    <div className="notif-details">
                      <p>
                        {n.type === "enrolment" && (
                          <strong>New Student: </strong>
                        )}
                        {n.type === "testimonial" && (
                          <strong>New Testimonial: </strong>
                        )}
                        {n.text
                          .replace("New student: ", "")
                          .replace("New testimonial pending from ", "")}
                      </p>
                      <span>{n.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">All caught up!</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
