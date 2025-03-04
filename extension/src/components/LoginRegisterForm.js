import React from 'react';

const LoginRegisterForm = ({ handleLinkedInLogin }) => {
    return (
        <>
            <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '10px', marginBottom: '10px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Login</div>
                <center>
                    <div>
                        <button onClick={handleLinkedInLogin} style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            margin: 0,
                            cursor: 'pointer'
                        }}>
                            <img
                                src="https://content.linkedin.com/content/dam/developer/global/en_US/site/img/signin-button.png"
                                alt="Sign in with LinkedIn"
                                style={{ maxWidth: '180px' }} />
                        </button>
                    </div>
                </center>
            </div>
        </>
    );
};

export default LoginRegisterForm;
