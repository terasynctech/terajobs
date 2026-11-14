
import React, { useEffect, useMemo, useState } from "react";
import Auth from "./Auth";
import Dashboard from "./Dashboard";
import {
  Search,
  MapPin,
  BriefcaseBusiness,
  Users,
  Building2,
  ArrowRight,
  UploadCloud,
  ShieldCheck,
  Menu,
  X
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "./supabase";

const sampleJobs = [
  {
    id: 1,
    title: "Sales Executive",
    company: "Growing Retail Company",
    city: "Ranchi",
    salary: "₹12,000–₹18,000 / month",
    type: "Full-time",
    category: "Sales"
  },
  {
    id: 2,
    title: "Computer Operator",
    company: "Office Solutions",
    city: "Ranchi",
    salary: "₹10,000–₹15,000 / month",
    type: "Full-time",
    category: "Office"
  },
  {
    id: 3,
    title: "Delivery Partner",
    company: "Local Logistics Company",
    city: "Jamshedpur",
    salary: "₹15,000–₹22,000 / month",
    type: "Full-time",
    category: "Delivery"
  },
  {
    id: 4,
    title: "Telecaller",
    company: "Customer Support Services",
    city: "Dhanbad",
    salary: "₹9,000–₹14,000 / month",
    type: "Full-time",
    category: "Customer Support"
  }
];

export default function App() {
  const [keyword, setKeyword] = useState("");
  const [city, setCity] = useState("");
  const [jobs, setJobs] = useState(sampleJobs);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const filteredJobs = useMemo(
    () =>
      jobs.filter(
        (job) =>
          `${job.title} ${job.company} ${job.category}`
            .toLowerCase()
            .includes(keyword.toLowerCase()) &&
          job.city.toLowerCase().includes(city.toLowerCase())
      ),
    [jobs, keyword, city]
  );

  async function searchLiveJobs() {
    if (!supabase) {
      setNotice(
        "Demo listings are shown. Connect your Supabase project to load live vacancies."
      );
      return;
    }

    const { data, error } = await supabase
      .from("jobs")
      .select(
        "id,title,company_name,city,salary_min,salary_max,employment_type,category"
      )
      .eq("status", "published")
      .ilike("title", `%${keyword}%`)
      .ilike("city", `%${city}%`)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) {
      setNotice(`Could not load live jobs: ${error.message}`);
      return;
    }

    setJobs(
      (data || []).map((j) => ({
        id: j.id,
        title: j.title,
        company: j.company_name || "Verified employer",
        city: j.city,
        salary:
          j.salary_min || j.salary_max
            ? `₹${j.salary_min ?? "—"}–₹${j.salary_max ?? "—"} / month`
            : "Salary not disclosed",
        type: j.employment_type || "Not specified",
        category: j.category || "Other"
      }))
    );

    setNotice(`${data?.length || 0} live vacancies found.`);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-mark">T</span>
          <span>
            Tera<span className="brand-accent">Jobs</span>
            <small>BY TERASYNCTECH</small>
          </span>
        </a>

        <button
          className="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <a href="#jobs" onClick={() => setMenuOpen(false)}>
            Find Jobs
          </a>

          <a href="#how" onClick={() => setMenuOpen(false)}>
            How it works
          </a>

          <a href="#employers" onClick={() => setMenuOpen(false)}>
            For Employers
          </a>

          {user ? (
            <button
              type="button"
              className="login-link"
              onClick={() => {
                setMenuOpen(false);
                setDashboardOpen(true);
              }}
            >
              Welcome, {user.user_metadata?.full_name || user.email}
            </button>
          ) : (
            <button
              type="button"
              className="login-link"
              onClick={() => {
                setMenuOpen(false);
                setAuthOpen(true);
              }}
            >
              Login / Register
            </button>
          )}

          <a className="post-job" href="#employers">
            Post a Job <ArrowRight size={16} />
          </a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="live-dot"></span>
              YOUR NEXT OPPORTUNITY STARTS HERE
            </div>

            <h1>
              Find a job that
              <br />
              <span>moves you forward.</span>
            </h1>

            <p className="hero-copy">
              Discover local opportunities, connect with employers and take
              the next step in your career.
            </p>

            <div className="search-panel">
              <label>
                <Search size={19} />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Job title, skill or company"
                />
              </label>

              <i></i>

              <label>
                <MapPin size={19} />
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City (e.g. Ranchi)"
                />
              </label>

              <button onClick={searchLiveJobs}>
                Search Jobs <ArrowRight size={17} />
              </button>
            </div>

            <div className="popular">
              <b>Popular:</b>
              <button onClick={() => setKeyword("Sales")}>Sales</button>
              <button onClick={() => setKeyword("Computer Operator")}>
                Computer Operator
              </button>
              <button onClick={() => setKeyword("Delivery")}>Delivery</button>
              <button onClick={() => setKeyword("Telecaller")}>
                Telecaller
              </button>
            </div>
          </div>

          <div className="hero-art">
            <div className="art-orbit orbit-one"></div>
            <div className="art-orbit orbit-two"></div>

            <div className="art-card main-art-card">
              <div className="art-icon">
                <BriefcaseBusiness size={28} />
              </div>
              <strong>Opportunity awaits</strong>
              <span>Find the right role for you</span>
              <div className="art-progress">
                <b></b>
              </div>
              <small>Build your future with confidence</small>
            </div>

            <div className="float-card float-top">
              <span className="float-icon green">
                <ShieldCheck size={18} />
              </span>
              <div>
                <b>Trusted opportunities</b>
                <small>Discover verified employers</small>
              </div>
            </div>

            <div className="float-card float-bottom">
              <span className="float-icon orange">
                <Users size={18} />
              </span>
              <div>
                <b>Your next chapter</b>
                <small>Starts with one application</small>
              </div>
            </div>
          </div>
        </section>

        <section className="trust-strip">
          <div>
            <b>Local opportunities</b>
            <span>Find jobs in your city</span>
          </div>
          <div>
            <b>Simple applications</b>
            <span>Apply with your profile</span>
          </div>
          <div>
            <b>Direct connections</b>
            <span>Connect with employers</span>
          </div>
        </section>

        <section className="section jobs-section" id="jobs">
          <div className="section-heading">
            <div>
              <span className="section-kicker">EXPLORE OPPORTUNITIES</span>
              <h2>Jobs you can explore</h2>
              <p>
                Start with these sample listings. Live jobs will appear after
                Supabase is connected.
              </p>
            </div>

            <a href="#jobs" onClick={searchLiveJobs}>
              Refresh listings <ArrowRight size={16} />
            </a>
          </div>

          {notice && <div className="notice">{notice}</div>}

          <div className="job-grid">
            {filteredJobs.map((job) => (
              <article className="job-card" key={job.id}>
                <div className="job-card-top">
                  <span className="job-symbol">
                    <BriefcaseBusiness size={20} />
                  </span>
                  <span className="job-type">{job.type}</span>
                </div>

                <h3>{job.title}</h3>
                <p className="company">{job.company}</p>

                <div className="job-meta">
                  <span>
                    <MapPin size={15} />
                    {job.city}
                  </span>
                  <span>{job.category}</span>
                </div>

                <div className="job-card-bottom">
                  <b>{job.salary}</b>
                  <button
                    onClick={() =>
                      setNotice(
                        "Job applications will be enabled after candidate login and Supabase setup."
                      )
                    }
                  >
                    View details <ArrowRight size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="empty-state">
              No matching sample jobs. Try another keyword or city.
            </div>
          )}
        </section>

        <section className="how-section" id="how">
          <div className="section-heading centered">
            <span className="section-kicker">GET STARTED IN THREE STEPS</span>
            <h2>Your job search, made simpler</h2>
          </div>

          <div className="steps">
            <div>
              <span>01</span>
              <h3>Create your profile</h3>
              <p>Add your details, skills, experience and resume.</p>
            </div>

            <div>
              <span>02</span>
              <h3>Discover suitable jobs</h3>
              <p>Explore openings based on your interests and location.</p>
            </div>

            <div>
              <span>03</span>
              <h3>Apply and follow up</h3>
              <p>Submit applications and track your progress.</p>
            </div>
          </div>
        </section>

        <section className="cta-section" id="candidate">
          <div>
            <span className="section-kicker">FOR JOB SEEKERS</span>
            <h2>Make your next move count.</h2>
            <p>
              Create your profile and get ready to apply for opportunities.
            </p>
          </div>

          <a href="mailto:careers@terasynctech.com?subject=TeraJobs%20Candidate%20Portal%20Enquiry">
            Candidate portal coming soon <ArrowRight size={17} />
          </a>
        </section>

        <section className="employer-section" id="employers">
          <div className="employer-icon">
            <Building2 size={28} />
          </div>

          <div>
            <span className="section-kicker">FOR EMPLOYERS</span>
            <h2>Find people who move your business forward.</h2>
            <p>
              Post vacancies, review applicants and manage your hiring
              pipeline from one place.
            </p>
          </div>

          <a href="mailto:careers@terasynctech.com?subject=TeraJobs%20Employer%20Enquiry">
            Employer access coming soon <ArrowRight size={17} />
          </a>
        </section>
      </main>

      <footer>
        <a className="brand footer-brand" href="#">
          <span className="brand-mark">T</span>
          <span>
            Tera<span className="brand-accent">Jobs</span>
            <small>BY TERASYNCTECH</small>
          </span>
        </a>

        <span>
          © {new Date().getFullYear()} TeraSyncTech. All rights reserved.
        </span>

        <span>Connecting talent with opportunity.</span>
      </footer>

      {!isSupabaseConfigured && (
        <div className="setup-pill">
          Supabase not connected · Setup mode
        </div>
      )}

      {authOpen && (
        <Auth
          onClose={() => setAuthOpen(false)}
          onAuthSuccess={(loggedInUser) => {
            setUser(loggedInUser);
            setAuthOpen(false);
          }}
        />
      )}

      {dashboardOpen && user && (
        <Dashboard
          user={user}
          onClose={() => setDashboardOpen(false)}
        />
      )}
    </div>
  );
}
