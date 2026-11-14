
import React from "react";
import { supabase } from "./supabase";

export default function Dashboard({ user, onClose }) {
  async function handleLogout() {
    await supabase.auth.signOut();
    onClose();
  }

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <button className="modal-close" onClick={onClose}>×</button>

        <h2>Candidate Dashboard</h2>
        <p>Welcome, {user.user_metadata?.full_name || user.email}</p>

        <div className="dashboard-menu">
          <button onClick={() => alert("My Profile — Coming soon")}>
            My Profile
          </button>

          <button onClick={() => alert("Resume Upload — Coming soon")}>
            Upload Resume
          </button>

          <button onClick={() => alert("My Applications — Coming soon")}>
            My Applications
          </button>

          <button onClick={() => alert("Saved Jobs — Coming soon")}>
            Saved Jobs
          </button>
        </div>

        <button className="post-job" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
