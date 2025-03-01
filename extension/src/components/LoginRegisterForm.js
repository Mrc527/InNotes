import React, {useState} from 'react';

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
                               handlePasswordKeyDown,
                               email,
                               setEmail
                           }) => {

    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const validateAndRegister = () => {
        let isValid = true;

        if (!username) {
            setUsernameError("Username is required.");
            isValid = false;
        } else {
            setUsernameError("");
        }

        if (!email) {
            setEmailError("Email is required.");
            isValid = false;
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setEmailError("Please enter a valid email address.");
                isValid = false;
            } else {
                setEmailError("");
            }
        }


        if (!password) {
            setPasswordError("Password is required.");
            isValid = false;
        } else {
            // Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
            if (!passwordRegex.test(password)) {
                setPasswordError("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.");
                isValid = false;
            } else {
                setPasswordError("");
            }
        }

        if (isValid) {
            handleRegister();
        }
    };

    return (
        <>
            {!register && (
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
            )}

            {register && (
                <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '10px', marginBottom: '10px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Register</div>
                    <center>
                        <input id="username" style={inputStyle} placeholder="Username"
                               onChange={(e) => setUsername(e.target.value)} value={username} required /><br />
                        {usernameError && <div style={{ color: 'red' }}>{usernameError}</div>}

                        <input id="email" type="email" style={inputStyle} placeholder="Email"
                               onChange={(e) => setEmail(e.target.value)} value={email} required /><br />
                        {emailError && <div style={{ color: 'red' }}>{emailError}</div>}

                        <input id="password" type="password" style={inputStyle} placeholder="Password"
                               onChange={(e) => setPassword(e.target.value)} onKeyDown={handlePasswordKeyDown}
                               value={password} required /><br />
                        {passwordError && <div style={{ color: 'red' }}>{passwordError}</div>}

                        <button style={buttonStyle} onClick={validateAndRegister}>Register</button><br />
                        <a href="#" onClick={() => setRegister(false)}>Login</a>
                    </center>
                </div>
            )}
        </>
    );
};

export default LoginRegisterForm;
