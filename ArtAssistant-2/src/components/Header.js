import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Header.css";

// Header
export default function Header() {
    const location = useLocation();
    const [activeLink, setActiveLink] = useState(location.pathname);
    const [showPopup, setShowPopup] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false); 

    useEffect(() => {
        setActiveLink(location.pathname);
    }, [location]);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    return (
        <header>
            <nav className="navbar navbar-expand-lg custom-navbar">
                <div className="container">
                    <Link 
                        className="navbar-brand brand-name" 
                        style={{ color: 'white', transition: 'transform 0.3s', paddingLeft:'30px', paddingRight:'30px'}}
                        to="/"
                    >
                        Arty
                    </Link>
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
                                <Link 
                                    className={`nav-link ${activeLink === "/" ? "active" : ""} nav-hover`} 
                                    style={{ color: 'white', transition: 'transform 0.3s', paddingLeft:'30px', paddingRight:'30px'}}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    to="/" 
                                >
                                    Home
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link 
                                    className={`nav-link ${activeLink === "/about" ? "active" : ""} nav-hover`} 
                                    style={{ color: 'white', transition: 'transform 0.3s', paddingLeft:'30px', paddingRight:'30px'}}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    to="/about" 
                                >
                                    About
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link 
                                    className={`nav-link ${activeLink === "/search" ? "active" : ""} nav-hover`} 
                                    style={{ color: 'white', transition: 'transform 0.3s', paddingLeft:'30px', paddingRight:'30px'}}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    to="/search"
                                >
                                    Search
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link 
                                    className={`nav-link ${activeLink === "/upload" ? "active" : ""} nav-hover`} 
                                    style={{ color: 'white', transition: 'transform 0.3s', paddingLeft:'30px', paddingRight:'30px'}}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    to="/upload"
                                >
                                    Generator
                                </Link>
                            </li>
                        </ul>

                        <ul className="navbar-nav">
                            <li className="nav-item">
                                {isLoggedIn ? (
                                    <Link 
                                        className={`nav-link ${activeLink === "/user" ? "active" : ""} nav-hover`} 
                                        style={{ color: 'white', transition: 'transform 0.3s', paddingLeft:'30px', paddingRight:'30px'}}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        to="/user"
                                    >Account</Link>
                                ) : (
                                    <Link 
                                        className={`nav-link ${activeLink === "/" ? "active" : ""} nav-hover`} 
                                        style={{ color: 'white', transition: 'transform 0.3s', paddingLeft:'30px', paddingRight:'30px'}}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        to="/"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShowPopup(true);
                                        }}
                                    >Login / Signup</Link>
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

// Login/Signup Popup Component
const LoginSignupPopup = ({ closePopup, onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);

    const toggleForm = () => {
        setIsLogin(!isLogin); 
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            closePopup();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLogin) {
            onLogin(); 
            closePopup();
        } else {
            const password = e.target.password.value;
            const confirmPassword = e.target.confirmPassword.value;

            if (password !== confirmPassword) {
                alert("Passwords do not match!");
            } else {
                console.log("Passwords match. Form submitted.");
                onLogin(); 
                closePopup();
            }
        }
    };

    return (
        <div className="popup-overlay" onClick={handleOverlayClick}>
            <div className="popup-container">
                {isLogin ? (
                    <>
                        <form onSubmit={handleSubmit} className="form-container">
                            <h4>Welcome</h4>
                            <label>
                                Email
                                <input type="email" name="email" required className="input-field" />
                            </label>
                            <label>
                                Password
                                <input type="password" name="password" required className="input-field" />
                            </label>
                            <br />
                            <br />
                            <button 
                                type="submit" 
                                className="btn-primary"
                            >LOGIN</button>
                        </form>
                        <span className="form-footer">
                            Don't have an account? 
                            <button onClick={toggleForm} className="form-toggle">Sign up</button>
                        </span>
                    </>
                ) : (
                    <>
                        <form onSubmit={handleSubmit} className="form-container">
                            <h4>Create an Account</h4>
                            <label>
                                Email
                                <input type="email" name="email" required className="input-field" />
                            </label>
                            <label>
                                Password
                                <input type="password" name="password" required className="input-field" />
                            </label>
                            <label>
                                Confirm Password
                                <input type="password" name="confirmPassword" required className="input-field" />
                            </label>
                            <br />
                            <br />
                            <button 
                                type="submit" 
                                className="btn-primary"
                            >SIGN UP</button>
                        </form>
                        <span className="form-footer">
                            Already have an account? 
                            <button onClick={toggleForm} className="form-toggle">Login</button>
                        </span>
                    </>
                )}
            </div>
        </div>
    );
};


