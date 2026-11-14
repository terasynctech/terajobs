
import React from "react";
import { supabase } from "./supabase";

export default function Dashboard({ user, onClose }) {
  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    onClose();
  }

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
        >
          ×
        </button>

        <h2>Candidate Dashboard</h2>

        <p>
          Welcome, {user.user_metadata?.full_name || user.email}
        </p>

        <div className="dashboard-menu">
          <button type="button" onClick={() => alert("My Profile coming soon")}>
            My Profile
          </button>

          <button type="button" onClick={() => alert("Resume Upload coming soon")}>
            Upload Resume
          </button>

          <button type="button" onClick={() => alert("My Applications coming soon")}>
            My Applications
          </button>

          <button type="button" onClick={() => alert("Saved Jobs coming soon")}>
            Saved Jobs
          </button>
        </div>

        <button type="button" className="post-job" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
