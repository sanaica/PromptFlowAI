import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import NewDocumentModal from '../components/NewDocumentModal';
import './DashboardHome.css';

// ─── Open Projects Modal ──────────────────────────────────────────────────────
function OpenProjectsModal({ projects, loading, onClose, onOpen, formatDate }) {
  return (
    <motion.div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        style={{
          background: 'rgba(20,20,35,0.95)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '560px',
          maxHeight: '70vh', display: 'flex', flexDirection: 'column', gap: '1.2rem'
        }}
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'white' }}>Open Project</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1.4rem', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {loading && (
            <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '2rem 0' }}>Loading projects...</p>
          )}
          {!loading && projects.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '2rem 0' }}>
              No projects found. Create one with "New file".
            </p>
          )}
          {!loading && projects.map((project) => (
            <motion.div
              key={project.id}
              onClick={() => onOpen(project)}
              whileHover={{ background: 'rgba(255,255,255,0.07)' }}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.9rem 1rem', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer', transition: 'background 0.15s'
              }}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(123,44,191,0.3), rgba(67,97,238,0.3))',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="1.5">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: 'white', fontSize: '0.95rem', fontWeight: 500, marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {project.title}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>{formatDate(project.created_at)}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Recent Projects on Home Tab ─────────────────────────────────────────────
function RecentProjectsSection({ viewMode, onOpen, formatDate }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const colors = ['#ff0055', '#00ffee', '#7B2CBF', '#4361EE', '#38b000', '#ff6b35'];

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(12);
      setProjects(data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '2rem' }}>Loading projects...</p>;
  }

  if (projects.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem', color: 'rgba(255,255,255,0.3)' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
        <p>No projects yet. Click <strong>New file</strong> to get started.</p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <motion.div className="recent-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {projects.map((project, index) => {
          const color = colors[index % colors.length];
          return (
            <motion.div
              className="recent-card"
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5, boxShadow: `0 10px 20px -10px ${color}40`, borderColor: `${color}80` }}
              onClick={() => onOpen(project)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-thumbnail-container">
                <motion.div
                  className="card-thumbnail"
                  style={{ background: `linear-gradient(135deg, ${color}20, ${color}40)` }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </motion.div>
              </div>
              <div className="card-info">
                <h3 className="card-title">{project.title}</h3>
                <p className="card-time">{formatDate(project.created_at)}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    );
  }

  return (
    <motion.div className="recent-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="list-header">
        <span className="list-col-name">Name</span>
        <span className="list-col-time">Created</span>
      </div>
      {projects.map((project, index) => {
        const color = colors[index % colors.length];
        return (
          <motion.div
            className="list-row"
            key={project.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            onClick={() => onOpen(project)}
            style={{ cursor: 'pointer' }}
          >
            <div className="list-col-name">
              <div className="list-icon" style={{ color }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
              <span>{project.title}</span>
            </div>
            <span className="list-col-time">{formatDate(project.created_at)}</span>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function DashboardHome() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [profileOpen, setProfileOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [openProjects, setOpenProjects] = useState([]);
  const [loadingOpen, setLoadingOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '', lastName: '', email: '', company: ''
  });
  const navigate = useNavigate();

  const formatDate = (iso) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      const nameParts = (user.user_metadata?.full_name || '').split(' ');
      setProfileForm({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        company: user.user_metadata?.company || ''
      });
    };
    loadProfile();
  }, []);

  // "New file" — inserts a row into projects, then navigates to workspace

  const handleCreateDocument = async (presetData) => {
    setCreatingProject(true);

    try {
      // 1. Get the current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        navigate('/login');
        return;
      }

      // 2. Insert the new project linked to this user
      // We use the title from the modal, or a default if empty
      const projectTitle = presetData?.title?.trim() || 'Untitled Project';

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title: projectTitle
        })
        .select()
        .single();

      if (error) throw error;

      // 3. Success! Close modal and navigate to the editor
      setIsModalOpen(false);

      // When creating

      if (data) {
        navigate('/workspace', { state: { project: data } });
      }



    } catch (error) {
      console.error('Error creating project:', error.message);
      alert('Failed to create project: ' + error.message);
    } finally {
      setCreatingProject(false);
    }
  };

  // "Open" — fetches all user projects and shows picker modal
  const handleOpenClick = async () => {
    setLoadingOpen(true);
    setIsOpenModalOpen(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/login'); return; }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) setOpenProjects(data || []);
    setLoadingOpen(false);
  };

  const handleOpenProject = async (project) => {
    setIsOpenModalOpen(false);

    // Fetch all iterations for this project, newest first
    const { data: iterations } = await supabase
      .from('iterations')
      .select('id, output_video_url, input_video_url, role, created_at')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false });

    // Prefer the latest assistant row (has output_video_url),
    // fall back to latest user row (has input_video_url)
    const assistantRow = iterations?.find((r) => r.role === 'assistant' && r.output_video_url);
    const userRow = iterations?.find((r) => r.role === 'user' && r.input_video_url);
    const best = assistantRow || userRow || null;

    navigate('/workspace', {
      state: {
        project,
        initialVideoUrl: best?.output_video_url || best?.input_video_url || null,
        iterationId: best?.id || null,
      },
    });
  };

  return (
    <div className="dashboard-wrapper">
      <div className="glass-background-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Top Menu Bar */}
      <div className="dashboard-top-menu">
        <div className="menu-logo">
          <span className="amu-logo" style={{ fontSize: '1.2rem' }}>
            PromptFlow<span style={{ color: 'var(--accent-purple)' }}>.</span>
          </span>
        </div>
        <div className="menu-items"></div>
        <div className="menu-actions" style={{ position: 'relative' }}>
          <div className="profile-icon" onClick={() => setProfileOpen(!profileOpen)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                className="profile-dropdown"
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{ transformOrigin: 'top right' }}
              >
                <div className="dropdown-item" onClick={() => { setProfileOpen(false); setActiveTab('Account'); }}>
                  Account Settings
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item text-danger" onClick={async () => {
                  await supabase.auth.signOut();
                  navigate('/login');
                }}>Logout</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <div className="sidebar-actions">
            <motion.button
              className="primary-glass-btn"
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              disabled={creatingProject}
            >
              {creatingProject ? 'Creating...' : 'New file'}
            </motion.button>
            <motion.button
              className="secondary-glass-btn"
              onClick={handleOpenClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              Open
            </motion.button>
          </div>

          <nav className="sidebar-nav">
            {[
              { tab: 'Home', icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></> },
              { tab: 'Account', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></> },
              { tab: 'Subscription', icon: <><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></> },
            ].map(({ tab, icon }) => (
              <motion.div
                key={tab}
                className={`nav-item ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {icon}
                </svg>
                {tab}
              </motion.div>
            ))}
          </nav>
        </div>

        {/* Main Area */}
        <div className="dashboard-main" data-lenis-prevent>
          <AnimatePresence mode="wait">

            {activeTab === 'Home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="tab-content-wrapper"
              >
                <h1 className="welcome-text">Welcome to PromptFlow AI</h1>
                <div className="recent-section">
                  <div className="recent-header">
                    <h2>Recent Projects</h2>
                    <div className="recent-filters">
                      <div className="view-toggles">
                        <div className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line>
                            <line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>
                          </svg>
                        </div>
                        <div className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <RecentProjectsSection viewMode={viewMode} onOpen={handleOpenProject} formatDate={formatDate} />
                </div>
              </motion.div>
            )}

            {activeTab === 'Account' && (
              <motion.div
                key="account"
                className="account-section tab-content-wrapper"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <h1 className="welcome-text" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>Account Information</h1>
                <div className="account-card" style={{ display: 'block' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                      <div className="account-avatar-large">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'white' }}>Profile Detail</h2>
                        <p style={{ color: 'var(--ref-text-secondary)', fontSize: '0.9rem' }}>Update your photo and personal details.</p>
                        <button className="secondary-glass-btn" style={{ marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Change Photo</button>
                      </div>
                    </div>
                    {!isEditingProfile ? (
                      <button className="primary-glass-btn" onClick={() => setIsEditingProfile(true)}>Edit Profile</button>
                    ) : (
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="secondary-glass-btn" onClick={() => setIsEditingProfile(false)}>Cancel</button>
                        <button className="primary-glass-btn" onClick={() => setIsEditingProfile(false)}>Save Changes</button>
                      </div>
                    )}
                  </div>
                  <div className="form-grid">
                    {[
                      { key: 'firstName', label: 'First Name', type: 'text' },
                      { key: 'lastName', label: 'Last Name', type: 'text' },
                      { key: 'email', label: 'Email Address', type: 'email' },
                      { key: 'company', label: 'Company / Organization', type: 'text' },
                    ].map(({ key, label, type }) => (
                      <div className="form-group" key={key}>
                        <label>{label}</label>
                        <input
                          type={type}
                          value={profileForm[key]}
                          onChange={(e) => setProfileForm({ ...profileForm, [key]: e.target.value })}
                          disabled={!isEditingProfile}
                          className="account-input"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Subscription' && (
              <motion.div
                key="subscription"
                className="account-section tab-content-wrapper"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <h1 className="welcome-text" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>Subscription Plans</h1>
                <div className="account-card" style={{ display: 'block' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div>
                      <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '0.4rem' }}>Current Plan: PromptFlow Pro</h3>
                      <p style={{ color: 'var(--ref-text-secondary)', fontSize: '0.9rem' }}>Billed monthly. Next billing date: April 1, 2026.</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '1.5rem', color: 'white', fontWeight: 'bold' }}>$19.99<span style={{ fontSize: '0.9rem', color: 'var(--ref-text-secondary)', fontWeight: 'normal' }}> /mo</span></p>
                      <button className="secondary-glass-btn" style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Cancel Subscription</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* New Document Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <NewDocumentModal
            onClose={() => setIsModalOpen(false)}
            onCreate={handleCreateDocument}
          />
        )}
      </AnimatePresence>

      {/* Open Projects Modal */}
      <AnimatePresence>
        {isOpenModalOpen && (
          <OpenProjectsModal
            projects={openProjects}
            loading={loadingOpen}
            onClose={() => setIsOpenModalOpen(false)}
            onOpen={handleOpenProject}
            formatDate={formatDate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default DashboardHome;