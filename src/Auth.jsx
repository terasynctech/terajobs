
import React, { useState } from "react";
import { supabase } from "./supabase";

export default function Auth({ onAuthSuccess, onClose }) {
  const [mode, setMode] = useState("register");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function syncProfile(user) {
    const metadata = user.user_metadata || {};
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      full_name: metadata.full_name || name,
      phone: metadata.phone || phone
    }, { onConflict: "id" });

    if (error) throw error;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!supabase) {
      setError("Supabase is not configured. Please contact support.");
      return;
    }

    if (mode === "register" && !/^[0-9]{10}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: name.trim(),
              phone: phone.trim()
            }
          }
        });

        if (error) throw error;

        if (data.session && data.user) {
          await syncProfile(data.user);
          onAuthSuccess?.(data.user);
        } else {
          setMessage(
            "Registration successful! Please check your email and confirm your account. Then return here to log in."
          );
          setMode("login");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });

        if (error) throw error;

        await syncProfile(data.user);
        onAuthSuccess?.(data.user);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        {onClose && (
          <button style={styles.close} onClick={onClose}>×</button>
        )}

        <div style={styles.brand}>
          <span style={styles.logo}>T</span>
          <span>Tera<span style={{ color: "#e77c35" }}>Jobs</span></span>
        </div>

        <p style={styles.tagline}>BY TERASYNCTECH</p>

        <h2>{mode === "register" ? "Create your account" : "Welcome back"}</h2>
        <p style={styles.subtitle}>
          {mode === "register"
            ? "Join TeraJobs and discover new career opportunities."
            : "Sign in to continue your job search."}
        </p>

        <div style={styles.tabs}>
          <button
            style={mode === "register" ? styles.activeTab : styles.tab}
            onClick={() => { setMode("register"); setError(""); setMessage(""); }}
          >
            Register
          </button>
          <button
            style={mode === "login" ? styles.activeTab : styles.tab}
            onClick={() => { setMode("login"); setError(""); setMessage(""); }}
          >
            Login
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <label style={styles.label}>Full name</label>
              <input
                style={styles.input}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                autoComplete="name"
              />

              <label style={styles.label}>Mobile number</label>
              <input
                style={styles.input}
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile number"
                required
                autoComplete="tel-national"
              />
            </>
          )}

          <label style={styles.label}>Email address</label>
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            autoComplete="email"
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            required
            minLength={8}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
          />

          {error && <p style={styles.error}>{error}</p>}
          {message && <p style={styles.success}>{message}</p>}

          <button style={styles.submit} disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "register"
                ? "Create account"
                : "Login"}
          </button>
        </form>

        <p style={styles.footer}>
          By continuing, you agree to use TeraJobs responsibly.
        </p>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "rgba(15, 23, 42, 0.72)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    overflowY: "auto"
  },
  card: {
    position: "relative",
    background: "#ffffff",
    width: "100%",
    maxWidth: 440,
    padding: "34px 30px",
    borderRadius: 18,
    boxShadow: "0 20px 70px rgba(0,0,0,.2)",
    fontFamily: "Arial, sans-serif",
    color: "#172033"
  },
  close: {
    position: "absolute",
    top: 12,
    right: 16,
    border: 0,
    background: "none",
    fontSize: 28,
    cursor: "pointer",
    color: "#64748b"
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 25,
    fontWeight: 800
  },
  logo: {
    background: "#173f72",
    color: "white",
    borderRadius: 9,
    padding: "7px 12px"
  },
  tagline: {
    fontSize: 10,
    letterSpacing: 2,
    color: "#64748b",
    marginTop: 5
  },
  subtitle: {
    color: "#64748b",
    fontSize: 14,
    lineHeight: 1.5
  },
  tabs: {
    display: "flex",
    background: "#f1f5f9",
    borderRadius: 9,
    padding: 4,
    margin: "24px 0"
  },
  tab: {
    flex: 1,
    padding: 11,
    border: 0,
    background: "transparent",
    cursor: "pointer",
    borderRadius: 7
  },
  activeTab: {
    flex: 1,
    padding: 11,
    border: 0,
    background: "#ffffff",
    color: "#173f72",
    fontWeight: 700,
    cursor: "pointer",
    borderRadius: 7,
    boxShadow: "0 1px 4px #ddd"
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    margin: "15px 0 7px"
  },
  input: {
    boxSizing: "border-box",
    width: "100%",
    padding: 13,
    border: "1px solid #d9e0e9",
    borderRadius: 8,
    fontSize: 14,
    outlineColor: "#173f72"
  },
  submit: {
    width: "100%",
    padding: 14,
    marginTop: 22,
    background: "#173f72",
    color: "#ffffff",
    border: 0,
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer"
  },
  error: {
    color: "#b91c1c",
    background: "#fef2f2",
    padding: 10,
    borderRadius: 7,
    fontSize: 13
  },
  success: {
    color: "#166534",
    background: "#f0fdf4",
    padding: 10,
    borderRadius: 7,
    fontSize: 13
  },
  footer: {
    fontSize: 11,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 20
  }
};
