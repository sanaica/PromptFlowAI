import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './NewDocumentModal.css';

const TABS = ['Recent', 'Saved', 'Video', 'Audio', 'Image', 'Social Media', 'Templates'];

const PRESETS = {
  'Recent': [
    { id: '1080p', name: '1080p HD Video', width: 1920, height: 1080, type: 'video' },
    { id: '4k', name: '4K UHD Video', width: 3840, height: 2160, type: 'video' },
    { id: 'ig-reel', name: 'Instagram Reel', width: 1080, height: 1920, type: 'video' },
    { id: 'square', name: 'Square Post', width: 1080, height: 1080, type: 'image' },
  ],
  'Video': [
    { id: '4k', name: '4K UHD', width: 3840, height: 2160, type: 'video' },
    { id: '1080p', name: '1080p HD', width: 1920, height: 1080, type: 'video' },
    { id: '720p', name: '720p HD', width: 1280, height: 720, type: 'video' },
  ],
  // Other tabs can be empty arrays for now to prevent errors
  'Saved': [], 'Audio': [], 'Image': [], 'Social Media': [], 'Templates': []
};

function NewDocumentModal({ onClose, onCreate }) {
  const [activeTab, setActiveTab] = useState('Recent');
  const [selectedPreset, setSelectedPreset] = useState(PRESETS['Recent'][0]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [projectName, setProjectName] = useState('Untitled-Project-1');
  // Form State
  const [width, setWidth] = useState(selectedPreset.width);
  const [height, setHeight] = useState(selectedPreset.height);
  const [unit, setUnit] = useState('Pixels');
  const [resolution, setResolution] = useState(72);
  const [colorMode, setColorMode] = useState('RGB Color');
  const [background, setBackground] = useState('Black');

  // Handle Preset Selection
  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    setWidth(preset.width);
    setHeight(preset.height);
  };

  const handleCreate = () => {
    onCreate({
      title: projectName,
      width,
      height,
      unit,
      resolution,
      colorMode,
      background,
      preset: selectedPreset
    });
  };

  const currentPresets = PRESETS[activeTab] || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div 
        className="modal-container"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>New Document</h2>
          <button className="close-icon-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="modal-tabs">
          {TABS.map(tab => (
            <span 
              key={tab} 
              className={`tab-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </span>
          ))}
        </div>

        <div className="modal-content">
          {/* Left Pane - Presets Grid */}
          <div className="presets-pane">
            <h3 className="pane-title">YOUR {activeTab.toUpperCase()} ITEMS ({currentPresets.length})</h3>
            
            {currentPresets.length > 0 ? (
              <div className="presets-grid">
                {currentPresets.map((preset, idx) => (
                  <motion.div 
                    key={preset.id} 
                    className={`preset-card ${selectedPreset.id === preset.id ? 'active' : ''}`}
                    onClick={() => handlePresetSelect(preset)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="preset-icon">
                      {/* Dynamic Canvas Size Visualizer */}
                      <svg 
                        width="48" height="48" viewBox="0 0 48 48" 
                        fill="none" stroke="currentColor" strokeWidth="1.5"
                      >
                        {(() => {
                          const maxDim = 32;
                          const ratio = preset.width / preset.height;
                          let w, h;
                          if (ratio >= 1) {
                            w = maxDim;
                            h = maxDim / ratio;
                          } else {
                            h = maxDim;
                            w = maxDim * ratio;
                          }
                          const x = (48 - w) / 2;
                          const y = (48 - h) / 2;
                          return (
                            <rect 
                              x={x} y={y} width={w} height={h} rx="2" ry="2" 
                              className={selectedPreset.id === preset.id ? 'active-rect' : ''}
                            />
                          );
                        })()}
                        {/* Folded corner line for document feel */}
                        <path d={`M ${24 + (preset.width >= preset.height ? 16 : 16*(preset.width/preset.height))} ${24 - (preset.height >= preset.width ? 16 : 16*(preset.height/preset.width))} L ${24 + (preset.width >= preset.height ? 16 : 16*(preset.width/preset.height)) - 6} ${24 - (preset.height >= preset.width ? 16 : 16*(preset.height/preset.width))} L ${24 + (preset.width >= preset.height ? 16 : 16*(preset.width/preset.height)) - 6} ${24 - (preset.height >= preset.width ? 16 : 16*(preset.height/preset.width)) + 6}`} strokeOpacity="0.5" />
                      </svg>
                    </div>
                    <p className="preset-name">{preset.name}</p>
                    <p className="preset-dim">{preset.width} x {preset.height} px</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="no-presets">
                <p>No templates available in this category yet.</p>
              </div>
            )}
            
            <div className="preset-search">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
               <input type="text" placeholder="Find more templates online..." />
               <button className="search-btn">Go</button>
            </div>
          </div>

          {/* Right Pane - Preset Details */}
          <div className="details-pane">
            <h3 className="pane-title">PRESET DETAILS</h3>
            
            <div className="detail-group">
              <input
                type="text"
                className="preset-name-input"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            <div className="detail-row">
              <div className="detail-col">
                <label>Width</label>
                <div className="number-input">
                  <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} />
                </div>
              </div>
              <div className="detail-col dimension-unit">
                <label>&nbsp;</label>
                <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                  <option>Pixels</option>
                  <option>Inches</option>
                  <option>Centimeters</option>
                  <option>Millimeters</option>
                </select>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-col">
                <label>Height</label>
                <div className="number-input">
                  <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
                </div>
              </div>
              <div className="detail-col dimension-unit">
                 <label>Orientation</label>
                 <div className="orientation-toggles">
                    <button className={width <= height ? 'active' : ''} onClick={() => { if(width > height) { setWidth(height); setHeight(width); }}}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="3" width="12" height="18" rx="2" ry="2"></rect></svg>
                    </button>
                    <button className={width > height ? 'active' : ''} onClick={() => { if(width <= height) { setWidth(height); setHeight(width); }}}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="12" rx="2" ry="2"></rect></svg>
                    </button>
                 </div>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-col">
                <label>Resolution</label>
                <div className="number-input">
                  <input type="number" value={resolution} onChange={(e) => setResolution(e.target.value)} />
                </div>
              </div>
              <div className="detail-col dimension-unit">
                 <label>&nbsp;</label>
                 <select>
                    <option>Pixels/Inch</option>
                    <option>Pixels/Centimeter</option>
                 </select>
              </div>
            </div>

            <div className="detail-group mt-2">
              <label>Color Mode</label>
              <div className="select-row">
                 <select className="flex-2" value={colorMode} onChange={(e) => setColorMode(e.target.value)}>
                    <option>RGB Color</option>
                    <option>CMYK Color</option>
                    <option>Grayscale</option>
                 </select>
                 <select className="flex-1">
                    <option>8 bit</option>
                    <option>16 bit</option>
                    <option>32 bit</option>
                 </select>
              </div>
            </div>

            <div className="detail-group mt-2">
              <label>Background Contents</label>
              <div className="select-row">
                 <select className="flex-2" value={background} onChange={(e) => setBackground(e.target.value)}>
                    <option>Black</option>
                    <option>White</option>
                    <option>Transparent</option>
                    <option>Custom</option>
                 </select>
                 <div className="color-preview" style={{ background: background === 'Black' ? '#000' : background === 'White' ? '#fff' : 'transparent' }}></div>
              </div>
            </div>

            <div 
               className="advanced-options" 
               onClick={() => setShowAdvanced(!showAdvanced)}
            >
               <span>Advanced Options {showAdvanced ? '▴' : '▾'}</span>
            </div>
            
            <AnimatePresence>
              {showAdvanced && (
                <motion.div 
                  className="advanced-options-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="detail-group mt-2">
                    <label>Color Profile</label>
                    <div className="select-row">
                      <select className="flex-1" defaultValue="Working RGB">
                        <option>Don't Color Manage</option>
                        <option>Working RGB: sRGB IEC61966-2.1</option>
                        <option>ProPhoto RGB</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="detail-group mt-2">
                    <label>Pixel Aspect Ratio</label>
                    <div className="select-row">
                      <select className="flex-1" defaultValue="Square">
                        <option>Square Pixels</option>
                        <option>Anamorphic (2:1)</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Buttons are fixed at the bottom right */}
        <div className="modal-footer">
           <button className="secondary-glass-btn" onClick={onClose}>Close</button>
           <button className="primary-glass-btn" onClick={handleCreate}>Create</button>
        </div>
      </motion.div>
    </div>
  );
}

export default NewDocumentModal;
