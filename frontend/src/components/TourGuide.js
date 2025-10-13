import React, { useState, useEffect } from 'react';

const TourGuide = ({ steps, isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightStyle, setHighlightStyle] = useState({});
  const [tooltipStyle, setTooltipStyle] = useState({});

  useEffect(() => {
    if (!isOpen || !steps.length) return;
    
    const step = steps[currentStep];
    const element = document.querySelector(step.target);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightStyle({
        position: 'fixed',
        top: rect.top - 4,
        left: rect.left - 4,
        width: rect.width + 8,
        height: rect.height + 8,
        background: 'rgba(102, 126, 234, 0.2)',
        border: '2px solid #667eea',
        borderRadius: '8px',
        zIndex: 1999,
        pointerEvents: 'none'
      });
      
      // Position tooltip
      const tooltipWidth = 300;
      const tooltipHeight = 120;
      let top = rect.bottom + 10;
      let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
      
      // Adjust if tooltip goes off screen
      if (left < 10) left = 10;
      if (left + tooltipWidth > window.innerWidth - 10) {
        left = window.innerWidth - tooltipWidth - 10;
      }
      if (top + tooltipHeight > window.innerHeight - 10) {
        top = rect.top - tooltipHeight - 10;
      }
      
      setTooltipStyle({
        position: 'fixed',
        top,
        left,
        width: tooltipWidth,
        zIndex: 2000
      });
    }
  }, [currentStep, isOpen, steps]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    onClose();
  };

  if (!isOpen || !steps.length) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        zIndex: 1998
      }} />
      
      {/* Highlight */}
      <div style={highlightStyle} />
      
      {/* Tooltip */}
      <div style={tooltipStyle}>
        <div style={{
          background: '#181c24',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#ffe082' }}>{step.title}</h3>
            <span style={{ fontSize: '14px', color: '#aaa' }}>{currentStep + 1} of {steps.length}</span>
          </div>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.4', color: '#e0e0e0' }}>
            {step.content}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <div>
              {currentStep > 0 && (
                <button onClick={prevStep} style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '8px'
                }}>
                  Previous
                </button>
              )}
              <button onClick={skipTour} style={{
                background: 'transparent',
                color: '#aaa',
                border: 'none',
                padding: '6px 12px',
                cursor: 'pointer'
              }}>
                Skip Tour
              </button>
            </div>
            <button onClick={nextStep} style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              padding: '6px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TourGuide;