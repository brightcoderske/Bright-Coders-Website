import React from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import "../Css/NavBar.css"
const NavBar = ({ openSideMenu, setOpenSideMenu }) => {
  return (
    <nav className="navbar">
      <div className="navBarMain">
        <button
          className="toggleSideMenu"
          onClick={() => {
            setOpenSideMenu(!openSideMenu);
          }}
        >
          {openSideMenu ? (
            <HiOutlineX className="nav-icons" size={25} color="#7d52f4d8" />
          ) : (
            <HiOutlineMenu className="nav-icons" size={25} color="#7C52F4" />
          )}
        </button>
        <h2 className="nav-title">Bright Coders' Admin DashBoard</h2>
      </div>
    </nav>
  );
};

export default NavBar;
