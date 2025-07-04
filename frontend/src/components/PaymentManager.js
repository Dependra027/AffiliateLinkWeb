import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PaymentManager.css';

const PaymentManager = ({ user, setUser }) => {
  const [packages, setPackages] = useState([]);
  const [userCredits, setUserCredits] = useState(0);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [error, setError] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPackages();
    fetchUserCredits();
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = () => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    // Load Razorpay script dynamically
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      setError('Failed to load payment gateway. Please refresh the page.');
    };
    document.body.appendChild(script);
  };

  const fetchPackages = async () => {
    try {
      console.log('Fetching packages...');
      const response = await axios.get('/payments/packages');
      console.log('Packages response:', response.data);
      setPackages(response.data.packages);
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError('Failed to load credit packages: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchUserCredits = async () => {
    try {
      console.log('Fetching user credits...');
      const response = await axios.get('/payments/credits');
      console.log('Credits response:', response.data);
      setUserCredits(response.data.credits);
      setPaymentHistory(response.data.payments);
    } catch (error) {
      console.error('Error fetching user credits:', error);
      setError('Failed to load user credits: ' + (error.response?.data?.message || error.message));
    }
  };

  const handlePurchase = async (pkg) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Creating order for package:', pkg);
      
      // Create order
      const orderResponse = await axios.post('/payments/create-order', {
        packageId: pkg.id
      });

      console.log('Order response:', orderResponse.data);

      const { orderId, amount, currency, key } = orderResponse.data;

      // Check if Razorpay is available
      if (!razorpayLoaded || typeof window.Razorpay === 'undefined') {
        console.error('Razorpay not loaded');
        setError('Payment gateway not loaded. Please refresh the page and try again.');
        return;
      }

      // Initialize Razorpay
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'Link Manager',
        description: `${pkg.credits} Credits Purchase`,
        order_id: orderId,
        handler: async function (response) {
          console.log('Payment successful:', response);
          try {
            // Verify payment
            const verifyResponse = await axios.post('/payments/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            console.log('Verification response:', verifyResponse.data);

            // Update user credits
            setUserCredits(verifyResponse.data.credits);
            
            // Update user object
            setUser(prev => ({
              ...prev,
              credits: verifyResponse.data.credits
            }));

            // Refresh payment history
            fetchUserCredits();

            alert(`Payment successful! ${pkg.credits} credits added to your account.`);
          } catch (error) {
            console.error('Payment verification error:', error);
            setError('Payment verification failed: ' + (error.response?.data?.message || error.message));
          }
        },
        prefill: {
          name: user.username,
          email: user.email
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            setLoading(false);
          }
        }
      };

      console.log('Opening Razorpay with options:', options);
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Purchase error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create payment order';
      setError('Purchase failed: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'pending': return 'orange';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="payment-manager">
      <div className="payment-header">
        <div className="header-left">
          <button onClick={handleGoBack} className="back-btn">
            ← Back to Dashboard
          </button>
          <h2>💰 Credit Management</h2>
        </div>
        <div className="credit-balance">
          <span className="balance-label">Current Balance:</span>
          <span className="balance-amount">{userCredits} Credits</span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="close-error">×</button>
        </div>
      )}

      {!razorpayLoaded && (
        <div className="warning-message">
          Loading payment gateway... Please wait.
        </div>
      )}

      <div className="payment-sections">
        {/* Credit Packages */}
        <div className="packages-section">
          <h3>💳 Purchase Credits</h3>
          <div className="packages-grid">
            {packages.map((pkg) => (
              <div key={pkg.id} className="package-card">
                <div className="package-header">
                  <h4>{pkg.credits} Credits</h4>
                  <div className="package-price">₹{pkg.price}</div>
                </div>
                <div className="package-description">
                  Get {pkg.credits} credits for ₹{pkg.price}
                </div>
                <button
                  onClick={() => handlePurchase(pkg)}
                  disabled={loading || !razorpayLoaded}
                  className="purchase-btn"
                >
                  {loading ? 'Processing...' : !razorpayLoaded ? 'Loading...' : 'Buy Now'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Payment History */}
        <div className="history-section">
          <h3>📋 Payment History</h3>
          {paymentHistory.length === 0 ? (
            <p className="no-history">No payment history yet.</p>
          ) : (
            <div className="payment-history">
              {paymentHistory.map((payment, index) => (
                <div key={index} className="payment-item">
                  <div className="payment-info">
                    <div className="payment-amount">
                      ₹{(payment.amount / 100).toFixed(2)}
                    </div>
                    <div className="payment-credits">
                      {payment.credits} Credits
                    </div>
                  </div>
                  <div className="payment-details">
                    <div className="payment-date">
                      {formatDate(payment.paymentDate)}
                    </div>
                    <div 
                      className={`payment-status status-${getStatusColor(payment.status)}`}
                    >
                      {payment.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentManager; 