import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import "../styles/Header.css";
import axios from "axios";

// Header
export default function Header() {
    const location = useLocation();
    const [activeLink, setActiveLink] = useState(location.pathname);
    const [showPopup, setShowPopup] = useState(false);
    const [isLoggedIn] = useState(false); 
    const [haveAccount, setHaveAccount] = useState(false); 

    useEffect(() => {
        setActiveLink(location.pathname);
    }, [location]);

    const handleLogin = () => {
        setHaveAccount(true);
    };

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
            const url = isLoggedIn
                ? 'http://localhost:5000/get-users'
                : 'http://localhost:5000/create-users';
        
            try {
                const response = isLoggedIn
                    ? await axios.get(url, {
                          params: { email: inputs.email, password: inputs.password }
                      })
                    : await axios.post(url, {
                          email: inputs.email,
                          password: inputs.password,
                          confirmPassword: inputs.confirmPassword
                      }, {
                          headers: {
                              'Content-Type': 'application/json',
                          }
                      });
        
                if (response.status === 200 || response.status === 201) {
                    onLogin();
                    closePopup();
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
            <nav className="navbar navbar-expand-lg" >
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
                                    to="/about" 
                                >
                                    About
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
                        </ul>
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                {isLoggedIn ? (
                                    <NavLink 
                                        className={({ isActive }) => isActive ? "nav-link option active-link" : "nav-link option"} 
                                        to="/user" 
                                    >
                                        Account
                                    </NavLink>
                                ) : (
                                    <NavLink 
                                        className={({ isActive }) => isActive ? "nav-link option active-link" : "nav-link option"} 
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
            {/* For the loggin pop up */}
            {showPopup && <LoginSignupPopup closePopup={() => setShowPopup(false)} onLogin={handleLogin} />}
        </header>
    );
}

