import { useEffect, useState } from 'react'
import heroImage from './assets/hero.png'
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

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

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

  if (showIntro) {
    return (
      <div className="intro-screen">
        <div className="intro-content">
          <h1 className="intro-logo">{data?.general?.logo || 'RAHUL'}</h1>
          <div className="intro-loader">
            <div className="loader-bar"></div>
          </div>
          <p className="intro-text">{data?.general?.intro || 'Designing Digital Experiences...'}</p>
        </div>
      </div>
    )
  }

  if (loading || !data) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    )
  }

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMenuOpen(false)
    }
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

  return (
    <div className={`app ${theme}-theme`}>
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo" onClick={() => scrollToSection('hero')}>{data.general.logo}</div>
          
          <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <button onClick={() => scrollToSection('about')}>About</button>
            <button onClick={() => scrollToSection('projects')}>Projects</button>
            <button onClick={() => scrollToSection('experience')}>Experience</button>
            <button onClick={() => scrollToSection('contact')}>Contact</button>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>

          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}></div>
          </button>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section id="hero" className="hero">
          <div className="hero-content">
            <span className="eyebrow">{data.hero.eyebrow}</span>
            <h1 className="title">{data.hero.title}</h1>
            <p className="copy">{data.hero.copy}</p>
            <div className="hero-btns">
              <button className="btn-primary" onClick={() => scrollToSection('projects')}>{data.hero.primaryBtn}</button>
              <button className="btn-secondary" onClick={() => scrollToSection('contact')}>{data.hero.secondaryBtn}</button>
            </div>
          </div>
          <div className="hero-image">
            <div className="image-wrapper">
              <img src={heroImage} alt="Rahul Kumar" />
              <div className="image-bg-blob"></div>
            </div>
          </div>
        </section>

        {/* Metrics Bar */}
        <div className="metrics-bar">
          {data.metrics.map((metric, index) => (
            <div key={index} className="metric-item">
              <h3>{metric.value}</h3>
              <p>{metric.label}</p>
            </div>
          ))}
        </div>

        {/* About Section */}
        <section id="about" className="about">
          <div className="section-header">
            <span className="kicker">{data.about.kicker}</span>
            <h2 className="section-title">{data.about.title}</h2>
          </div>
          <div className="about-grid">
            <div className="about-text">
              <p>{data.about.copy}</p>
              <div className="expertise-list">
                {data.about.expertise.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="projects">
          <div className="section-header centered">
            <span className="kicker">{data.projectsHeader.kicker}</span>
            <h2 className="section-title">{data.projectsHeader.title}</h2>
          </div>
          <div className="projects-grid">
            {data.projects.map((project, index) => (
              <div key={index} className="project-card" onClick={() => setSelectedProject(project)}>
                <div className="project-info">
                  <span className="project-accent">{project.accent}</span>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="project-tech">
                    {project.tech.map((t, i) => <span key={i}>{t}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Project Modal */}
        {selectedProject && (
          <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedProject(null)}>&times;</button>
              <div className="modal-header">
                <span className="project-accent">{selectedProject.accent}</span>
                <h2>{selectedProject.title}</h2>
              </div>
              <div className="modal-body">
                <p className="full-desc">{selectedProject.fullDescription}</p>
                <div className="modal-tech">
                  <h4>Technologies Used</h4>
                  <div className="tech-tags">
                    {selectedProject.tech.map((t, i) => <span key={i}>{t}</span>)}
                  </div>
                </div>
                {selectedProject.link !== "#" && (
                  <a href={selectedProject.link} target="_blank" rel="noopener noreferrer" className="project-link-btn">
                    View Project <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hackathons Section */}
        <section className="hackathons">
          <div className="section-header">
            <span className="kicker">{data.hackathonHeader.kicker}</span>
            <h2 className="section-title">{data.hackathonHeader.title}</h2>
          </div>
          <div className="hackathon-timeline">
            {data.hackathons.map((hack, index) => (
              <div key={index} className="hack-item">
                <div className="hack-year">{hack.year}</div>
                <div className="hack-content">
                  <div className="hack-header">
                    <h3>{hack.title}</h3>
                    <span className="achievement">{hack.achievement}</span>
                  </div>
                  <p className="role">{hack.role}</p>
                  <p className="desc">{hack.description}</p>
                  {hack.certificate && hack.certificate !== "#" && (
                    <a href={hack.certificate} target="_blank" rel="noopener noreferrer" className="cert-link">View Certificate</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Resume Section */}
        <section id="experience" className="resume">
          <div className="resume-container">
            <div className="resume-header">
              <div className="header-text">
                <span className="kicker">{data.resume.header.kicker}</span>
                <h2 className="section-title">{data.resume.header.title}</h2>
              </div>
              <div className="resume-actions">
                <a href={data.resume.header.cvLink} download className="btn-resume-primary">Download CV</a>
                <a href={data.resume.header.viewLink} target="_blank" rel="noopener noreferrer" className="btn-resume-secondary">View Online</a>
              </div>
            </div>

            <div className="resume-grid">
              <div className="resume-column">
                <h3 className="column-title">Experience</h3>
                <div className="experience-list">
                  {data.resume.experience.map((exp, index) => (
                    <div key={index} className="experience-item">
                      <span className="date">{exp.year}</span>
                      <h4>{exp.role}</h4>
                      <p className="company">{exp.company}</p>
                      <p className="desc">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="resume-column">
                <h3 className="column-title">Education</h3>
                <div className="education-list">
                  {data.resume.education.map((edu, index) => (
                    <div key={index} className="education-item">
                      <div className="edu-header">
                        <span className="date">{edu.year}</span>
                        <span className="marks">{edu.marks}</span>
                      </div>
                      <h4>{edu.degree}</h4>
                      <p className="institution">{edu.institution}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="process">
          <div className="section-header centered">
            <span className="kicker">{data.processHeader.kicker}</span>
            <h2 className="section-title">{data.processHeader.title}</h2>
          </div>
          <div className="process-grid">
            {data.process.map((step, index) => (
              <div key={index} className="process-card">
                <div className="process-number">0{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="contact">
          <div className="contact-container">
            <div className="contact-info">
              <span className="kicker">Let's Connect</span>
              <h2 className="section-title">Have a project in mind?</h2>
              <p className="contact-desc">Currently available for freelance work and new opportunities. Drop a message and let's build something great together.</p>
              
              <div className="contact-methods">
                <a className="contact-method-item" href={`https://wa.me/${data.footer.whatsapp?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                  <div className="method-icon">WP</div>
                  <span>WhatsApp</span>
                </a>
                <a className="contact-method-item" href={`https://mail.google.com/mail/?view=cm&fs=1&to=${data.footer.email}`} target="_blank" rel="noopener noreferrer">
                  <div className="method-icon">EM</div>
                  <span>Email Me</span>
                </a>
              </div>
            </div>

            <div className="contact-form-wrapper">
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
                <button type="submit" className="btn-submit">Send Message</button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-brand">
              <h2 className="footer-logo">{data.general.logo}</h2>
              <p>{data.footer.kicker}</p>
            </div>
            <div className="footer-social">
              {data.footer.socials.map((social, index) => (
                <a key={index} href={social.link} target="_blank" rel="noopener noreferrer">{social.label}</a>
              ))}
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} {data.general.logo}. All rights reserved.</p>
            <p>Built with React & Passion</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
