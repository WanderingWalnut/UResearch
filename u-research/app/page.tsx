import { AnimatedProductCard } from "./animated-product-card";

const professorRows = [
  {
    initials: "SN",
    name: "Dr. Sarah Nguyen",
    university: "University of Calgary",
    interests: ["Machine Learning", "Health AI"],
    match: "96%",
    tone: "blue",
  },
  {
    initials: "MK",
    name: "Dr. Michael Kim",
    university: "University of Calgary",
    interests: ["Robotics"],
    match: "91%",
    tone: "green",
  },
] as const;

const capabilities = [
  {
    icon: <SearchIcon />,
    tone: "blue",
    title: "Semantic Search",
    description:
      "Go beyond keywords. Find Professor Profiles that align with your research interests and methods.",
  },
  {
    icon: <SendIcon />,
    tone: "green",
    title: "Student-approved Sending",
    description:
      "Review every Campaign Message before UResearch sends it through your connected Student Mailbox.",
  },
  {
    icon: <TemplateIcon />,
    tone: "coral",
    title: "Reusable Templates",
    description:
      "Create personal Message Templates with readable variables for professor and research details.",
  },
  {
    icon: <BoardIcon />,
    tone: "navy",
    title: "Centralized Outreach Board",
    description:
      "Track sent, opened, and replied Outreach Threads and see when a Follow-up Reminder is due.",
  },
] as const;

export default function Home() {
  return (
    <div className="landing-page">
      <header className="site-header">
        <div className="header-shell">
          <a className="wordmark" href="#top" aria-label="UResearch home">
            UResearch
          </a>
          <nav className="primary-nav" aria-label="Main navigation">
            <a className="active" href="#discover">
              Discover
            </a>
            <a href="#manage">Manage</a>
          </nav>
          <a className="button button--primary button--small" href="#discover">
            Get Started
          </a>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <h1>Research Outreach, Reimagined</h1>
          <p>
            Find relevant Professor Profiles, build personalized Outreach
            Campaigns, and manage every Outreach Thread—all in one workspace.
          </p>
          <div className="hero-actions">
            <a className="button button--primary" href="#discover">
              Get Started for Free
            </a>
            <a className="button button--secondary" href="#capabilities">
              View Capabilities
            </a>
          </div>
        </section>

        <section className="bento-grid" id="discover" aria-label="Product preview">
          <AnimatedProductCard className="product-card discovery-card" order={0}>
            <CardHeading icon={<SearchIcon />} title="Smart Professor Discovery" />
            <p className="card-description">
              Search the University of Calgary catalog by research interests,
              department, and semantic fit. Save promising Professor Profiles
              before you start outreach.
            </p>
            <div className="data-table">
              <div className="data-row data-header">
                <span>PROFESSOR</span>
                <span>RESEARCH FOCUS</span>
                <span>MATCH SCORE</span>
              </div>
              {professorRows.map((professor) => (
                <div className="data-row professor-row" key={professor.name}>
                  <div className="professor-cell">
                    <span className={`avatar avatar--${professor.tone}`}>
                      {professor.initials}
                    </span>
                    <span>
                      <strong>{professor.name}</strong>
                      <small>{professor.university}</small>
                    </span>
                  </div>
                  <div className="interest-list">
                    {professor.interests.map((interest) => (
                      <span className="chip" key={interest}>
                        {interest}
                      </span>
                    ))}
                  </div>
                  <strong className="match-score">{professor.match}</strong>
                </div>
              ))}
            </div>
          </AnimatedProductCard>

          <AnimatedProductCard className="product-card outreach-card" order={1}>
            <CardHeading icon={<SendIcon />} title="Personalized Outreach" />
            <p className="card-description">
              Build reusable Message Templates, personalize each Campaign
              Message, and approve every send.
            </p>
            <div className="template-preview">
              <span className="micro-label">TEMPLATE PREVIEW</span>
              <div className="message-preview">
                <p>
                  Dear Prof. <mark className="variable variable--blue">Professor Name</mark>,
                </p>
                <p>
                  I&apos;m interested in your work on{" "}
                  <mark className="variable variable--green">Research Interest</mark>
                  and would value the chance to learn more...
                </p>
              </div>
              <span className="preview-action">Edit Message Template</span>
            </div>
          </AnimatedProductCard>

          <AnimatedProductCard
            className="product-card workflow-card"
            id="manage"
            order={2}
          >
            <div className="workflow-intro">
              <div>
                <CardHeading
                  icon={<InsightsIcon />}
                  title="Unified Workflow Tracking"
                  tone="green"
                />
                <p className="card-description">
                  Use the Outreach Board to follow sent, opened, and replied
                  Outreach Threads. Follow-up Reminders keep the next student
                  action visible.
                </p>
              </div>
              <span className="summary-badge">
                <ArrowUpIcon /> 3 FOLLOW-UPS DUE
              </span>
            </div>

            <div className="board-preview">
              <BoardLane label="SENT" count="24">
                <ThreadCard title="Dr. Chen" meta="Sent 2 days ago" />
                <ThreadCard title="Dr. Smith" meta="Sent 3 days ago" />
              </BoardLane>
              <BoardLane label="OPENED" count="8">
                <ThreadCard
                  title="Dr. Williams"
                  meta="Opened 2 hours ago"
                  state="opened"
                />
              </BoardLane>
              <BoardLane label="REPLIED" count="3">
                <ThreadCard
                  title="Dr. Garcia"
                  meta="Student added a Replied Mark"
                  state="replied"
                />
              </BoardLane>
            </div>
          </AnimatedProductCard>
        </section>

        <section className="capabilities-section" id="capabilities">
          <div className="section-heading">
            <h2>Core Capabilities</h2>
            <p>
              Everything a Student needs to find Professors and keep research
              outreach organized.
            </p>
          </div>
          <div className="capability-grid">
            {capabilities.map((capability) => (
              <article className="capability-card" key={capability.title}>
                <span className={`capability-icon capability-icon--${capability.tone}`}>
                  {capability.icon}
                </span>
                <h3>{capability.title}</h3>
                <p>{capability.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-shell">
          <a className="footer-wordmark" href="#top">
            UResearch
          </a>
          <nav aria-label="Footer navigation">
            <a href="#discover">Professor Discovery</a>
            <a href="#discover">Outreach Campaigns</a>
            <a href="#manage">Outreach Board</a>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
          </nav>
          <p>© 2026 UResearch. Organized outreach for academic research.</p>
        </div>
      </footer>
    </div>
  );
}

function CardHeading({
  icon,
  title,
  tone = "blue",
}: {
  icon: React.ReactNode;
  title: string;
  tone?: "blue" | "green";
}) {
  return (
    <div className={`card-heading card-heading--${tone}`}>
      <span>{icon}</span>
      <h2>{title}</h2>
    </div>
  );
}

function BoardLane({
  label,
  count,
  children,
}: {
  label: string;
  count: string;
  children: React.ReactNode;
}) {
  return (
    <div className="board-lane">
      <div className="lane-heading">
        <span>{label}</span>
        <span>({count})</span>
      </div>
      <div className="thread-list">{children}</div>
    </div>
  );
}

function ThreadCard({
  title,
  meta,
  state,
}: {
  title: string;
  meta: string;
  state?: "opened" | "replied";
}) {
  return (
    <div className={`thread-card ${state ? `thread-card--${state}` : ""}`}>
      <div className="thread-title">
        <strong>{title}</strong>
        {state === "opened" ? <span className="opened-dot" /> : null}
        {state === "replied" ? <CheckIcon /> : null}
      </div>
      <small>{meta}</small>
      {state === "replied" ? <span className="thread-action">Open thread</span> : null}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 18c.4-3 2-4.5 5-4.5 2.2 0 3.7.8 4.4 2.3M16.5 14.5l4 4M18.5 13a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3.5 5.5h14v11h-14zM4 6l6.5 5L17 6M15 19h6M18 16l3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InsightsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m3 17 5-5 4 3 7-8M15 7h4v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m5 5 .5 1.5L7 7l-1.5.5L5 9l-.5-1.5L3 7l1.5-.5L5 5Z" fill="currentColor" />
    </svg>
  );
}

function TemplateIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 3.5h8l4 4v13H6zM14 3.5v4h4M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function BoardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.5" y="3.5" width="7" height="7" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3.5" y="13.5" width="7" height="7" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.5" y="13.5" width="7" height="7" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 13V3M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="check-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" />
      <path d="m5.5 8 1.7 1.7L10.8 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
