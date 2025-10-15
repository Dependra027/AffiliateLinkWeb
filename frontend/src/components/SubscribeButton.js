import React, { useEffect, useState } from 'react';
import axios from 'axios';

function SubscribeButton({ plan = 'monthly', auto = false, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [started, setStarted] = useState(false);
  const [paymentWindow, setPaymentWindow] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

  const subscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      // Create subscription and get payment URL
      const response = await axios.post(
        '/payments/create-subscription',
        { plan },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data.short_url) {
        // Store subscription info for after payment
        localStorage.setItem('pendingSubscription', JSON.stringify({
          subscriptionId: response.data.subscriptionId,
          plan: plan,
          planName: response.data.planName
        }));
        
        // Open Razorpay in a new tab
        const newWindow = window.open(response.data.short_url, '_blank', 'width=800,height=600');
        setPaymentWindow(newWindow);
        
        // Start checking for payment completion
        startPaymentCheck(response.data.subscriptionId);
      } else {
        setError('No payment link received!');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      if (err.response?.status === 401) {
        setError('Please log in to subscribe');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to create subscription');
      }
    } finally {
      setLoading(false);
      setStarted(true);
    }
  };

  const startPaymentCheck = (subscriptionId) => {
    setCheckingPayment(true);
    
    const checkInterval = setInterval(async () => {
      try {
        // Check subscription status every 2 seconds
        const response = await axios.get(`/payments/subscriptions`);
        const subscriptions = response.data.subscriptions;
        const subscription = subscriptions.find(sub => sub.razorpay_subscription_id === subscriptionId);
        
        if (subscription && subscription.status === 'active') {
          clearInterval(checkInterval);
          setCheckingPayment(false);
          
          // Payment was successful, add credits
          await handlePaymentSuccess(subscriptionId);
          
          // Automatically close payment window
          if (paymentWindow && !paymentWindow.closed) {
            paymentWindow.close();
          }
          return;
        }
        
        // Check if payment window is closed manually (user might have completed payment)
        if (paymentWindow && paymentWindow.closed) {
          clearInterval(checkInterval);
          setCheckingPayment(false);
          
          // Try to add credits anyway (in case payment was successful)
          await handlePaymentSuccess(subscriptionId);
          return;
        }
        
      } catch (error) {
        console.error('Payment check error:', error);
      }
    }, 2000); // Check every 2 seconds for faster response
    
    // Stop checking after 5 minutes
    setTimeout(() => {
      clearInterval(checkInterval);
      setCheckingPayment(false);
      
      // Close payment window if still open after timeout
      if (paymentWindow && !paymentWindow.closed) {
        paymentWindow.close();
      }
    }, 300000); // 5 minutes timeout
  };

  const handlePaymentSuccess = async (subscriptionId) => {
    try {
      setLoading(true);
      
      // Add credits for the subscription
      const response = await axios.post('/payments/add-subscription-credits', {
        subscriptionId: subscriptionId
      });
      
      // Clear pending subscription
      localStorage.removeItem('pendingSubscription');
      
      // Show prominent success message
      const planName = response.data.subscription.planDetails?.name || plan;
      const creditsAdded = response.data.creditsAdded;
      
      // Create a more prominent success notification
      const successMessage = `
🎉 PAYMENT SUCCESSFUL! 🎉

✅ ${planName} Activated
💰 ${creditsAdded} Credits Added
💳 New Balance: ${response.data.totalCredits} Credits

You can now create links and use your credits!
      `;
      
      alert(successMessage);
      
      // Call success callback to refresh parent component
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Dispatch custom event to notify navbar of credit update
      window.dispatchEvent(new CustomEvent('creditsUpdated'));
      
      // Force a page refresh to ensure all data is updated
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Error handling payment success:', error);
      setError('Payment successful but failed to add credits. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auto && !started) {
      subscribe();
    }
    // eslint-disable-next-line
  }, [auto, plan]);

  // Cleanup payment window on component unmount
  useEffect(() => {
    return () => {
      if (paymentWindow && !paymentWindow.closed) {
        paymentWindow.close();
      }
    };
  }, [paymentWindow]);

  if (loading) return <div className="subscribe-loading">Creating subscription...</div>;
  if (checkingPayment) return (
    <div className="subscribe-loading">
      <div>🔄 Processing payment...</div>
      <div style={{ fontSize: '12px', marginTop: '4px', color: '#666' }}>
        Please complete payment in the new tab. This window will update automatically.
      </div>
      <button 
        onClick={() => {
          const pending = localStorage.getItem('pendingSubscription');
          if (pending) {
            const { subscriptionId } = JSON.parse(pending);
            handlePaymentSuccess(subscriptionId);
          }
        }}
        className="manual-refresh-btn"
        style={{ marginTop: '8px', padding: '4px 8px', fontSize: '12px' }}
      >
        Refresh Status
      </button>
    </div>
  );
  if (error) return <div className="subscribe-error">Error: {error}</div>;
  if (auto) return null;

  const getButtonText = () => {
    if (loading) return 'Creating...';
    if (checkingPayment) return 'Payment in Progress...';
    return plan === 'monthly' ? 'Start Monthly Plan' : 'Start Yearly Plan';
  };

  return (
    <button 
      onClick={subscribe} 
      disabled={loading || checkingPayment}
      className="subscribe-btn"
    >
      {getButtonText()}
    </button>
  );
}

export default SubscribeButton; 