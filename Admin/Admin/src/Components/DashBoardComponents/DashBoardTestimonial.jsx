import { CheckCircle, ExternalLink, Loader2 } from "lucide-react";

import { useNavigate } from "react-router-dom";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useState } from "react";

const DashBoardTestimonial = ({ testimonials, loading, refreshData }) => {
  const navigate = useNavigate();
  // const [testimonials, setTestimonials] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async (id) => {
    try {
      setIsProcessing(true);
      await axiosInstance.post(API_PATHS.TESTIMONIALS.APPROVE(id));
      await refreshData();
    } catch (err) {
      console.error("Approval failed!");
    } finally {
      setIsProcessing(false);
    }
  };
  if (loading) {
    return <p style={{ padding: "1rem" }}>Loading Testimonials...</p>;
  }

  const firstPending = testimonials.find((t) => !t.is_approved);
  return (
    <div className="testimonial-item">
      {firstPending ? (
        <>
          <p className="truncate-text">{firstPending.message}</p>
          <div className="testimonial-footer">
            <span>- {firstPending.user_name}</span>
            <button
              className="approve-btn"
              onClick={() => handleApprove(firstPending.id)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 size={14} className="spinner" />
              ) : (
                <>
                  <CheckCircle size={14} /> Approve
                </>
              )}
            </button>
          </div>

          <button
            className="btn-text"
            style={{ marginTop: "10px" }}
            onClick={() => navigate("/testimonials")} // Navigate to full manager
          >
            Read more <ExternalLink size={18} />
          </button>
        </>
      ) : (
        <p>No pending testimonials to review.</p>
      )}
    </div>
  );
};

export default DashBoardTestimonial;
