import React, { useContext } from 'react'
import UserContext from "../Components/Context/UserContext.jsx"
const SideMenu = () => {
    const { user, clearUser } = useContext(UserContext);
  return (
     <div className="main-side-bar">
         <div className="profile-pic-menu">
        {user?.profile_image_url ? (
          <img
            src={user?.profile_image_url || ""}
            alt={user?.full_name || "Profile Image"}
            className="profile-img"
          />
        ) : (
          <></>
        )}
        {/* means “render the React component stored in item.icon” */}
        <h5 className="profile-pic-name">Hello {user?.full_name || "Guest"}</h5>
      </div>
     </div>
  )
}

export default SideMenu