import React from "react";
import "../../Css/PopupScreen2.css";
import logo from "../../assets/logo2.png";
const PopupScreen2 = ({ onToggle }) => {
  return (
    <div className="popup-section">
      <div className="logo-section">
        <img src={logo} alt="" />
      </div>
      <h1 style={{color:"white"}}>Hello, Friend?</h1>
      <p style={{ color: "white" }}>
        Register with your personal details to use all site features
      </p>
      <button
        style={{ border: "1px solid white" }}
        onClick={() => {
          onToggle();
        }}
      >
        Log In
      </button>
    </div>
  );
};

export default PopupScreen2;
