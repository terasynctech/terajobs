
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

  useEffect(() => {
    async function loadEmployer() {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (error) {
        setMessage("Could not load employer profile: " + error.message);
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

    const { error } = await supabase
      .from("jobs")
      .insert({
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

  const fieldStyle = {
    width: "100%",
    padding: "11px",
    marginTop: "6px",
    marginBottom: "15px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    boxSizing: "border-box",
    fontSize: "14px"
  };

  const labelStyle = {
    display: "block",
    fontWeight: "600",
    color: "#334155",
    fontSize: "14px"
  };

  return (
    <div style={{
      padding: "30px",
      maxWidth: "1100px",
      margin: "auto",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{ color: "#173f72" }}>Employer Dashboard</h1>

      <p>Welcome, {companyName || user.email}</p>
      <p>Manage your company and recruitment activities.</p>

      <hr />

      {activePage === "menu" ? (
        <>
          <h2>Employer Services</h2>

          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginTop: "20px"
          }}>
            <button
              type="button"
              onClick={() => {
                setActivePage("post");
                setMessage("");
              }}
            >
              Post a Job
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePage("manage");
                loadMyJobs();
              }}
            >
              Manage Jobs
            </button>

            <button type="button" disabled>
              View Applicants
            </button>

            <button type="button" disabled>
              Company Profile
            </button>
          </div>
        </>
      ) : activePage === "manage" ? (
        <>
          <button
            type="button"
            onClick={() => {
              setActivePage("menu");
              setMessage("");
            }}
            style={{ marginBottom: "20px" }}
          >
            ← Back to Dashboard
          </button>

          <h2 style={{ color: "#173f72" }}>Manage Jobs</h2>
          <p>View the vacancies posted by your company.</p>

          {loading && <p>Loading your jobs...</p>}

          {message && <p style={{ color: "red" }}>{message}</p>}

          {!loading && myJobs.length === 0 && (
            <p>You have not posted any jobs yet.</p>
          )}

          {!loading && myJobs.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "18px",
                marginBottom: "15px"
              }}
            >
              <h3 style={{ color: "#173f72" }}>{item.title}</h3>
              <p><strong>Company:</strong> {item.company_name}</p>
              <p><strong>Location:</strong> {item.city}, {item.state}</p>
              <p><strong>Employment:</strong> {item.employment_type}</p>
              <p><strong>Status:</strong> {item.status}</p>
              <p>
                <strong>Salary:</strong>{" "}
                {item.salary_min || item.salary_max
                  ? `₹${item.salary_min || 0} - ₹${item.salary_max || 0}`
                  : "Not specified"}
              </p>
            </div>
          ))}
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              setActivePage("menu");
              setMessage("");
            }}
            style={{ marginBottom: "20px" }}
          >
            ← Back to Dashboard
          </button>

          <h2 style={{ color: "#173f72" }}>Post a New Job</h2>
          <p>Enter the vacancy details below.</p>

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
                  placeholder="Describe the job responsibilities and requirements"
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
                  placeholder="Example: Sales, IT, Marketing"
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
                  placeholder="Example: 15000"
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
                  placeholder="Example: 25000"
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
                  color: message.includes("successfully") ? "green" : "red",
                  fontWeight: "600"
                }}>
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "13px 25px",
                  background: "#173f72",
                  color: "white",
                  border: "none",
                  borderRadius: "7px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                {saving ? "Publishing..." : "Publish Job"}
              </button>
            </form>
          )}
        </>
      )}

      <hr style={{ marginTop: "30px" }} />

      <button type="button" onClick={onClose}>
        Close Dashboard
      </button>
    </div>
  );
}
