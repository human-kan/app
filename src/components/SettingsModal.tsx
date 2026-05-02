import React, { useState } from 'react';
import { Settings, X, AlignLeft, Shield, DollarSign } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistantId: string;
  setAssistantId: (id: string) => void;
  avgClientValue: string;
  setAvgClientValue: (val: string) => void;
  isAssistantLocked?: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  assistantId,
  setAssistantId,
  avgClientValue,
  setAvgClientValue,
  isAssistantLocked = false,
}) => {
  const [tempId, setTempId] = useState(assistantId);
  const [tempValue, setTempValue] = useState(avgClientValue);

  if (!isOpen) return null;

  const handleSave = () => {
    setAssistantId(tempId);
    setAvgClientValue(tempValue);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
      <div className="glass-panel" style={{ width: '450px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.2s ease-out' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', margin: 0 }}>
            <Settings size={20} color="var(--accent-teal)" />
            Account Settings
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!isAssistantLocked && (
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <AlignLeft size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>
                Vapi Assistant ID
              </label>
              <input 
                type="text" 
                value={tempId}
                onChange={(e) => setTempId(e.target.value)}
                placeholder="e.g. 5f2b8a7c..." 
                style={{ width: '100%' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Enter the specific Assistant ID to load its call metrics.</p>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <DollarSign size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>
              Average Client Value ($)
            </label>
            <input 
              type="number" 
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder="e.g. 500" 
              style={{ width: '100%' }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Used to calculate estimated revenue captured.</p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={12}/> API Keys
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}><strong>Public:</strong> 8bc0bbc...<span style={{color: 'var(--text-muted)'}}>89435</span></p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}><strong>Private:</strong> 23fa9c4...<span style={{color: 'var(--text-muted)'}}>d51ee</span></p>
            <p style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', marginTop: '0.5rem' }}>Loaded from environment config.</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
          <button 
            onClick={onClose} 
            className="settings-btn"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            Save Configuration
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
