import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import BlurText from "./components/react-bits/BlurText/BlurText";
import CountUp from "./components/react-bits/CountUp/CountUp";
const FadeContent = lazy(
  () => import("./components/react-bits/FadeContent/FadeContent"),
);
import ShapeGrid from "./components/react-bits/ShapeGrid/ShapeGrid";
import SpotlightCard from "./components/react-bits/SpotlightCard/SpotlightCard";
import SquishSwitch from "./components/react-bits/SquishSwitch/SquishSwitch";

function useMotion() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(!m.matches);
    update();
    m.addEventListener("change", update);
    return () => m.removeEventListener("change", update);
  }, []);
  return enabled;
}
const Arrow = () => <span aria-hidden="true">↗</span>;
const Logo = () => (
  <a className="wordmark" href="/" aria-label="Fieldwork home">
    <span className="logo-symbol" aria-hidden="true">
      ✳
    </span>{" "}
    fieldwork<span className="wordmark-dot">.</span>
  </a>
);
function Shell({ children, active }: { children: ReactNode; active: string }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo />
        <div className="workspace">
          <span className="avatar">W</span>
          <div>
            Willow Studio<small>Studio workspace</small>
          </div>
          <span aria-hidden="true">⌄</span>
        </div>
        <nav aria-label="Workspace">
          <a
            href="/dashboard"
            aria-current={active === "dashboard" ? "page" : undefined}
          >
            <span aria-hidden="true">▥</span> Overview
          </a>
          <a
            href="/settings"
            aria-current={active === "settings" ? "page" : undefined}
          >
            <span aria-hidden="true">⚙</span> Settings
          </a>
          <a href="/">
            <span aria-hidden="true">↗</span> Fieldwork website
          </a>
        </nav>
        <div className="sidebar-foot">
          <span className="avatar person">AL</span>
          <div>
            Alex Lane<small>Studio owner</small>
          </div>
        </div>
      </aside>
      <div className="app-content">{children}</div>
    </div>
  );
}
function Marketing() {
  const motion = useMotion();
  const baseline = new URLSearchParams(location.search).has("baseline");
  const [paused, setPaused] = useState(false);
  const animate = motion && !baseline && !paused;
  return (
    <div className={`marketing ${baseline ? "baseline" : ""}`}>
      <header className="site-header">
        <Logo />
        <nav aria-label="Main">
          <a href="#approach">Our approach</a>
          <a href="/dashboard" className="header-link">
            Open workspace <Arrow />
          </a>
        </nav>
      </header>
      <main id="main">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" /> A little structure. A lot more
              possibility.
            </div>
            <h1 className="sr-only">Make space for your best work.</h1>
            <div aria-hidden="true" className="hero-title">
              Make space for
              <br />
              {animate ? (
                <BlurText
                  text="your best work."
                  className="serif-title"
                  delay={55}
                  stepDuration={0.18}
                  animationFrom={{ opacity: 0, filter: "blur(4px)", y: 8 }}
                  animationTo={[{ opacity: 1, filter: "blur(0px)", y: 0 }]}
                />
              ) : (
                <p className="serif-title">your best work.</p>
              )}
            </div>
            <p className="hero-description">
              A calmer home for the projects, people, and small details that
              make your independent studio thrive.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="/dashboard">
                Find your rhythm <Arrow />
              </a>
              <a className="text-link" href="#approach">
                See how it works <span aria-hidden="true">↓</span>
              </a>
            </div>
            <p className="caption">Built for small teams with big ideas.</p>
          </div>
          <div className="hero-art">
            <div className="art-index">
              A GOOD WEEK, BY DESIGN <span>01 / 03</span>
            </div>
            <div className="art-background" aria-hidden="true">
              {animate ? (
                <div data-testid="motion-canvas">
                  <ShapeGrid
                    speed={0.12}
                    squareSize={46}
                    borderColor="#adc2ab"
                    hoverFillColor="#d5e0ca"
                  />
                </div>
              ) : (
                <div className="static-grid" />
              )}
            </div>
            <div className="planner">
              <div className="planner-top">
                <span>Willow Studio</span>
                <span className="tiny-badge">In a good place</span>
              </div>
              <div className="planner-title">
                Room for the
                <br />
                <em>work that matters.</em>
              </div>
              <div className="day-strip">
                MON <span>TUE</span> WED <span className="selected">THU</span>{" "}
                FRI
              </div>
              <div className="schedule">
                <div>
                  <time>09:00</time>
                  <span className="event sage">
                    <b>Make something meaningful</b>
                    <small>Focus time · Design team</small>
                  </span>
                </div>
                <div>
                  <time>11:30</time>
                  <span className="event peach">
                    <b>A good conversation</b>
                    <small>Brand direction · Atelier Onda</small>
                  </span>
                </div>
                <div>
                  <time>14:00</time>
                  <span className="event cream">
                    <b>Bring it all together</b>
                    <small>Weekly studio review</small>
                  </span>
                </div>
              </div>
              <div className="planner-bottom">
                <span className="mini-avatars">
                  <i>AL</i>
                  <i>JN</i>
                  <i>MK</i>
                </span>
                <span>Different minds. Shared momentum.</span>
              </div>
            </div>
            <div className="floating-note">
              <span aria-hidden="true">↗</span> Less busywork.
              <br />
              <b>More good work.</b>
            </div>
            <button
              className="motion-toggle"
              onClick={() => setPaused(!paused)}
              aria-pressed={paused}
            >
              {paused ? "Resume illustration" : "Pause illustration"}
            </button>
          </div>
        </section>
        <div className="trusted">
          <span>For people who care about their craft.</span>
          <div>Atelier Onda</div>
          <div className="serif">north & form</div>
          <div>STUDIO COMMON</div>
          <div className="serif">Morrow</div>
        </div>
        <section className="approach" id="approach">
          <div>
            <div className="eyebrow">THE FIELDWORK WAY</div>
            <h2>
              Everything in its place.
              <br />
              <em>You, in your element.</em>
            </h2>
          </div>
          {animate ? (
            <Suspense
              fallback={
                <p>
                  From the first conversation to the final handoff, keep the
                  whole picture in view.
                </p>
              }
            >
              <FadeContent duration={350} initialOpacity={0.5}>
                <p>
                  From the first conversation to the final handoff, keep the
                  whole picture in view. Give your team the clarity to do work
                  they’re proud of.
                </p>
              </FadeContent>
            </Suspense>
          ) : (
            <p>
              From the first conversation to the final handoff, keep the whole
              picture in view. Give your team the clarity to do work they’re
              proud of.
            </p>
          )}
        </section>
        <section className="feature-row" aria-label="Fieldwork benefits">
          {animate ? (
            <SpotlightCard
              theme="light"
              intensity={0.08}
              proximity={0}
              className="feature-card"
            >
              <span className="feature-number">01 — CLARITY</span>
              <h3>A shared sense of direction.</h3>
              <p>Keep briefs, milestones and next steps together.</p>
            </SpotlightCard>
          ) : (
            <div className="feature-card">
              <span className="feature-number">01 — CLARITY</span>
              <h3>A shared sense of direction.</h3>
              <p>Keep briefs, milestones and next steps together.</p>
            </div>
          )}
          <div className="feature-card">
            <span className="feature-number">02 — FOCUS</span>
            <h3>Protect the work that matters.</h3>
            <p>Make room for deep work, without losing the details.</p>
          </div>
          <div className="feature-card">
            <span className="feature-number">03 — MOMENTUM</span>
            <h3>Progress you can feel.</h3>
            <p>A thoughtful rhythm for projects and people.</p>
          </div>
        </section>
      </main>
      <footer>
        <Logo />
        <span>A calmer way to work, together.</span>
        <a href="/settings">
          Workspace settings <Arrow />
        </a>
      </footer>
    </div>
  );
}
const projects = [
  {
    name: "Onda — A new chapter",
    client: "Atelier Onda",
    status: "In progress",
    progress: 72,
    due: "Oct 16",
    owner: "JN",
  },
  {
    name: "A home for good ideas",
    client: "Common Ground",
    status: "In review",
    progress: 90,
    due: "Oct 14",
    owner: "AL",
  },
  {
    name: "Objects with a story",
    client: "Morrow",
    status: "In progress",
    progress: 46,
    due: "Oct 23",
    owner: "MK",
  },
  {
    name: "The shape of things",
    client: "North & Form",
    status: "Planning",
    progress: 18,
    due: "Nov 02",
    owner: "JN",
  },
];
function Dashboard() {
  const motion = useMotion();
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("week");
  const [notice, setNotice] = useState("");
  const bars =
    period === "week"
      ? [38, 62, 51, 84, 72, 46, 65]
      : [45, 53, 42, 68, 83, 72, 92];
  return (
    <Shell active="dashboard">
      <header className="app-topbar">
        <span>
          Workspace <span aria-hidden="true">/</span> <b>Overview</b>
        </span>
        <span className="topbar-date">Thursday, October 8, 2026</span>
      </header>
      <main id="main" className="dashboard-main">
        <div className="page-heading">
          <div className="eyebrow">YOUR STUDIO, AT A GLANCE</div>
          <div className="heading-row">
            <div>
              <h1>A little clarity goes a long way.</h1>
              <p>Good morning, Alex. Here’s how the studio is moving.</p>
            </div>
            <button
              className="button primary"
              onClick={() =>
                setNotice(
                  "Your studio summary is ready: 4 active projects, 12 milestones completed.",
                )
              }
            >
              Studio summary <Arrow />
            </button>
          </div>
        </div>
        <p role="status" className="notice">
          {notice}
        </p>
        <section className="metrics" aria-label="Studio metrics">
          <article>
            <span>Active projects</span>
            <strong>04</strong>
            <small>Across 4 thoughtful partnerships</small>
          </article>
          <article>
            <span>Milestones completed</span>
            <strong>
              <span className="sr-only">12</span>
              <span aria-hidden="true">
                {motion ? <CountUp to={12} duration={0.7} /> : 12}
              </span>
              <em>+3 this week</em>
            </strong>
            <small>Little steps, meaningful progress</small>
          </article>
          <article>
            <span>Studio capacity</span>
            <strong>
              76<span className="unit">%</span>
            </strong>
            <small>
              <span className="status-dot" /> A healthy balance
            </small>
          </article>
        </section>
        <div className="dashboard-grid">
          <section className="panel activity">
            <div className="panel-heading">
              <div>
                <h2>Finding our rhythm</h2>
                <p>Focused hours, across the studio</p>
              </div>
              <div
                className="segmented"
                role="group"
                aria-label="Activity period"
              >
                <button
                  aria-pressed={period === "week"}
                  onClick={() => setPeriod("week")}
                >
                  Week
                </button>
                <button
                  aria-pressed={period === "month"}
                  onClick={() => setPeriod("month")}
                >
                  Month
                </button>
              </div>
            </div>
            <div className="chart-summary">
              <strong>
                {period === "week" ? "128" : "512"}
                <span> hrs</span>
              </strong>
              <span className="positive">↗ 12% from last {period}</span>
            </div>
            <div
              className="bar-chart"
              role="img"
              aria-label={`${period === "week" ? "128" : "512"} focused hours across the studio.`}
            >
              {bars.map((value, i) => (
                <div className="bar-column" key={i}>
                  <div
                    className={`bar ${i === 3 ? "accent" : ""}`}
                    style={{ height: `${value}%` }}
                  />
                  <span>{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="panel up-next">
            <div className="panel-heading">
              <h2>On the horizon</h2>
              <span className="pill">Today</span>
            </div>
            <article>
              <time>11:30</time>
              <div>
                <h3>Onda brand direction</h3>
                <p>Alex + Jamie · 30 min</p>
              </div>
              <span className="meeting-dot" />
            </article>
            <article>
              <time>14:00</time>
              <div>
                <h3>Studio check-in</h3>
                <p>The whole team · 45 min</p>
              </div>
              <span className="meeting-dot peach-dot" />
            </article>
            <div className="quiet-note">
              <span aria-hidden="true">✳</span>
              <p>
                A little breathing room.
                <br />
                <b>No more meetings after 3pm.</b>
              </p>
            </div>
          </section>
        </div>
        <section className="panel project-panel">
          <div className="panel-heading">
            <div>
              <h2>Work in motion</h2>
              <p>The projects taking shape this week</p>
            </div>
            <label className="search-field">
              <span className="sr-only">Filter projects</span>
              <span aria-hidden="true">⌕</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find a project"
              />
            </label>
          </div>
          <div
            className="table-scroll"
            tabIndex={0}
            role="region"
            aria-label="Project progress table"
          >
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Next milestone</th>
                  <th>Lead</th>
                </tr>
              </thead>
              <tbody>
                {projects
                  .filter((p) =>
                    `${p.name} ${p.client}`
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                  )
                  .map((p) => (
                    <tr key={p.name}>
                      <td>
                        <b>{p.name}</b>
                        <small>{p.client}</small>
                      </td>
                      <td>
                        <span
                          className={`project-status ${p.status.toLowerCase().replace(" ", "-")}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <div className="progress">
                          <span style={{ width: `${p.progress}%` }} />
                        </div>
                        <span className="progress-label">{p.progress}%</span>
                      </td>
                      <td>{p.due}</td>
                      <td>
                        <span className="avatar small">{p.owner}</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!projects.some((p) =>
              `${p.name} ${p.client}`
                .toLowerCase()
                .includes(query.toLowerCase()),
            ) && (
              <p className="empty-state">
                No matching projects. Try another name.
              </p>
            )}
          </div>
        </section>
        <p className="app-footer">
          A clear picture. A little more room to create.
        </p>
      </main>
    </Shell>
  );
}
function Settings() {
  const motion = useMotion();
  const [digest, setDigest] = useState(true);
  const [reminders, setReminders] = useState(false);
  const [name, setName] = useState("Willow Studio");
  const [email, setEmail] = useState("alex@willow.example");
  const [status, setStatus] = useState("");
  const toggle = (
    id: string,
    label: string,
    value: boolean,
    set: (v: boolean) => void,
  ) =>
    motion ? (
      <SquishSwitch
        id={id}
        ariaLabel={label}
        checked={value}
        onChange={set}
        width={44}
        height={25}
        trackColor="#d9ddd6"
        trackOnColor="#2f5d4b"
        thumbOnColor="#fff"
        speed={70}
        stretch={8}
      />
    ) : (
      <input
        id={id}
        aria-label={label}
        className="native-toggle"
        type="checkbox"
        role="switch"
        checked={value}
        onChange={(e) => set(e.target.checked)}
      />
    );
  return (
    <Shell active="settings">
      <header className="app-topbar">
        <span>
          Workspace <span aria-hidden="true">/</span> <b>Settings</b>
        </span>
        <span className="topbar-date">Make yourself at home</span>
      </header>
      <main id="main" className="settings-main">
        <div className="page-heading">
          <div className="eyebrow">A WORKSPACE THAT FITS</div>
          <h1>Set your own rhythm.</h1>
          <p>A few thoughtful preferences to make Fieldwork feel like yours.</p>
        </div>
        <div className="settings-layout">
          <nav aria-label="Settings sections" className="settings-nav">
            <a href="#studio" aria-current="page">
              Studio profile
            </a>
            <a href="#notifications">Notifications</a>
          </nav>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStatus(`Changes saved for ${name}.`);
            }}
          >
            <section className="panel settings-panel" id="studio">
              <div className="settings-section-title">
                <span className="section-icon" aria-hidden="true">
                  ✳
                </span>
                <div>
                  <h2>Your studio</h2>
                  <p>The details that make it yours.</p>
                </div>
              </div>
              <div className="studio-identity">
                <span className="studio-monogram">W.</span>
                <div>
                  <b>Willow Studio</b>
                  <small>Independent by nature. Thoughtful by design.</small>
                </div>
              </div>
              <div className="form-grid">
                <label>
                  Studio name
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    name="studio"
                    autoComplete="organization"
                  />
                </label>
                <label>
                  Contact email
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    name="email"
                    autoComplete="email"
                  />
                </label>
                <label>
                  Time zone
                  <select defaultValue="Europe/Paris" name="timezone">
                    <option value="Europe/Paris">Paris (Europe/Paris)</option>
                    <option value="Europe/London">
                      London (Europe/London)
                    </option>
                    <option value="America/New_York">
                      New York (America/New_York)
                    </option>
                  </select>
                </label>
                <label>
                  Week starts on
                  <select defaultValue="Monday" name="week-start">
                    <option>Monday</option>
                    <option>Sunday</option>
                  </select>
                </label>
              </div>
              <p className="field-help">
                Your time zone keeps schedules and deadlines in sync.
              </p>
            </section>
            <section className="panel settings-panel" id="notifications">
              <div className="settings-section-title">
                <span className="section-icon" aria-hidden="true">
                  ↗
                </span>
                <div>
                  <h2>A little less noise</h2>
                  <p>Stay in the loop, on your terms.</p>
                </div>
              </div>
              <div className="preference-row">
                <div>
                  <h3>Weekly studio digest</h3>
                  <p>A calm recap of progress, every Monday.</p>
                </div>
                {toggle("digest", "Weekly studio digest", digest, setDigest)}
              </div>
              <div className="preference-row">
                <div>
                  <h3>Milestone reminders</h3>
                  <p>A gentle nudge before important dates.</p>
                </div>
                {toggle(
                  "reminders",
                  "Milestone reminders",
                  reminders,
                  setReminders,
                )}
              </div>
            </section>
            <div className="form-actions">
              <p role="status" data-testid="save-status">
                {status || "Preferences are stored for this demo session."}
              </p>
              <button className="button primary" type="submit">
                Save changes <span aria-hidden="true">✓</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </Shell>
  );
}
export default function App() {
  const path = location.pathname;
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {path === "/dashboard" ? (
        <Dashboard />
      ) : path === "/settings" ? (
        <Settings />
      ) : (
        <Marketing />
      )}
    </>
  );
}
