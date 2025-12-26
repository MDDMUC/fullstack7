export default function Footer() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-content">
        <div className="landing-footer-logo">
          <img src="/dab-logo.svg" alt="DAB" className="footer-logo-img" />
        </div>
        <div className="landing-footer-text">
          <p>Built by climbers for climbers. Finding your crew made easy.</p>
        </div>
        <div className="landing-footer-links">
          <a href="/community-guidelines">Community Guidelines</a>
          <a href="/safety">Safety Tips</a>
          <a href="mailto:hello@dabapp.com">Contact</a>
        </div>
      </div>
    </footer>
  )
}
