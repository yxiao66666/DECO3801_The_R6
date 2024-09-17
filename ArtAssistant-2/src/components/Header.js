import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Header.css";
import axios from "axios";

// Header
export default function Header() {
    const location = useLocation();
    const [activeLink, setActiveLink] = useState(location.pathname);
    const [showPopup, setShowPopup] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    const [haveAccount, setHaveAccount] = useState(false); 
    const [inputs, setInputs] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    

    useEffect(() => {
        setActiveLink(location.pathname);
    }, [location]);

    const handleLogin = () => {
        setHaveAccount(true);
    };

    // Login/Signup Popup Component
    const LoginSignupPopup = ({ closePopup, onLogin }) => {
        const [isLogin, setIsLogin] = useState(true);
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
            const url = isLogin
                ? 'http://localhost:5000/get-users'
                : 'http://localhost:5000/create-users';
        
            try {
                const response = isLogin
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
            <nav className="navbar navbar-expand-lg" style={{ backgroundColor: 'black' }}>
                <div className="container">
                    <Link 
                        className="navbar-brand" 
                        to="/" 
                        style={{ color: 'white', fontSize: '22px', fontFamily: 'fantasy' }}
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
                                    onMouseEnter={(event) => event.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(event) => event.currentTarget.style.transform = 'scale(1)'}
                                    to="/" 
                                >
                                    Home
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link 
                                    className={`nav-link ${activeLink === "/about" ? "active" : ""}`} 
                                    style={{ color: 'white', transition: 'transform 0.3s', paddingLeft:'30px', paddingRight:'30px'}}
                                    onMouseEnter={(event) => event.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(event) => event.currentTarget.style.transform = 'scale(1)'}
                                    to="/about" 
                                >
                                    About
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link 
                                    className={`nav-link ${activeLink === "/search" ? "active" : ""}`} 
                                    style={{ color: 'white', transition: 'transform 0.3s', paddingLeft:'30px', paddingRight:'30px'}}
                                    onMouseEnter={(event) => event.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(event) => event.currentTarget.style.transform = 'scale(1)'}
                                    to="/search"
                                >
                                    Search
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link 
                                    className={`nav-link ${activeLink === "/upload" ? "active" : ""}`} 
                                    style={{ color: 'white', transition: 'transform 0.3s', paddingLeft:'30px', paddingRight:'30px'}}
                                    onMouseEnter={(event) => event.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(event) => event.currentTarget.style.transform = 'scale(1)'}
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
                                        className={`nav-link ${activeLink === "/user" ? "active" : ""}`} 
                                        style={{ color: 'white', transition: 'transform 0.3s', paddingLeft:'30px', paddingRight:'30px'}}
                                        onMouseEnter={(event) => event.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(event) => event.currentTarget.style.transform = 'scale(1)'}
                                        to="/user"
                                    >Account</Link>
                                ) : (
                                    <Link 
                                        className={`nav-link ${activeLink === "/" ? "active" : ""} nav-hover`} 
                                        style={{ color: 'white', transition: 'transform 0.3s', paddingLeft:'30px', paddingRight:'30px'}}
                                        onMouseEnter={(event) => event.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(event) => event.currentTarget.style.transform = 'scale(1)'}
                                        to="/"
                                        onClick={(event) => {
                                            event.preventDefault();
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

