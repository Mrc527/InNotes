'use client';

import React from 'react';

export default function CancelPage() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f4f4f4'
        }}>
            <h1 style={{
                color: '#e44d26',
                fontSize: '2.5em',
                marginBottom: '20px'
            }}>
                Payment Cancelled
            </h1>
            <p style={{
                fontSize: '1.2em',
                color: '#333',
                textAlign: 'center',
                padding: '0 20px',
                marginBottom: '30px'
            }}>
                It appears that you have cancelled your payment. If this was unintentional, please try again.
            </p>
            <a href="/" style={{
                padding: '10px 20px',
                fontSize: '1em',
                color: '#fff',
                backgroundColor: '#3498db',
                textDecoration: 'none',
                borderRadius: '5px',
                transition: 'background-color 0.3s ease',
            }}>
                Return to Homepage
            </a>
        </div>
    );
}
