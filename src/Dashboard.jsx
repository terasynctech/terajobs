
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
    <div style={styles.overlay}>
      <div style={styles.card}>
        <button style={styles.close} onClick={onClose}>
          ×
        </button>

        <h2 style={styles.heading}>Candidate Dashboard</h2>

        <p style={styles.welcome}>
          Welcome, {user.user_metadata?.full_name || user.email}
        </p>

        <div style={styles.menu}>
          <button style={styles.menuButton} onClick={() => alert("My Profile coming soon")}>
            My Profile
          </button>

          <button style={styles.menuButton} onClick={() => alert("Resume Upload coming soon")}>
            Upload Resume
          </button>

          <button style={styles.menuButton} onClick={() => alert("My Applications coming soon")}>
            My Applications
          </button>

          <button style={styles.menuButton} onClick={() => alert("Saved Jobs coming soon")}>
            Saved Jobs
          </button>
        </div>

        <button style={styles.logout} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 2000,
    background: "rgba(15, 23, 42, 0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16
  },
  card: {
    position: "relative",
    background: "#fff",
    width: "100%",
    maxWidth: 450,
    padding: 30,
    borderRadius: 16,
    boxShadow: "0 20px 70px rgba(0,0,0,.25)",
    fontFamily: "Arial, sans-serif",
    color: "#172033"
  },
  close: {
    position: "absolute",
    top: 10,
    right: 15,
    border: 0,
    background: "none",
    fontSize: 28,
    cursor: "pointer"
  },
  heading: {
    color: "#173f72",
    marginTop: 5
  },
  welcome: {
    color: "#64748b",
    marginBottom: 25
  },
  menu: {
    display: "grid",
    gap: 12
  },
  menuButton: {
    padding: 14,
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    textAlign: "left",
    fontSize: 15,
    cursor: "pointer"
  },
  logout: {
    width: "100%",
    marginTop: 22,
    padding: 14,
    background: "#173f72",
    color: "#fff",
    border: 0,
    borderRadius: 8,
    fontWeight: 700,
    cursor: "pointer"
  }
};
