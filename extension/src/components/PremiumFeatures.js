import React from 'react';

const PremiumFeatures = ({ stripeLoading, handleStripeCheckout }) => {
    return (
        <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '10px', marginBottom: '10px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Premium Features</div>
            <button
                onClick={handleStripeCheckout}
                disabled={stripeLoading}
                style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                {stripeLoading ? "Redirecting to Stripe..." : "Unlock Premium Features"}
            </button>
        </div>
    );
};

export default PremiumFeatures;
