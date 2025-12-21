import React from "react";
import SideMenu from "../Components/SideMenu";
import Layout from "../Components/Layout";
import DashBoardLayout from "../Layouts/DashBoardLayout.jsx";

const HomePage = () => {
  return (
    // <div style={{display:"flex", gap:"20px"}}>
    //   <SideMenu />
    //   <Layout />
    // </div>

    <DashBoardLayout>
      <div className="content">
        <h1>Welcome to the Dashboard</h1>
        <p>This is your main content area.</p>
      </div>
    </DashBoardLayout>
  );
};

export default HomePage;
