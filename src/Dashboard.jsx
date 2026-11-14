
import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Dashboard({ user, onClose }) {
  const [activePage, setActivePage] = useState("menu");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    city: "",
    state: "",
    headline: "",
    education: "",
    experience_years: "",
    skills: ""
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      setMessage("Could not load profile: " + error.message);
    } else if (data) {
      setProfile({
        full_name: data.full_name || "",
        phone: data.phone || "",
        city: data.city || "",
        state: data.state || "",
        headline: data.headline || "",
        education: data.education || "",
        experience_years: data.experience_years ?? "",
        skills: data.skills || ""
      });
    }

    setLoading(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        city: profile.city,
        state: profile.state,
        headline: profile.headline,
        education: profile.education,
        experience_years:
          profile.experience_years === ""
            ? null
            : Number(profile.experience_years),
        skills: profile.skills
  .split(",")
  .map((skill) => skill.trim())
  .filter(Boolean)
      })
      .eq("id", user.id);

    if (error) {
      setMessage("Save failed: " + error.message);
    } else {
      setMessage("Profile saved successfully!");
    }

    setLoading(false);
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    onClose();
  }

  const fieldStyle = {
    width: "100%",
    padding: 12,
    border: "1px solid #dbe2ea",
    borderRadius: 7,
    fontSize: 14,
    boxSizing: "border-box",
    marginTop: 6
  };

  const labelStyle = {
    display: "block",
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 15,
    color: "#334155"
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <button style={styles.close} onClick={onClose}>×</button>

        {activePage === "menu" ? (
          <>
            <h2 style={styles.heading}>Candidate Dashboard</h2>

            <p style={styles.welcome}>
              Welcome, {user.user_metadata?.full_name || user.email}
            </p>

            <div style={styles.menu}>
              <button
                style={styles.menuButton}
                onClick={() => {
                  setActivePage("profile");
                  setMessage("");
                }}
              >
                My Profile
              </button>

             <button
  style={styles.menuButton}
  onClick={() => {
    setActivePage("resume");
    setMessage("");
  }}
>
  Upload Resume
</button>
              <button
                style={styles.menuButton}
                onClick={() => alert("My Applications coming soon")}
              >
                My Applications
              </button>

              <button
                style={styles.menuButton}
                onClick={() => alert("Saved Jobs coming soon")}
              >
                Saved Jobs
              </button>
            </div>

            <button style={styles.logout} onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              style={styles.back}
              onClick={() => {
                setActivePage("menu");
                setMessage("");
              }}
            >
              ← Back to Dashboard
            </button>

            <h2 style={styles.heading}>My Profile</h2>
            <p style={styles.welcome}>
              Update your personal and professional details.
            </p>

            {loading && <p>Loading...</p>}

            <form onSubmit={saveProfile}>
              <label style={labelStyle}>
                Full Name
                <input
                  style={fieldStyle}
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label style={labelStyle}>
                Mobile Number
                <input
                  style={fieldStyle}
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                />
              </label>

              <label style={labelStyle}>
                City
                <input
                  style={fieldStyle}
                  name="city"
                  value={profile.city}
                  onChange={handleChange}
                />
              </label>

              <label style={labelStyle}>
                State
                <input
                  style={fieldStyle}
                  name="state"
                  value={profile.state}
                  onChange={handleChange}
                />
              </label>

              <label style={labelStyle}>
                Professional Headline
                <input
                  style={fieldStyle}
                  name="headline"
                  placeholder="Example: Full Stack Developer"
                  value={profile.headline}
                  onChange={handleChange}
                />
              </label>

              <label style={labelStyle}>
                Education
                <input
                  style={fieldStyle}
                  name="education"
                  placeholder="Your qualification"
                  value={profile.education}
                  onChange={handleChange}
                />
              </label>

              <label style={labelStyle}>
                Work Experience (Years)
                <input
                  style={fieldStyle}
                  type="number"
                  min="0"
                  step="0.5"
                  name="experience_years"
                  value={profile.experience_years}
                  onChange={handleChange}
                />
              </label>

              <label style={labelStyle}>
                Skills
                <textarea
                  style={{ ...fieldStyle, minHeight: 85 }}
                  name="skills"
                  placeholder="Example: React, JavaScript, HTML, CSS"
                  value={profile.skills}
                  onChange={handleChange}
                />
              </label>

              {message && (
                <p style={{ color: message.includes("successfully") ? "green" : "red" }}>
                  {message}
                </p>
              )}

              <button
                type="submit"
                style={styles.logout}
                disabled={loading}
              >
                {loading ? "Please wait..." : "Save Profile"}
              </button>
            </form>
          </>
        )}
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
    maxWidth: 500,
    maxHeight: "90vh",
    overflowY: "auto",
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
    marginTop: 15,
    padding: 14,
    background: "#173f72",
    color: "#fff",
    border: 0,
    borderRadius: 8,
    fontWeight: 700,
    cursor: "pointer"
  },
  back: {
    border: 0,
    background: "none",
    color: "#173f72",
    cursor: "pointer",
    fontWeight: 600,
    marginBottom: 12
  }
};
