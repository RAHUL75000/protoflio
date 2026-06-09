import { useEffect, useState } from 'react'
import heroImage from './assets/hero.png'
import rahulpfoto from './assets/rahulphoto.png'
import './App.css'

const API_BASE_URL = "https://protoflio-cse7.onrender.com";

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const [theme, setTheme] = useState(localStorage.getItem('rahul-theme') || 'light')
  const [selectedProject, setSelectedProject] = useState(null)

  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [selectedProject])

  useEffect(() => {
    localStorage.setItem('rahul-theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-theme')
    } else {
      document.documentElement.classList.remove('dark-theme')
    }
  }, [theme])

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/data`)
      .then((response) => response.json())
      .then((data) => {
        setData(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching data:', error)
        setLoading(false)
      })

    const timer = setTimeout(() => {
      setShowIntro(false)
    }, 3500)

    return () => clearTimeout(timer)
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => prev === 'light' ? 'dark' : 'light')
  }

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMenuOpen(false)
    }
  }

  const handleNavClick = (event, id) => {
    event.preventDefault()
    scrollToSection(id)
  }

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const payload = Object.fromEntries(formData.entries())

    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        alert('Message sent successfully!')
        e.target.reset()
      }
    } catch (err) {
      alert('Failed to send message.')
    }
  }

  if (showIntro) {
    return (
      <div className="intro-container">
        <div className="road">
          <div className="car-container">
            <svg className="real-car" viewBox="0 0 120 45" role="img" aria-label="Loading">
              <path d="M18 29h84l-8-16H39L28 6H14L8 19v10h10Z" fill="var(--accent)" />
              <circle className="wheel-svg" cx="28" cy="34" r="7" fill="var(--ink)" />
              <circle className="wheel-svg" cx="88" cy="34" r="7" fill="var(--ink)" />
              <path d="M44 14h20v10H35l9-10Zm24 0h20l5 10H68V14Z" fill="var(--surface)" />
            </svg>
          </div>
        </div>
        <p className="intro-text">{data?.general?.intro || 'Designing Digital Experiences...'}</p>
      </div>
    )
  }

  if (loading || !data) {
    return (
      <div className="intro-container">
        <p className="intro-text">Loading...</p>
      </div>
    )
  }

  return (
    <div className={`portfolio fade-in ${theme}-theme`}>
      <div className="bg-blobs" aria-hidden="true">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <nav className="navbar">
        <div className="navbar-container">
          <a href="#hero" className="nav-logo" onClick={(event) => handleNavClick(event, 'hero')}>
            {data.general.logo}
          </a>

          <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <a href="#about" onClick={(event) => handleNavClick(event, 'about')}>About</a>
            <a href="#projects" onClick={(event) => handleNavClick(event, 'projects')}>Projects</a>
            <a href="#experience" onClick={(event) => handleNavClick(event, 'experience')}>Experience</a>
            <a href="#contact" onClick={(event) => handleNavClick(event, 'contact')}>Contact</a>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>

          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      <main>
        <section id="hero" className="hero">
          <div className="hero-content">
            <p className="eyebrow">{data.hero.eyebrow}</p>
            <h1>{data.hero.title}</h1>
            <p className="hero-copy">{data.hero.copy}</p>
            <div className="hero-actions">
              <button className="button primary" onClick={() => scrollToSection('projects')}>
                {data.hero.primaryBtn}
              </button>
              <button className="button secondary" onClick={() => scrollToSection('contact')}>
                {data.hero.secondaryBtn}
              </button>
            </div>
          </div>

          <div className="hero-media">
            <img src={heroImage} alt="Rahul Kumar" />
            <div className="availability">
              <span className="status-dot"></span>
              Available for work
            </div>
          </div>
        </section>

        <div className="metrics-grid reveal-on-scroll visible">
          {data.metrics.map((metric, index) => (
            <div key={index} className="metric">
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </div>

        <section id="about" className="section reveal-on-scroll visible">
          <div className="about-section">
            <div>
              <p className="section-kicker">{data.about.kicker}</p>
              <h2>{data.about.title}</h2>
              <div className="about-actions">
                <a href={rahulpfoto} target="_blank" rel="noopener noreferrer" className="button secondary view-photo-btn">
                  View Photo
                </a>
              </div>
            </div>
            <div className="about-copy">
              <p>{data.about.copy}</p>
              <div className="expertise-list">
                {data.about.expertise.map((skill, index) => (
                  <span key={index}>{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="section reveal-on-scroll visible">
          <div className="section-heading">
            <div>
              <p className="section-kicker">{data.projectsHeader.kicker}</p>
              <h2>{data.projectsHeader.title}</h2>
            </div>
          </div>

          <div className="project-grid">
            {data.projects.map((project, index) => (
              <div key={project.id || project.title} className="project-card" onClick={() => setSelectedProject(project)}>
                <div className="project-spotlight"></div>
                <div className="project-preview">
                  <div className="preview-window">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className="preview-grid">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>

                <div className="project-meta">
                  <span className="project-type">{project.accent}</span>
                  <span className="project-number">0{index + 1}</span>
                </div>

                <div className="project-body">
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="tech-stack">
                    {project.tech.map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>
                </div>

                <div className="project-link">
                  <span>View details</span>
                  <span>+</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {selectedProject && (
          <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
            <div className="modal-content" onClick={(event) => event.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedProject(null)}>&times;</button>
              <div className="modal-body">
                <span className="project-type">{selectedProject.accent}</span>
                <h2>{selectedProject.title}</h2>
                <p className="modal-description">{selectedProject.fullDescription}</p>
                <div className="modal-tech">
                  {selectedProject.tech.map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>
                <div className="modal-actions">
                  {selectedProject.link !== "#" && (
                    <a href={selectedProject.link} target="_blank" rel="noopener noreferrer" className="button primary">
                      View Project
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <section className="section reveal-on-scroll visible">
          <div className="section-heading">
            <div>
              <p className="section-kicker">{data.hackathonHeader.kicker}</p>
              <h2>{data.hackathonHeader.title}</h2>
            </div>
          </div>

          <div className="hackathon-grid">
            {data.hackathons.map((hack) => (
              <div key={hack.title} className="hackathon-card">
                <div className="hackathon-badge">{hack.achievement}</div>
                <span className="hackathon-year">{hack.year}</span>
                <h3>{hack.title}</h3>
                <div className="hackathon-role">{hack.role}</div>
                <p>{hack.description}</p>
                {hack.certificate && hack.certificate !== "#" && (
                  <a href={hack.certificate} target="_blank" rel="noopener noreferrer" className="hack-cert-link">
                    View Certificate <span>+</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        <section id="experience" className="section resume-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">{data.resume.header.kicker}</p>
              <h2>{data.resume.header.title}</h2>
            </div>
            <div className="resume-actions">
              <a href={data.resume.header.cvLink} download className="download-cv">Download CV</a>
              <a href={data.resume.header.viewLink} target="_blank" rel="noopener noreferrer" className="view-resume">View Online</a>
            </div>
          </div>

          <div className="resume-grid">
            <div className="resume-column">
              <h3 className="column-title">Experience</h3>
              <div className="timeline">
                {data.resume.experience.map((exp) => (
                  <div key={`${exp.role}-${exp.year}`} className="timeline-item">
                    <span className="timeline-year">{exp.year}</span>
                    <h4>{exp.role}</h4>
                    <div className="timeline-org">{exp.company}</div>
                    <p className="timeline-desc">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="resume-column">
              <h3 className="column-title">Education</h3>
              <div className="timeline">
                {data.resume.education.map((edu) => (
                  <div key={`${edu.degree}-${edu.year}`} className="timeline-item">
                    <div className="timeline-header">
                      <span className="timeline-year">{edu.year}</span>
                      <span className="timeline-marks">{edu.marks}</span>
                    </div>
                    <h4>{edu.degree}</h4>
                    <div className="timeline-org">{edu.institution}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section reveal-on-scroll visible">
          <div className="section-heading">
            <div>
              <p className="section-kicker">{data.processHeader.kicker}</p>
              <h2>{data.processHeader.title}</h2>
            </div>
          </div>

          <div className="process-grid">
            {data.process.map((step, index) => (
              <div key={step.title} className="process-item">
                <span>0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="section contact-section">
          <div className="contact-grid">
            <div className="contact-info">
              <p className="section-kicker">Let's Connect</p>
              <h2>Have a project in mind?</h2>
              <p className="contact-description">
                Currently available for freelance work and new opportunities. Drop a message and let's build something great together.
              </p>

              <div className="contact-methods">
                <a className="contact-method-item" href={`https://wa.me/${data.footer.whatsapp?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                  <span className="method-label">WhatsApp</span>
                  <span className="method-value">{data.footer.whatsapp}</span>
                </a>
                <a className="contact-method-item" href={`googlegmail:///co?to=${data.footer.email}`} onClick={(e) => {
                  e.preventDefault();
                  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${data.footer.email}`;
                  const iosGmail = `googlegmail:///co?to=${data.footer.email}`;
                  
                  // Try to open Gmail app on iOS/Android, fallback to web
                  window.location.href = iosGmail;
                  setTimeout(() => {
                    window.open(gmailUrl, '_blank');
                  }, 500);
                }}>
                  <span className="method-label">Email</span>
                  <span className="method-value">{data.footer.email}</span>
                </a>
              </div>
            </div>

            <form className="contact-form" onSubmit={handleContactSubmit}>
              <div className="form-group">
                <input type="text" name="name" placeholder="Your Name" required />
              </div>
              <div className="form-group">
                <input type="email" name="email" placeholder="Your Email" required />
              </div>
              <div className="form-group">
                <input type="text" name="subject" placeholder="Subject" required />
              </div>
              <div className="form-group">
                <textarea name="message" placeholder="Your Message" rows="5" required></textarea>
              </div>
              <button type="submit" className="button primary">Send Message</button>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div>
          <p className="section-kicker">{data.footer.kicker}</p>
          <h2>{data.footer.title}</h2>
        </div>
        <div className="footer-actions">
          <div className="social-links">
            {data.footer.socials.map((social) => (
              <a key={social.label} href={social.link} target="_blank" rel="noopener noreferrer">{social.label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
