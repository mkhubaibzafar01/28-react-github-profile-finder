import { useState } from "react";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function searchProfile(event) {
    event.preventDefault();

    const name = username.trim();

    if (!name) {
      setError("Please enter a GitHub username.");
      return;
    }

    setLoading(true);
    setError("");
    setProfile(null);
    setRepos([]);

    try {
      const response = await fetch(
        `https://api.github.com/users/${encodeURIComponent(name)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("User not found. Check the username.");
        }

        if (response.status === 403) {
          throw new Error("API rate limit reached. Try again later.");
        }

        throw new Error("Unable to fetch profile. Please try again.");
      }

      const data = await response.json();

      const repoResponse = await fetch(
        `https://api.github.com/users/${encodeURIComponent(name)}/repos?sort=updated&per_page=6`
      );

      if (!repoResponse.ok) {
        throw new Error("Profile loaded, but repositories could not be fetched.");
      }

      const repoData = await repoResponse.json();

      setProfile(data);
      setRepos(repoData);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app">
      <header className="header">
        <div className="brand">
          <span className="github-mark">GH</span>
          <span>DevFinder</span>
        </div>
        <span className="badge">DEVELOPER TOOL</span>
      </header>

      <section className="hero">
        <p className="eyebrow">EXPLORE THE DEVELOPER WORLD</p>
        <h1>Find your next<br />favorite developer.</h1>
        <p className="subtitle">
          Search GitHub profiles and explore public repositories.
        </p>
      </section>

      <form className="search-form" onSubmit={searchProfile}>
        <span className="search-icon">⌕</span>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Enter GitHub username..."
          aria-label="GitHub username"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="error" role="alert">{error}</p>}

      {loading && <p className="status">Fetching developer profile...</p>}

      {!profile && !loading && !error && (
        <section className="empty-state">
          <div className="empty-icon">⌘</div>
          <h2>Ready to explore?</h2>
          <p>Try searching for a public GitHub username.</p>
        </section>
      )}

      {profile && (
        <section className="profile-section">
          <article className="profile-card">
            <div className="profile-top">
              <img
                className="avatar"
                src={profile.avatar_url}
                alt={`${profile.login}'s GitHub avatar`}
              />

              <div className="profile-identity">
                <h2>{profile.name || profile.login}</h2>
                <a
                  href={profile.html_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  @{profile.login} ↗
                </a>
                <span className="public-label">Public GitHub profile</span>
              </div>
            </div>

            <p className="bio">
              {profile.bio || "This developer hasn't added a bio yet."}
            </p>

            <div className="profile-details">
              {profile.location && (
                <span>📍 {profile.location}</span>
              )}

              {profile.company && (
                <span>🏢 {profile.company}</span>
              )}

              {profile.blog && (
                <a
                  href={
                    /^https?:\/\//i.test(profile.blog)
                      ? profile.blog
                      : `https://${profile.blog}`
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  🔗 Website
                </a>
              )}
            </div>

            <div className="stats">
              <div>
                <span>Repositories</span>
                <strong>{profile.public_repos}</strong>
              </div>

              <div>
                <span>Followers</span>
                <strong>{profile.followers}</strong>
              </div>

              <div>
                <span>Following</span>
                <strong>{profile.following}</strong>
              </div>
            </div>

            <a
              className="profile-link"
              href={profile.html_url}
              target="_blank"
              rel="noreferrer"
            >
              View GitHub Profile ↗
            </a>
          </article>

          <section className="repos-section">
            <div className="section-heading">
              <h2>Recent repositories</h2>
              <span>{repos.length} shown</span>
            </div>

            {repos.length === 0 ? (
              <p className="status">No public repositories found.</p>
            ) : (
              <div className="repo-grid">
                {repos.map((repo) => (
                  <article className="repo-card" key={repo.id}>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="repo-name"
                    >
                      ↗ {repo.name}
                    </a>

                    <p>
                      {repo.description || "No description provided."}
                    </p>

                    <div className="repo-meta">
                      <span>⭐ {repo.stargazers_count}</span>
                      <span>⑂ {repo.forks_count}</span>
                      <span>{repo.language || "Other"}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      )}

      <footer>
        Built with React ⚛ · Powered by GitHub's public API
      </footer>
    </main>
  );
}

export default App;