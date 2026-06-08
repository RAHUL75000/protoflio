import React, { useState, useEffect } from 'react';
import './Admin.css';

const API_BASE_URL = "";
const ADMIN_TOKEN_KEY = 'rahul_admin_token';

function Admin() {
  const [data, setData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [token, setToken] = useState(localStorage.getItem(ADMIN_TOKEN_KEY) || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/data`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        if (token) fetchMessages(token);
        setLoading(false);
      })
      .catch(err => console.error("Error fetching data", err));
  }, []);

  const fetchMessages = async (authToken) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages`, {
        headers: { 'X-Admin-Token': authToken }
      });
      if (res.ok) {
        const msgs = await res.json();
        setMessages(msgs);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    fetchMessages(token);
  };

  const deleteMessage = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': token }
      });
      if (res.ok) {
        setMessages(messages.filter(m => m.id !== id));
      }
    } catch (err) {
      setMessage("Failed to delete message");
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': token
        },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (res.ok) {
        setMessage('Updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else if (res.status === 401) {
        setMessage('Unauthorized! Token expired or invalid.');
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setTimeout(() => setIsAuthenticated(false), 2000);
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (err) {
      setMessage('Failed to update: ' + err.message);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setMessage('Uploading...');
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'X-Admin-Token': token
        },
        body: formData
      });
      const result = await res.json();
      if (res.ok) {
        if (type === 'cv') {
          updateNested('resume.header.cvLink', result.url);
          updateNested('resume.header.viewLink', result.url);
        }
        setMessage('File uploaded successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Upload failed: ' + result.error);
      }
    } catch (err) {
      setMessage('Upload error: ' + err.message);
    }
  };

  const updateNested = (path, value) => {
    const newData = { ...data };
    const parts = path.split('.');
    let current = newData;
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    setData(newData);
  };

  const handleArrayUpdate = (path, index, field, value) => {
    const newData = { ...data };
    const parts = path.split('.');
    let current = newData;
    for (let i = 0; i < parts.length; i++) {
      current = current[parts[i]];
    }
    if (field === null) {
      current[index] = value;
    } else {
      current[index][field] = value;
    }
    setData(newData);
  };

  const addToArray = (path, template) => {
    const newData = { ...data };
    const parts = path.split('.');
    let current = newData;
    for (let i = 0; i < parts.length; i++) {
      current = current[parts[i]];
    }
    current.push(template);
    setData(newData);
  };

  const removeFromArray = (path, index) => {
    const newData = { ...data };
    const parts = path.split('.');
    let current = newData;
    for (let i = 0; i < parts.length; i++) {
      current = current[parts[i]];
    }
    current.splice(index, 1);
    setData(newData);
  };

  const [selectedProject, setSelectedProject] = useState(null);
  const [editingIndex, setEditingIndex] = useState(-1);

  const openProjectEditor = (project, index) => {
    setSelectedProject({ ...project });
    setEditingIndex(index);
  };

  const saveProjectEdit = () => {
    const newData = { ...data };
    if (editingIndex === -1) {
      newData.projects.push(selectedProject);
    } else {
      newData.projects[editingIndex] = selectedProject;
    }
    setData(newData);
    setSelectedProject(null);
    setEditingIndex(-1);
  };

  const updateEditingProject = (field, value) => {
    setSelectedProject(prev => ({ ...prev, [field]: value }));
  };

  if (!isAuthenticated && !localStorage.getItem(ADMIN_TOKEN_KEY)) {
    return (
      <div className="admin-login">
        <form onSubmit={handleLogin}>
          <h1>Admin Access</h1>
          <input 
            type="password" 
            placeholder="Enter Admin Token" 
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  if (loading || !data) return <div className="admin-loading">Loading configuration...</div>;

  return (
    <div className="admin-container">
      {selectedProject && (
        <div className="admin-modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingIndex === -1 ? 'Add New Project' : 'Edit Project'}</h2>
            <div className="admin-modal-grid">
              <div className="admin-field">
                <label>Project Title</label>
                <input 
                  value={selectedProject.title} 
                  onChange={e => updateEditingProject('title', e.target.value)} 
                />
              </div>
              <div className="admin-field">
                <label>Accent (e.g. Case Study)</label>
                <input 
                  value={selectedProject.accent} 
                  onChange={e => updateEditingProject('accent', e.target.value)} 
                />
              </div>
              <div className="admin-field full-width">
                <label>Short Description (Card)</label>
                <textarea 
                  value={selectedProject.description} 
                  onChange={e => updateEditingProject('description', e.target.value)} 
                />
              </div>
              <div className="admin-field full-width">
                <label>Full Description (Modal)</label>
                <textarea 
                  className="tall"
                  value={selectedProject.fullDescription} 
                  onChange={e => updateEditingProject('fullDescription', e.target.value)} 
                />
              </div>
              <div className="admin-field">
                <label>External Link</label>
                <input 
                  value={selectedProject.link} 
                  onChange={e => updateEditingProject('link', e.target.value)} 
                />
              </div>
              <div className="admin-field">
                <label>Technologies (comma separated)</label>
                <input 
                  value={selectedProject.tech.join(', ')} 
                  onChange={e => updateEditingProject('tech', e.target.value.split(',').map(s => s.trim()))} 
                />
              </div>
            </div>
            <div className="admin-modal-actions">
              <button className="btn-cancel" onClick={() => setSelectedProject(null)}>Cancel</button>
              <button className="btn-save" onClick={saveProjectEdit}>Apply Changes</button>
            </div>
          </div>
        </div>
      )}

      <header className="admin-header">
        <h1>Portfolio CMS</h1>
        <div className="admin-actions">
          {message && <span className="admin-msg">{message}</span>}
          <button className="btn-save" onClick={handleUpdate}>Save Changes</button>
          <button className="btn-logout" onClick={() => { localStorage.removeItem(ADMIN_TOKEN_KEY); window.location.reload(); }}>Logout</button>
        </div>
      </header>

      <div className="admin-grid">
        {/* Messages / Inquiries */}
        <section className="admin-section full-width messages-section">
          <div className="section-header-flex">
            <h2>Inquiries <span className="count-badge">{messages.length}</span></h2>
            {messages.length > 0 && <button className="btn-inline-remove" onClick={() => setMessages([])}>Clear All</button>}
          </div>
          {messages.length === 0 ? (
            <p className="no-data">No messages received yet.</p>
          ) : (
            <div className="messages-list">
              {messages.map((msg) => (
                <div key={msg.id} className="message-card">
                  <div className="message-header">
                    <div className="sender-info">
                      <strong>{msg.name}</strong>
                      <span>{msg.email}</span>
                    </div>
                    <span className="message-date">{msg.date}</span>
                  </div>
                  <div className="message-subject">{msg.subject}</div>
                  <div className="message-body">{msg.message}</div>
                  <button className="btn-msg-delete" onClick={() => deleteMessage(msg.id)}>Delete Message</button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* General Settings */}
        <section className="admin-section">
          <h2>General Settings</h2>
          <label>Website Logo Name</label>
          <input value={data.general.logo} onChange={e => updateNested('general.logo', e.target.value)} />
          <label>Intro Loading Text</label>
          <input value={data.general.intro} onChange={e => updateNested('general.intro', e.target.value)} />
        </section>

        {/* Hero Section */}
        <section className="admin-section">
          <h2>Hero Section</h2>
          <label>Eyebrow</label>
          <input value={data.hero.eyebrow} onChange={e => updateNested('hero.eyebrow', e.target.value)} />
          <label>Title</label>
          <textarea value={data.hero.title} onChange={e => updateNested('hero.title', e.target.value)} />
          <label>Copy</label>
          <textarea value={data.hero.copy} onChange={e => updateNested('hero.copy', e.target.value)} />
          <div className="flex-row">
            <div>
              <label>Primary Button</label>
              <input value={data.hero.primaryBtn} onChange={e => updateNested('hero.primaryBtn', e.target.value)} />
            </div>
            <div>
              <label>Secondary Button</label>
              <input value={data.hero.secondaryBtn} onChange={e => updateNested('hero.secondaryBtn', e.target.value)} />
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="admin-section">
          <h2>About Section</h2>
          <label>Kicker</label>
          <input value={data.about.kicker} onChange={e => updateNested('about.kicker', e.target.value)} />
          <label>Title</label>
          <input value={data.about.title} onChange={e => updateNested('about.title', e.target.value)} />
          <label>Copy</label>
          <textarea value={data.about.copy} onChange={e => updateNested('about.copy', e.target.value)} />
          
          <h3>Expertise List</h3>
          {data.about.expertise.map((item, i) => (
            <div key={i} className="array-item">
              <input value={item} onChange={e => handleArrayUpdate('about.expertise', i, null, e.target.value)} />
              <button onClick={() => removeFromArray('about.expertise', i)}>×</button>
            </div>
          ))}
          <button className="btn-add" onClick={() => addToArray('about.expertise', 'New Skill')}>+ Add Skill</button>
        </section>

        {/* Metrics */}
        <section className="admin-section">
          <h2>Metrics</h2>
          {data.metrics.map((m, i) => (
            <div key={i} className="array-item-complex">
              <input placeholder="Value (e.g. 12+)" value={m.value} onChange={e => handleArrayUpdate('metrics', i, 'value', e.target.value)} />
              <input placeholder="Label" value={m.label} onChange={e => handleArrayUpdate('metrics', i, 'label', e.target.value)} />
              <button onClick={() => removeFromArray('metrics', i)}>Remove</button>
            </div>
          ))}
          <button className="btn-add" onClick={() => addToArray('metrics', { value: '0', label: 'New Metric' })}>+ Add Metric</button>
        </section>

        {/* Projects Header */}
        <section className="admin-section">
          <h2>Projects Section Header</h2>
          <label>Kicker</label>
          <input value={data.projectsHeader.kicker} onChange={e => updateNested('projectsHeader.kicker', e.target.value)} />
          <label>Title</label>
          <textarea value={data.projectsHeader.title} onChange={e => updateNested('projectsHeader.title', e.target.value)} />
        </section>

        {/* Projects List */}
        <section className="admin-section full-width">
          <div className="section-header-flex">
            <h2>Projects List</h2>
            <button className="btn-add-top" onClick={() => openProjectEditor({ id: Date.now(), title: 'New Project', description: '', fullDescription: '', tech: [], link: '#', accent: 'Web App' }, -1)}>+ Add Project</button>
          </div>
          <div className="admin-projects-grid">
            {data.projects.map((p, i) => (
              <div key={i} className="project-preview-card" onClick={() => openProjectEditor(p, i)}>
                <div className="preview-card-header">
                  <span className="p-accent">{p.accent}</span>
                  <button className="btn-inline-remove" onClick={(e) => { e.stopPropagation(); removeFromArray('projects', i); }}>×</button>
                </div>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <div className="p-tech-preview">
                  {p.tech.slice(0, 3).map(t => <span key={t}>{t}</span>)}
                  {p.tech.length > 3 && <span>+{p.tech.length - 3}</span>}
                </div>
                <div className="preview-card-footer">
                  <span>Click to Edit Details</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Hackathons Section */}
        <section className="admin-section full-width">
          <h2>Hackathons Section</h2>
          <div className="admin-grid">
            <div>
              <label>Kicker</label>
              <input value={data.hackathonHeader.kicker} onChange={e => updateNested('hackathonHeader.kicker', e.target.value)} />
              <label>Title</label>
              <input value={data.hackathonHeader.title} onChange={e => updateNested('hackathonHeader.title', e.target.value)} />
            </div>
          </div>
          <div className="hackathon-admin-list">
            {data.hackathons.map((h, i) => (
              <div key={i} className="array-item-complex">
                <div className="flex-row">
                  <input placeholder="Year" value={h.year} onChange={e => handleArrayUpdate('hackathons', i, 'year', e.target.value)} />
                  <input placeholder="Achievement (e.g. Winner)" value={h.achievement} onChange={e => handleArrayUpdate('hackathons', i, 'achievement', e.target.value)} />
                </div>
                <input placeholder="Title" value={h.title} onChange={e => handleArrayUpdate('hackathons', i, 'title', e.target.value)} />
                <input placeholder="Role" value={h.role} onChange={e => handleArrayUpdate('hackathons', i, 'role', e.target.value)} />
                <textarea placeholder="Description" value={h.description} onChange={e => handleArrayUpdate('hackathons', i, 'description', e.target.value)} />
                <input placeholder="Certificate URL (# to hide)" value={h.certificate || ''} onChange={e => handleArrayUpdate('hackathons', i, 'certificate', e.target.value)} />
                <button onClick={() => removeFromArray('hackathons', i)}>Remove Hackathon</button>
              </div>
            ))}
            <button className="btn-add" onClick={() => addToArray('hackathons', { title: 'New Hackathon', year: '2024', role: 'Developer', description: '', achievement: 'Participant', certificate: '#' })}>+ Add Hackathon</button>
          </div>
        </section>

        {/* Resume Section */}
        <section className="admin-section full-width">
          <h2>Resume Section</h2>
          <div className="admin-grid">
            <div>
              <label>Kicker</label>
              <input value={data.resume?.header?.kicker || ''} onChange={e => updateNested('resume.header.kicker', e.target.value)} />
              <label>Title</label>
              <input value={data.resume?.header?.title || ''} onChange={e => updateNested('resume.header.title', e.target.value)} />
              <div className="flex-row">
                <div style={{ flex: 1 }}>
                  <label>CV Download Link</label>
                  <div className="upload-input-group">
                    <input value={data.resume?.header?.cvLink || ''} onChange={e => updateNested('resume.header.cvLink', e.target.value)} />
                    <label className="btn-upload-label">
                      Upload
                      <input type="file" style={{ display: 'none' }} onChange={e => handleFileUpload(e, 'cv')} accept=".pdf,.doc,.docx" />
                    </label>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label>View Resume Link</label>
                  <input value={data.resume?.header?.viewLink || ''} onChange={e => updateNested('resume.header.viewLink', e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div className="admin-grid">
            <div>
              <h3>Experience</h3>
              {data.resume?.experience?.map((exp, i) => (
                <div key={i} className="array-item-complex">
                  <input placeholder="Year" value={exp.year} onChange={e => handleArrayUpdate('resume.experience', i, 'year', e.target.value)} />
                  <input placeholder="Role" value={exp.role} onChange={e => handleArrayUpdate('resume.experience', i, 'role', e.target.value)} />
                  <input placeholder="Company" value={exp.company} onChange={e => handleArrayUpdate('resume.experience', i, 'company', e.target.value)} />
                  <textarea placeholder="Description" value={exp.description} onChange={e => handleArrayUpdate('resume.experience', i, 'description', e.target.value)} />
                  <button onClick={() => removeFromArray('resume.experience', i)}>Remove</button>
                </div>
              ))}
              <button className="btn-add" onClick={() => addToArray('resume.experience', { year: '', role: '', company: '', description: '' })}>+ Add Experience</button>
            </div>

            <div>
              <h3>Education</h3>
              {data.resume?.education?.map((edu, i) => (
                <div key={i} className="array-item-complex">
                  <div className="flex-row">
                    <input placeholder="Year" value={edu.year} onChange={e => handleArrayUpdate('resume.education', i, 'year', e.target.value)} />
                    <input placeholder="Marks/CGPA" value={edu.marks || ''} onChange={e => handleArrayUpdate('resume.education', i, 'marks', e.target.value)} />
                  </div>
                  <input placeholder="Degree" value={edu.degree} onChange={e => handleArrayUpdate('resume.education', i, 'degree', e.target.value)} />
                  <input placeholder="Institution" value={edu.institution} onChange={e => handleArrayUpdate('resume.education', i, 'institution', e.target.value)} />
                  <button onClick={() => removeFromArray('resume.education', i)}>Remove</button>
                </div>
              ))}
              <button className="btn-add" onClick={() => addToArray('resume.education', { year: '', marks: '', degree: '', institution: '' })}>+ Add Education</button>
            </div>
          </div>
        </section>

        {/* Process Header */}
        <section className="admin-section">
          <h2>Process Section Header</h2>
          <label>Kicker</label>
          <input value={data.processHeader.kicker} onChange={e => updateNested('processHeader.kicker', e.target.value)} />
          <label>Title</label>
          <textarea value={data.processHeader.title} onChange={e => updateNested('processHeader.title', e.target.value)} />
        </section>

        {/* Process Steps */}
        <section className="admin-section">
          <h2>Workflow Steps</h2>
          {data.process.map((s, i) => (
            <div key={i} className="array-item-complex">
              <input placeholder="Step Title" value={s.title} onChange={e => handleArrayUpdate('process', i, 'title', e.target.value)} />
              <textarea placeholder="Step Description" value={s.text} onChange={e => handleArrayUpdate('process', i, 'text', e.target.value)} />
              <button onClick={() => removeFromArray('process', i)}>Remove Step</button>
            </div>
          ))}
          <button className="btn-add" onClick={() => addToArray('process', { title: 'New Step', text: '' })}>+ Add Step</button>
        </section>

        {/* Footer */}
        <section className="admin-section">
          <h2>Footer & Socials</h2>
          <label>Footer Kicker</label>
          <input value={data.footer.kicker} onChange={e => updateNested('footer.kicker', e.target.value)} />
          <label>Footer Title</label>
          <textarea value={data.footer.title} onChange={e => updateNested('footer.title', e.target.value)} />
          <label>WhatsApp Number (with country code)</label>
          <input value={data.footer.whatsapp || ''} onChange={e => updateNested('footer.whatsapp', e.target.value)} />
          <label>Contact Email</label>
          <input value={data.footer.email} onChange={e => updateNested('footer.email', e.target.value)} />
          <h3>Social Links</h3>
          {data.footer.socials.map((s, i) => (
            <div key={i} className="array-item-complex">
              <input placeholder="Platform (e.g. GitHub)" value={s.label} onChange={e => handleArrayUpdate('footer.socials', i, 'label', e.target.value)} />
              <input placeholder="URL" value={s.link} onChange={e => handleArrayUpdate('footer.socials', i, 'link', e.target.value)} />
              <button onClick={() => removeFromArray('footer.socials', i)}>Remove</button>
            </div>
          ))}
          <button className="btn-add" onClick={() => addToArray('footer.socials', { label: 'New Link', link: '#' })}>+ Add Social</button>
        </section>
      </div>
    </div>
  );
}

export default Admin;
