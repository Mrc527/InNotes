import React from 'react';

const inputStyle = {
    marginBottom: '10px',
    padding: '5px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '100%',
    boxSizing: 'border-box'
};

const buttonStyle = {
    margin: '5px'
};

const LoginRegisterForm = ({
                               username,
                               password,
                               setUsername,
                               setPassword,
                               loginError,
                               submitCredentials,
                               register,
                               setRegister,
                               handleRegister,
                               handlePasswordKeyDown
                           }) => {
    return (
        <>
            <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '10px', marginBottom: '10px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Login Data</div>
                <div>
                    {loginError && (
                        <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>
                            Invalid credentials. Please try again.
                        </div>
                    )}
                    <center>
                        <input id="username" style={inputStyle} placeholder="Username"
                               onChange={(e) => setUsername(e.target.value)} value={username} /><br />
                        <input id="password" type="password" style={inputStyle} placeholder="Password"
                               onChange={(e) => setPassword(e.target.value)} onKeyDown={handlePasswordKeyDown}
                               value={password} /><br />
                        <button style={buttonStyle} onClick={submitCredentials}>Login</button><br />
                        <a href="#" onClick={() => setRegister(true)}>Register</a>
                    </center>
                </div>
            </div>

            {register && (
                <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '10px', marginBottom: '10px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Register</div>
                    <center>
                        <input id="username" style={inputStyle} placeholder="Username"
                               onChange={(e) => setUsername(e.target.value)} value={username} /><br />
                        <input id="password" type="password" style={inputStyle} placeholder="Password"
                               onChange={(e) => setPassword(e.target.value)} onKeyDown={handlePasswordKeyDown}
                               value={password} /><br />
                        <button style={buttonStyle} onClick={handleRegister}>Register</button><br />
                        <a href="#" onClick={() => setRegister(false)}>Login</a>
                    </center>
                </div>
            )}
        </>
    );
};

export default LoginRegisterForm;
