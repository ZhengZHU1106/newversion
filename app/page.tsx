'use client';
import { useState } from "react";
import Login from "@/components/Login"; // Adjust the path if necessary
import Overlay from "@/components/Overlay"; // Adjust the path if necessary

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state

  const handleLogin = () => {
    setIsLoggedIn(true); // Switch to Overlay when login is clicked
  };

  return (
    <div>
      {isLoggedIn ? (
        <Overlay /> // Show the Overlay chatbox if logged in
      ) : (
        <Login onLogin={handleLogin} /> // Pass the handleLogin function as a prop
      )}
    </div>
  );
}
