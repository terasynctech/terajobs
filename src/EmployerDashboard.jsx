
import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function EmployerDashboard({ user, onClose }) {
  const [activePage, setActivePage] = useState("menu");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [myJobs, setMyJobs] = useState([]);

  const [job, setJob] = useState({
    title: "",
    company_name: "",
    description: "",
    category: "",
    city: "",
    state: "",
    employment_type: "Full-time",
    salary_min: "",
    salary_max: "",
    experience_min: "",
    experience_max: "",
    vacancies: "1"
  });

  const [styles] = useState({
    primary: "#174B83",
    dark: "#102D52",
    blue: "#2563EB",
    light: "#F3F7FC",
    border: "#E2E8F0",
    muted: "#64748B",
    green: "#059669"
  });

  useEffect(() => {
    async function loadEmployer() {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (error) {
        setMessage("Could not load profile: " + error.message);
      }

      if (data) {
        setCompanyName(data.full_name || "");
        setJob((previous) => ({
          ...previous,
          company_name: data.full_name || ""
        }));
      }

      setLoading(false);
    }

    loadEmployer();
  }, [user]);

  async function loadMyJobs() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("employer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Could not load jobs: " + error.message);
    } else {
      setMyJobs(data || []);
    }

    setLoading(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setJob((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  async function postJob(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("jobs").insert({
      employer_id: user.id,
      company_name: job.company_name.trim(),
      title: job.title.trim(),
      description: job.description.trim(),
      category: job.category.trim(),
      city: job.city.trim(),
      state: job.state.trim(),
      employment_type: job.employment_type,
      salary_min: job.salary_min === "" ? null : Number(job.salary_min),
      salary_max: job.salary_max === "" ? null : Number(job.salary_max),
      experience_min: job.experience_min === "" ? null : Number(job.experience_min),
      experience_max: job.experience_max === "" ? null : Number(job.experience_max),
      vacancies: Number(job.vacancies),
      status: "published"
    });

    if (error) {
      setMessage("Could not post job: " + error.message);
    } else {
      setMessage("Job posted successfully!");
      setJob({
        title: "",
        company_name: companyName,
        description: "",
        category: "",
        city: "",
        state: "",
        employment_type: "Full-time",
        salary_min: "",
        salary_max: "",
        experience_min: "",
        experience_max: "",
        vacancies: "1"
      });
    }

    setSaving(false);
  }

  async function deleteJob(jobId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job permanently?"
    );

    if (!confirmed) return;

    setMessage("");

    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", jobId)
      .eq("employer_id", user.id);

    if (error) {
      setMessage("Could not delete job: " + error.message);
    } else {
      setMyJobs((previous) =>
        previous.filter((item) => item.id !== jobId)
      );
      setMessage("Job deleted successfully!");
    }
  }

  const fieldStyle = {
    width: "100%",
    padding: "12px",
    marginTop: "7px",
    marginBottom: "17px",
    border: "1px solid #CBD5E1",
    borderRadius: "8px",
    boxSizing: "border-box",
    fontSize: "14px",
    background: "#FFFFFF"
  };

  const labelStyle = {
    display: "block",
    fontWeight: "600",
    color: "#334155",
    fontSize: "14px"
  };

  const buttonStyle = {
    padding: "12px 18px",
    background: styles.primary,
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600"
  };

  const cardStyle = {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "13px",
    padding: "22px",
    boxShadow: "0 3px 12px rgba(15, 40, 75, 0.05)"
  };

  const publishedCount = myJobs.filter(
    (item) => item.status === "published"
  ).length;

  const closedCount = myJobs.filter(
    (item) => item.status === "closed"
  ).length;

  return (
    <div style={{
      background: styles.light,
      minHeight: "100vh",
      fontFamily: "Arial, sans-serif",
      color: "#1E293B"
    }}>
      <header style={{
        background: styles.dark,
        color: "#FFFFFF",
        padding: "22px 5%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "15px"
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "27px" }}>TeraJobs</h1>
          <p style={{
            margin: "5px 0 0",
            color: "#BBD0E8",
            fontSize: "12px",
            letterSpacing: "1px"
          }}>
            EMPLOYER WORKSPACE
          </p>
        </div>

        <div style={{
          background: "#21466E",
          padding: "10px 16px",
          borderRadius: "25px",
          fontSize: "13px"
        }}>
          Employer Account
        </div>
      </header>

      <main style={{
        maxWidth: "1150px",
        margin: "auto",
        padding: "30px 20px"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          marginBottom: "25px"
        }}>
          <div>
            <h2 style={{
              margin: 0,
              color: styles.dark,
              fontSize: "26px"
            }}>
              {activePage === "menu"
                ? "Employer Dashboard"
                : activePage === "manage"
                ? "Manage Jobs"
                : "Post a New Job"}
            </h2>
            <p style={{ color: styles.muted, marginBottom: 0 }}>
              Welcome, {companyName || user.email}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              ...buttonStyle,
              background: "#FFFFFF",
              color: styles.primary,
              border: "1px solid #CBD5E1"
            }}
          >
            Close Dashboard
          </button>
        </div>

        {activePage === "menu" ? (
          <>
            <div style={{
              background: "linear-gradient(120deg, #174B83, #2877B8)",
              color: "#FFFFFF",
              borderRadius: "15px",
              padding: "28px",
              marginBottom: "25px"
            }}>
              <h2 style={{ marginTop: 0 }}>
                Welcome to your recruitment workspace
              </h2>
              <p style={{ color: "#E1EEFA", marginBottom: 0 }}>
                Post vacancies, manage your jobs and grow your team with TeraJobs.
              </p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "18px",
              marginBottom: "28px"
            }}>
              {[
                {
                  label: "Total Jobs",
                  value: myJobs.length,
                  color: "#2563EB",
                  icon: "💼"
                },
                {
                  label: "Published Jobs",
                  value: publishedCount,
                  color: "#059669",
                  icon: "✓"
                },
                {
                  label: "Closed Jobs",
                  value: closedCount,
                  color: "#D97706",
                  icon: "●"
                }
              ].map((item) => (
                <div key={item.label} style={cardStyle}>
                  <div style={{
                    color: item.color,
                    fontSize: "25px"
                  }}>
                    {item.icon}
                  </div>
                  <h2 style={{
                    fontSize: "30px",
                    color: styles.dark,
                    margin: "10px 0 5px"
                  }}>
                    {item.value}
                  </h2>
                  <p style={{ color: styles.muted, margin: 0 }}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "18px"
            }}>
              <div style={cardStyle}>
                <h3 style={{ color: styles.dark }}>Post a Job</h3>
                <p style={{ color: styles.muted, lineHeight: 1.6 }}>
                  Create and publish a new vacancy to attract candidates.
                </p>
                <button
                  type="button"
                  style={buttonStyle}
                  onClick={() => {
                    setActivePage("post");
                    setMessage("");
                  }}
                >
                  + Post New Job
                </button>
              </div>

              <div style={cardStyle}>
                <h3 style={{ color: styles.dark }}>Manage Jobs</h3>
                <p style={{ color: styles.muted, lineHeight: 1.6 }}>
                  View your vacancies, check their status and manage listings.
                </p>
                <button
                  type="button"
                  style={{
                    ...buttonStyle,
                    background: styles.green
                  }}
                  onClick={() => {
                    setActivePage("manage");
                    loadMyJobs();
                  }}
                >
                  Manage My Jobs
                </button>
              </div>

              <div style={cardStyle}>
                <h3 style={{ color: styles.dark }}>View Applicants</h3>
                <p style={{ color: styles.muted, lineHeight: 1.6 }}>
                  Review applications received for your vacancies.
                </p>
                <button
                  type="button"
                  disabled
                  style={{
                    ...buttonStyle,
                    background: "#94A3B8",
                    cursor: "not-allowed"
                  }}
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </>
        ) : activePage === "manage" ? (
          <>
            <button
              type="button"
              style={{
                ...buttonStyle,
                background: "#E2EAF4",
                color: styles.dark,
                marginBottom: "20px"
              }}
              onClick={() => {
                setActivePage("menu");
                setMessage("");
              }}
            >
              ← Back to Dashboard
            </button>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "15px",
              marginBottom: "22px"
            }}>
              <div>
                <h3 style={{ color: styles.dark, marginBottom: "5px" }}>
                  Your Job Listings
                </h3>
                <p style={{ color: styles.muted, margin: 0 }}>
                  View and manage vacancies posted by your company.
                </p>
              </div>

              <button
                type="button"
                style={buttonStyle}
                onClick={() => {
                  setActivePage("post");
                  setMessage("");
                }}
              >
                + Add New Job
              </button>
            </div>

            {message && (
              <p style={{
                color: message.includes("successfully") ? styles.green : "#DC2626",
                background: "#FFFFFF",
                padding: "12px",
                borderRadius: "8px"
              }}>
                {message}
              </p>
            )}

            {loading ? (
              <div style={cardStyle}>Loading your jobs...</div>
            ) : myJobs.length === 0 ? (
              <div style={{
                ...cardStyle,
                textAlign: "center",
                padding: "45px 20px"
              }}>
                <h3>No jobs posted yet</h3>
                <p style={{ color: styles.muted }}>
                  Create your first vacancy to start recruiting.
                </p>
                <button
                  type="button"
                  style={buttonStyle}
                  onClick={() => setActivePage("post")}
                >
                  Post Your First Job
                </button>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "18px"
              }}>
                {myJobs.map((item) => (
                  <div key={item.id} style={cardStyle}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "10px",
                      alignItems: "flex-start"
                    }}>
                      <h3 style={{
                        color: styles.dark,
                        marginTop: 0,
                        marginBottom: "8px"
                      }}>
                        {item.title}
                      </h3>

                      <span style={{
                        background: item.status === "published"
                          ? "#DCFCE7"
                          : item.status === "closed"
                          ? "#FEE2E2"
                          : "#FEF3C7",
                        color: item.status === "published"
                          ? "#166534"
                          : item.status === "closed"
                          ? "#991B1B"
                          : "#92400E",
                        padding: "5px 9px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        whiteSpace: "nowrap"
                      }}>
                        {item.status || "Unknown"}
                      </span>
                    </div>

                    <p style={{
                      color: styles.muted,
                      marginTop: 0
                    }}>
                      {item.company_name}
                    </p>

                    <p>📍 {item.city}, {item.state}</p>
                    <p>💼 {item.employment_type}</p>

                    <div style={{
                      background: "#EFF6FF",
                      borderRadius: "8px",
                      padding: "12px",
                      margin: "15px 0"
                    }}>
                      <p style={{
                        color: styles.primary,
                        fontWeight: "bold",
                        fontSize: "18px",
                        margin: 0
                      }}>
                        {item.salary_min || item.salary_max
                          ? `₹${item.salary_min || 0} - ₹${item.salary_max || 0}`
                          : "Salary not specified"}
                      </p>
                      <small style={{ color: styles.muted }}>
                        Salary details
                      </small>
                    </div>

                    <p style={{
                      color: styles.muted,
                      fontSize: "13px"
                    }}>
                      Vacancies: {item.vacancies || 1}
                    </p>

                    <button
                      type="button"
                      onClick={() => deleteJob(item.id)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #FECACA",
                        color: "#B91C1C",
                        background: "#FEF2F2",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600"
                      }}
                    >
                      Delete Job
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <button
              type="button"
              style={{
                ...buttonStyle,
                background: "#E2EAF4",
                color: styles.dark,
                marginBottom: "20px"
              }}
              onClick={() => {
                setActivePage("menu");
                setMessage("");
              }}
            >
              ← Back to Dashboard
            </button>

            <div style={{
              ...cardStyle,
              maxWidth: "750px",
              margin: "auto"
            }}>
              <h3 style={{ color: styles.dark }}>Enter Vacancy Details</h3>
              <p style={{ color: styles.muted }}>
                Complete the details below to publish your job.
              </p>

              {loading ? (
                <p>Loading employer profile...</p>
              ) : (
                <form onSubmit={postJob}>
                  <label style={labelStyle}>
                    Job Title *
                    <input
                      style={fieldStyle}
                      name="title"
                      value={job.title}
                      onChange={handleChange}
                      placeholder="Example: Sales Executive"
                      required
                    />
                  </label>

                  <label style={labelStyle}>
                    Company Name *
                    <input
                      style={fieldStyle}
                      name="company_name"
                      value={job.company_name}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label style={labelStyle}>
                    Job Description *
                    <textarea
                      style={{ ...fieldStyle, minHeight: "120px" }}
                      name="description"
                      value={job.description}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label style={labelStyle}>
                    Job Category *
                    <input
                      style={fieldStyle}
                      name="category"
                      value={job.category}
                      onChange={handleChange}
                      placeholder="Sales, IT, Marketing"
                      required
                    />
                  </label>

                  <label style={labelStyle}>
                    City *
                    <input
                      style={fieldStyle}
                      name="city"
                      value={job.city}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label style={labelStyle}>
                    State *
                    <input
                      style={fieldStyle}
                      name="state"
                      value={job.state}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label style={labelStyle}>
                    Employment Type *
                    <select
                      style={fieldStyle}
                      name="employment_type"
                      value={job.employment_type}
                      onChange={handleChange}
                      required
                    >
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Internship</option>
                      <option>Temporary</option>
                    </select>
                  </label>

                  <label style={labelStyle}>
                    Minimum Salary
                    <input
                      style={fieldStyle}
                      type="number"
                      min="0"
                      name="salary_min"
                      value={job.salary_min}
                      onChange={handleChange}
                    />
                  </label>

                  <label style={labelStyle}>
                    Maximum Salary
                    <input
                      style={fieldStyle}
                      type="number"
                      min="0"
                      name="salary_max"
                      value={job.salary_max}
                      onChange={handleChange}
                    />
                  </label>

                  <label style={labelStyle}>
                    Minimum Experience (Years)
                    <input
                      style={fieldStyle}
                      type="number"
                      min="0"
                      name="experience_min"
                      value={job.experience_min}
                      onChange={handleChange}
                    />
                  </label>

                  <label style={labelStyle}>
                    Maximum Experience (Years)
                    <input
                      style={fieldStyle}
                      type="number"
                      min="0"
                      name="experience_max"
                      value={job.experience_max}
                      onChange={handleChange}
                    />
                  </label>

                  <label style={labelStyle}>
                    Number of Vacancies *
                    <input
                      style={fieldStyle}
                      type="number"
                      min="1"
                      name="vacancies"
                      value={job.vacancies}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  {message && (
                    <p style={{
                      color: message.includes("successfully")
                        ? styles.green
                        : "#DC2626",
                      fontWeight: "600"
                    }}>
                      {message}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      ...buttonStyle,
                      width: "100%",
                      padding: "14px",
                      opacity: saving ? 0.7 : 1
                    }}
                  >
                    {saving ? "Publishing..." : "Publish Job"}
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </main>

      <footer style={{
        background: styles.dark,
        color: "#CBD5E1",
        textAlign: "center",
        padding: "20px",
        fontSize: "13px"
      }}>
        TeraJobs by TeraSyncTech
      </footer>
    </div>
  );
}
