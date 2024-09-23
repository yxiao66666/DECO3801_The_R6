import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Header.css";

// Header
export default function Header() {
    const [showPopup, setShowPopup] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true'); 
    const [haveAccount, setHaveAccount] = useState(false); 
    const baseUrl = 'http://127.0.0.1:5000';
    const navigate = useNavigate(); // Initialise the useNavigate hook

    const handleLogin = () => {
        setIsLoggedIn(true);
        setHaveAccount(true);
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/user'); 
    };

    useEffect(() => {
        const handleStorageChange = () => {
            const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
            setIsLoggedIn(loggedIn);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);
    
    // Login/Signup Popup Component
    const LoginSignupPopup = ({ closePopup, onLogin }) => {
        const [inputs, setInputs] = useState({
            email: '',
            password: '',
            confirmPassword: ''
        });
    
        const toggleForm = () => {
            setHaveAccount(!haveAccount);
        };
        
        const handleOverlayClick = (event) => {
            if (event.target === event.currentTarget) {
                closePopup();
            }
        };
    
        const handleChange = (event) => {
            const { name, value } = event.target;
            setInputs((prevInputs) => ({
                ...prevInputs,
                [name]: value,
            }));
        };
    
        const handleSubmit = async (event) => {
            event.preventDefault();
            console.log(inputs);
        
            const url = haveAccount
                ? `${baseUrl}/backend/users/authenticate`
                : `${baseUrl}/backend/users/insert`;
        
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_email: inputs.email,
                        user_password: inputs.password,
                        ...(haveAccount ? {} : { confirmPassword: inputs.confirmPassword })
                    })
                });
        
                if (haveAccount) {
                    // Handle login response
                    if (response.status === 200) {
                        const data = await response.json();
                        console.log("Login successful:", data);
                        localStorage.setItem('userEmail', inputs.email); // Store the email in localStorage
                        localStorage.setItem('userId', data.user_id); // Store the user ID in localStorage
                        console.log("Stored user ID:", data.user_id); // Log the stored user ID
                        onLogin(); // Set the user as logged in
                        closePopup();
                    } else if (response.status === 401) {
                        const errorData = await response.json();
                        alert(errorData.message); // Show invalid login message
                    } else {
                        console.error("Failed to log in:", response.statusText);
                    }
                } else {
                    // Handle signup response
                    if (response.status === 201) {
                        const data = await response.json();
                        console.log("User created successfully:", data);
                        setHaveAccount(true); // Switch to login form
                    } else if (response.status === 400) {
                        const errorData = await response.json();
                        alert(errorData.message); // Show email already exists message
                    } else {
                        console.error("Failed to create user:", response.statusText);
                    }
                }
            } catch (error) {
                console.error('Error making request:', error);
            }
        };
                                
        return (
            <div className="popup-overlay" onClick={handleOverlayClick}>
                <div className="popup-container">
                    <form onSubmit={handleSubmit} className="form-container">
                        <h4>{haveAccount ? "Welcome" : "Create an Account"}</h4>
                        <label>
                            Email
                            <input 
                                type="email" 
                                name="email" 
                                required 
                                className="input-field" 
                                onChange={handleChange} 
                                value={inputs.email} 
                            />
                        </label>
                        <label>
                            Password
                            <input 
                                type="password" 
                                name="password" 
                                required 
                                className="input-field" 
                                onChange={handleChange} 
                                value={inputs.password} 
                            />
                        </label>
                        {/* Only show the Confirm Password field if creating an account */}
                        {!haveAccount && (
                            <label>
                                Confirm Password
                                <input 
                                    type="password" 
                                    name="confirmPassword" 
                                    required 
                                    className="input-field" 
                                    onChange={handleChange} 
                                    value={inputs.confirmPassword} 
                                />
                            </label>
                        )}
                        {/* A bit of space underneath */}
                        <br />
                        <br />
                        <button type="submit" className="btn-primary">
                            {haveAccount ? "LOGIN" : "SIGN UP"}
                        </button>
                    </form>
                    <span className="form-footer">
                        {haveAccount ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={toggleForm} className="form-toggle">
                            {haveAccount ? "Sign up" : "Login"}
                        </button>
                    </span>
                </div>
            </div>
        );
    };

    return (
        <header>
            <nav className="navbar navbar-expand-lg">
                <div className="container">
                    <NavLink className="navbar-brand" to="/">Arty</NavLink>
                    <button 
                        className="navbar-toggler" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#navbarNav" 
                        aria-controls="navbarNav" 
                        aria-expanded="false" 
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto me-auto">
                            <li className="nav-item">
                                <NavLink 
                                    className={({ isActive }) => isActive ? "nav-link option active-link" : "nav-link option"} 
                                    to="/" 
                                >
                                    Home
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink 
                                    className={({ isActive }) => isActive ? "nav-link option active-link" : "nav-link option"} 
                                    to="/search"
                                >
                                    Search
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink 
                                    className={({ isActive }) => isActive ? "nav-link option active-link" : "nav-link option"} 
                                    to="/upload"
                                >
                                    Generator
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink 
                                    className={({ isActive }) => isActive ? "nav-link option active-link" : "nav-link option"} 
                                    to="/about" 
                                >
                                    About
                                </NavLink>
                            </li>
                        </ul>
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                {isLoggedIn ? (
                                    <NavLink 
                                        className={({ isActive }) => isActive ? "nav-link option active-link" : "nav-link option"} 
                                        to="/user" 
                                    >
                                        My Account
                                    </NavLink>
                                ) : (
                                    <NavLink 
                                        className={({ isActive }) => (isActive && window.location.pathname !== '/') ? "nav-link option active-link" : "nav-link option"} 
                                        to="/" 
                                        onClick={(event) => {
                                            event.preventDefault();
                                            setShowPopup(true);
                                        }}
                                    >
                                        Login / Signup
                                    </NavLink>
                                )}
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            {showPopup && <LoginSignupPopup closePopup={() => setShowPopup(false)} onLogin={handleLogin} />}
        </header>
    );
}