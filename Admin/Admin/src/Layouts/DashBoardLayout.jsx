import React, { useContext, useState } from "react";
import NavBar from "./NavBar.jsx";
import UserContext from "../Components/Context/UserContext.jsx";
import SideMenu from "../Components/SideMenu.jsx";
import "../Css/DashboardLayout.css";
const DashBoardLayout = ({ children }) => {
  const { user } = useContext(UserContext);
  const [openSideMenu, setOpenSideMenu] = useState(false);
  return (
    <div className="dashboard">
      <NavBar
        // activeMenu={activeMenu}
        openSideMenu={openSideMenu}
        setOpenSideMenu={setOpenSideMenu}
      />

      {/* the main body of the dashboard  */}
      {user === undefined ? (
        <div>Loading...</div>
      ) : (
        /* Show the SideMenu outside the Navbar */
        <>
          {openSideMenu === true ? (
            <div className="side-menu-overlay">
              <SideMenu />
            </div>
          ) : null}
          <div
            className={`dashboard-right-section ${
              openSideMenu ? "with-sidebar" : "full-width"
            }`}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
};

export default DashBoardLayout;
