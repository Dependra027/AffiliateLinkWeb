import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PaymentManager.css';
import SubscribeButton from './SubscribeButton';

const PaymentManager = ({ user, setUser }) => {
  const [packages, setPackages] = useState([]);
  const [userCredits, setUserCredits] = useState(0);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [error, setError] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPackages();
    fetchUserCredits();
    fetchUserSubscriptions();
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

  const fetchUserSubscriptions = async () => {
    try {
      console.log('Fetching user subscriptions...');
      const response = await axios.get('/payments/subscriptions');
      console.log('Subscriptions response:', response.data);
      setUserSubscriptions(response.data.subscriptions);
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      // Don't show error for subscriptions as it's not critical
    }
  };

  const addSubscriptionCredits = async (subscriptionId) => {
    try {
      setLoading(true);
      const response = await axios.post('/payments/add-subscription-credits', {
        subscriptionId: subscriptionId
      });
      
      console.log('Credits added:', response.data);
      
      // Refresh user credits and subscriptions
      await fetchUserCredits();
      await fetchUserSubscriptions();
      
      // Dispatch custom event to notify navbar of credit update
      window.dispatchEvent(new CustomEvent('creditsUpdated'));
      
      alert(`Successfully added ${response.data.creditsAdded} credits! Your new balance is ${response.data.totalCredits} credits.`);
    } catch (error) {
      console.error('Error adding subscription credits:', error);
      setError('Failed to add credits: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionSuccess = async (successData) => {
    // Set success data and show success message
    setSuccessData(successData);
    setShowSuccess(true);
    
    // Refresh all data after successful subscription
    await fetchUserCredits();
    await fetchUserSubscriptions();
    
    // Update user object with new credits
    setUser(prev => ({
      ...prev,
      credits: successData.totalCredits
    }));
    
    // Dispatch custom event to notify navbar of credit update
    window.dispatchEvent(new CustomEvent('creditsUpdated'));
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessData(null);
    }, 5000);
  };

  const refreshData = async () => {
    await fetchUserCredits();
    await fetchUserSubscriptions();
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
        <div className="header-right">
          <button onClick={refreshData} className="refresh-btn" disabled={loading}>
            🔄 Refresh
          </button>
          <div className="credit-balance">
            <span className="balance-label">Current Balance:</span>
            <span className="balance-amount">{userCredits} Credits</span>
          </div>
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

      {showSuccess && successData && (
        <div className="success-message">
          Success! {successData.creditsAdded} credits added to your account. Your new balance is {successData.totalCredits} credits.
          <button onClick={() => setShowSuccess(false)} className="close-success">×</button>
        </div>
      )}

      <div className="payment-sections">
        {/* Credit Packages */}
        <div className="packages-section">
          <h3>Purchase Credits</h3>
          <div className="packages-grid">
            {packages.map((pkg) => (
              <div key={pkg.id} className="package-card">
                <div className="package-header">
                  <h4>{pkg.credits} Credits</h4>
                  <div className="package-price">{pkg.price}</div>
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
          
          {/* Security and Trust Indicators */}
          <div className="security-badges">
            <div className="security-badge ssl-badge">SSL Secured</div>
            <div className="security-badge encrypted-badge">256-bit Encryption</div>
            <div className="security-badge">PCI Compliant</div>
          </div>
          
          <div className="payment-methods">
            <div className="payment-method">VISA</div>
            <div className="payment-method">MC</div>
            <div className="payment-method">AMEX</div>
            <div className="payment-method">UPI</div>
            <div className="payment-method">NET</div>
          </div>
        </div>

        {/* Subscription Section */}
        <div className="subscription-section">
          <h3>🔄 Premium Subscriptions</h3>
          
          {/* Current Subscription Status */}
          {userSubscriptions.length > 0 && (
            <div className="current-subscription">
              <h4>Your Current Subscriptions</h4>
              <div className="subscription-list">
                {userSubscriptions.map((sub, index) => (
                  <div key={index} className="subscription-item">
                    <div className="subscription-info">
                      <div className="subscription-name">{sub.planDetails?.name || sub.plan}</div>
                      <div className={`subscription-status status-${sub.status}`}>{sub.status}</div>
                    </div>
                    <div className="subscription-details">
                      <div className="subscription-date">
                        Started: {formatDate(sub.createdAt)}
                      </div>
                      {sub.start_date && (
                        <div className="subscription-date">
                          Active: {formatDate(sub.start_date)}
                        </div>
                      )}
                    </div>
                                         {sub.status === 'active' && (
                       <button
                         onClick={() => addSubscriptionCredits(sub.razorpay_subscription_id)}
                         disabled={loading}
                         className="add-credits-btn"
                       >
                         Add Credits
                       </button>
                     )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="subscription-grid">
            {/* Monthly Plan */}
            <div className="subscription-card">
              <div className="subscription-header">
                <h4>Monthly Plan</h4>
                <div className="subscription-price">
                  <span className="price-amount">₹50</span>
                  <span className="price-period">/month</span>
                </div>
                <div className="subscription-badge">Most Popular</div>
              </div>
              <div className="subscription-features">
                <ul>
                  <li>✅ 50 Credits per month</li>
                  <li>✅ Priority support</li>
                  <li>✅ Advanced analytics</li>
                  <li>✅ Custom branding</li>
                  <li>✅ Unlimited links</li>
                </ul>
              </div>
              <SubscribeButton plan="monthly" onSuccess={handleSubscriptionSuccess} />
            </div>

            {/* Yearly Plan */}
            <div className="subscription-card featured">
              <div className="subscription-header">
                <h4>Yearly Plan</h4>
                <div className="subscription-price">
                  <span className="price-amount">₹499</span>
                  <span className="price-period">/year</span>
                </div>
                <div className="subscription-badge">Save 17%</div>
              </div>
              <div className="subscription-features">
                <ul>
                  <li>✅ 600 Credits per year</li>
                  <li>✅ Priority support</li>
                  <li>✅ Advanced analytics</li>
                  <li>✅ Custom branding</li>
                  <li>✅ Unlimited links</li>
                  <li>✅ Early access to new features</li>
                </ul>
              </div>
              <SubscribeButton plan="yearly" onSuccess={handleSubscriptionSuccess} />
            </div>
          </div>
          <p className="subscription-note">Subscribe to unlock premium features and get more credits!</p>
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