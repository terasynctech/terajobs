
import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function EmployerDashboard({ user, onClose }) {
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmployer() {
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (data) setCompanyName(data.full_name || "");
      setLoading(false);
    }

    loadEmployer();
  }, [user]);

  return (
    <div style={{ padding: "30px", maxWidth: "1100px", margin: "auto" }}>
      <h1>Employer Dashboard</h1>

      <p>Welcome, {companyName || user.email}</p>

      <p>Manage your company and recruitment activities.</p>

      <hr />

      <h2>Employer Services</h2>

      <button type="button">Post a Job</button>
      <button type="button">Manage Jobs</button>
      <button type="button">View Applicants</button>
      <button type="button">Company Profile</button>

      {loading && <p>Loading employer profile...</p>}

      <hr />

      <button type="button" onClick={onClose}>
        Close Dashboard
      </button>
    </div>
  );
}
