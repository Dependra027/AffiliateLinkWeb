import React from 'react';

function OnboardingModal({ open, onStart, onSkip }) {
  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
    }}>
      <div style={{
        width: 'min(520px, 92vw)', background: '#181c24', color: '#fff',
        borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.35)', padding: '24px'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Welcome to TrackLytics</h2>
        <p style={{ marginTop: 0, color: '#e0e0e0' }}>
          Take a quick 30-second tour to learn how to add links, organize with tags,
          and view stats. You can skip and do it later anytime.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
          <button onClick={onSkip} style={{
            background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
            padding: '10px 16px', borderRadius: 8, cursor: 'pointer'
          }}>Skip for now</button>
          <button onClick={onStart} style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none',
            padding: '10px 16px', borderRadius: 8, cursor: 'pointer'
          }}>Start quick tour</button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingModal;



