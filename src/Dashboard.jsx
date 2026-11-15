
import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Dashboard({ user, onClose }) {
  const [activePage, setActivePage] = useState("menu");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
const [applications, setApplications] = useState([]);
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

async function uploadResume(event) {
  const file = event.target.files?.[0];

  if (!file) return;

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  if (!allowedTypes.includes(file.type)) {
    setMessage("Please upload only PDF, DOC or DOCX files.");
    event.target.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setMessage("File size must not exceed 5 MB.");
    event.target.value = "";
    return;
  }

  setLoading(true);
  setMessage("");

  const filePath = `${user.id}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("candidate-resumes")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false
    });

  if (uploadError) {
    setMessage("Upload failed: " + uploadError.message);
    setLoading(false);
    return;
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ resume_path: filePath })
    .eq("id", user.id);

  if (updateError) {
    setMessage("Resume uploaded, but profile update failed: " + updateError.message);
  } else {
    setMessage("Resume uploaded successfully!");
  }

  setLoading(false);
  event.target.value = "";
}

async function loadApplications() {
  setLoading(true);
  setMessage("");

  const { data, error } = await supabase
    .from("applications")
    .select(`
      id,
      status,
      applied_at,
      jobs (
        title,
        company_name,
        city,
        state
      )
    `)
    .eq("candidate_id", user.id)
    .order("applied_at", { ascending: false });

  if (error) {
    setMessage("Could not load applications: " + error.message);
    setApplications([]);
  } else {
    setApplications(data || []);
  }

  setLoading(false);
}

async function loadSavedJobs() {
  setLoading(true);
  setMessage("");

  const { data, error } = await supabase
    .from("saved_jobs")
    .select(`
      job_id,
      created_at,
      jobs (
        id,
        title,
        company_name,
        city,
        state
      )
    `)
    .eq("candidate_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    setMessage("Could not load saved jobs: " + error.message);
    setApplications([]);
  } else {
    setApplications(data || []);
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
  onClick={() => {
    setActivePage("applications");
    setMessage("");
    loadApplications();
  }}
>
  My Applications
</button>

            <button
  style={styles.menuButton}
  onClick={() => {
    setActivePage("saved");
    loadSavedJobs();
  }}
>
  Saved Jobs
</button>

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

           
{activePage === "profile" ? (
  <>
    <h2 style={styles.heading}>My Profile</h2>
    <p style={styles.welcome}>
      Update your personal and professional details.
    </p>

    {loading && <p>Loading...</p>}

    <form onSubmit={saveProfile}>
      <label style={labelStyle}>
        Full Name
        <input style={fieldStyle} name="full_name" value={profile.full_name} onChange={handleChange} required />
      </label>

      <label style={labelStyle}>
        Mobile Number
        <input style={fieldStyle} name="phone" value={profile.phone} onChange={handleChange} />
      </label>

      <label style={labelStyle}>
        City
        <input style={fieldStyle} name="city" value={profile.city} onChange={handleChange} />
      </label>

      <label style={labelStyle}>
        State
        <input style={fieldStyle} name="state" value={profile.state} onChange={handleChange} />
      </label>

      <label style={labelStyle}>
        Professional Headline
        <input style={fieldStyle} name="headline" placeholder="Example: Full Stack Developer" value={profile.headline} onChange={handleChange} />
      </label>

      <label style={labelStyle}>
        Education
        <input style={fieldStyle} name="education" placeholder="Your qualification" value={profile.education} onChange={handleChange} />
      </label>

      <label style={labelStyle}>
        Work Experience (Years)
        <input style={fieldStyle} type="number" min="0" step="0.5" name="experience_years" value={profile.experience_years} onChange={handleChange} />
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

      <button type="submit" style={styles.logout} disabled={loading}>
        {loading ? "Please wait..." : "Save Profile"}
      </button>
    </form>
  </>

) : activePage === "resume" ? (
  <>
    <h2 style={styles.heading}>Upload Your Resume</h2>

    <p style={styles.welcome}>
      Upload your latest resume to apply for jobs.
    </p>

    <div style={{ padding: 20, background: "#f1f5f9", borderRadius: 10 }}>
      <p><strong>Accepted formats:</strong> PDF, DOC, DOCX</p>
      <p><strong>Maximum file size:</strong> 5 MB</p>

      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={uploadResume}
        disabled={loading}
        style={{ width: "100%", marginTop: 15 }}
      />
    </div>

    {loading && <p>Uploading resume...</p>}

    {message && (
      <p style={{ color: message.includes("successfully") ? "green" : "red" }}>
        {message}
      </p>
    )}
  </>
) : (
  <>
    <h2 style={styles.heading}>My Applications</h2>

    <p style={styles.welcome}>
      Track the jobs you have applied for.
    </p>

    {loading && <p>Loading applications...</p>}

    {!loading && applications.length === 0 && (
      <p>You have not applied for any jobs yet.</p>
    )}

    {applications.map((application) => (
      <div
        key={application.id}
        style={{
          padding: 16,
          marginBottom: 14,
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          background: "#f8fafc"
        }}
      >
        <h3 style={{ color: "#173f72", margin: "0 0 8px" }}>
          {application.jobs?.title || "Job title unavailable"}
        </h3>

        <p>
          <strong>Company:</strong>{" "}
          {application.jobs?.company_name || "Not available"}
        </p>

        <p>
          <strong>Location:</strong>{" "}
          {[application.jobs?.city, application.jobs?.state]
            .filter(Boolean)
            .join(", ") || "Not available"}
        </p>

        <p>
          <strong>Applied:</strong>{" "}
          {application.applied_at
            ? new Date(application.applied_at).toLocaleDateString("en-IN")
            : "Not available"}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          {application.status || "Applied"}
        </p>
      </div>
    ))}
  </>
)}

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
