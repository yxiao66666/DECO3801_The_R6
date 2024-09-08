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
                                    className={`nav-link ${activeLink === "/" ? "active" : ""}`} 
                                    to="/" 
                                    style={{ color: 'white', transition: 'transform 0.3s', paddingRight:'30px'}}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    Home
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link 
                                    className={`nav-link ${activeLink === "/about" ? "active" : ""}`} 
                                    to="/about" 
                                    style={{ color: 'white', transition: 'transform 0.3s', paddingLeft:'30px', paddingRight:'30px'}}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    About
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link 
                                    className={`nav-link ${activeLink === "/search" ? "active" : ""}`} 
                                    to="/search" 
                                    style={{ color: 'white', transition: 'transform 0.3s', paddingLeft:'30px', paddingRight:'30px'}}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    Search
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link 
                                    className={`nav-link ${activeLink === "/upload" ? "active" : ""}`} 
                                    to="/upload" 
                                    style={{ color: 'white', transition: 'transform 0.3s', paddingLeft:'30px', paddingRight:'30px'}}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
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
                                        to="/user" 
                                        style={{ color: 'white', transition: 'transform 0.3s', paddingLeft:'30px', paddingRight:'30px'}}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >Account</Link>
                                ) : (
                                    <Link 
                                        className={`nav-link ${activeLink === "/" ? "active" : ""}`} 
                                        style={{ color: 'white',transition: 'transform 0.3s', paddingLeft:'30px', paddingRight:'30px' }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
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

    const inputStyle = {
        width: '100%',
        border: 'none',
        borderBottom: '1px solid gray',
        padding: '8px 0',
        outline: 'none',
        fontSize: '1em'
    };

    return (
        <div style={popupStyles.overlay} onClick={handleOverlayClick}>
            <div style={popupStyles.popup}>
                {isLogin ? (
                    <>
                        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '600px', margin: '40px auto' }}>
                        <h4 style={{ textAlign: 'center' }}>Welcome</h4>
                            <br />
                            <label style={{ display: 'block', textAlign: 'left', width: '100%' ,fontSize:'0.9em'}}>
                                Email<input type="email" name="email" required style={inputStyle} />
                            </label>
                            <br /><br />
                            <label style={{ display: 'block', textAlign: 'left', width: '100%',fontSize:'0.9em' }}>
                                Password<input type="password" name="password" required style={inputStyle} />
                            </label><br />
                            <label style={{ display: 'flex', alignItems: 'center' , fontSize:'0.7em'}}>
                                <input type="checkbox" name="rememberMe" style={{ marginRight: '10px' }} />
                                Remember me
                            </label>
                            <br />
                            <button 
                                type="submit" 
                                style={{
                                    padding: '5px 10px', 
                                    width: '100%', 
                                    border: '1px solid blue', 
                                    borderRadius: '5px',
                                    backgroundColor: 'blue', 
                                    color: 'white',           
                                    fontWeight: 'bold',
                                    transition: 'background-color 0.3s, transform 0.3s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'darkblue';
                                    e.currentTarget.style.border = '1px solid darkblue';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'blue';  
                                    e.currentTarget.style.border = '1px solid blue';
                                }}
                            >LOGIN</button>
                        </form>
                        <br /><br />
                        <span style={{ fontSize:'0.7em', display: 'block', textAlign: 'center'}}>
                            Don't have an account? 
                            <button 
                                type="button" 
                                onClick={toggleForm}
                                style={{ background: 'none', color: 'blue', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                            >Sign up</button>
                        </span>
                    </>
                ) : (
                    <>
                        
                        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '600px', margin: '40px auto' }}>
                        <h4 style={{ textAlign: 'center' }}>Create an Account</h4>
                        <br />
                            <label style={{ display: 'block', textAlign: 'left', width: '100%',fontSize:'0.9em' }}>
                                Email<input type="email" name="email" required style={inputStyle} />
                            </label><br /><br />
                            <label style={{ display: 'block', textAlign: 'left', width: '100%',fontSize:'0.9em' }}>
                                Password<input type="password" name="password" required style={inputStyle} />
                            </label><br /><br />
                            <label style={{ display: 'block', textAlign: 'left', width: '100%',fontSize:'0.9em' }}>
                                Confirm Password<input type="password" name="confirmPassword" required style={inputStyle} />
                            </label><br /><br />
                            <button 
                                type="submit" 
                                style={{
                                    padding: '5px 10px', 
                                    width: '100%', 
                                    border: '1px solid blue', 
                                    borderRadius: '5px',
                                    backgroundColor: 'blue', 
                                    color: 'white',
                                    fontWeight: 'bold',
                                    transition: 'background-color 0.3s, transform 0.3s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'darkblue';
                                    e.currentTarget.style.border = '1px solid darkblue';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'blue';  
                                    e.currentTarget.style.border = '1px solid blue';
                                }}
                            >SIGN UP</button>
                        </form>
                        <br />
                        <span style={{ fontSize:'0.7em', display: 'block', textAlign: 'center'}}>
                            Already have an account? 
                            <button 
                                type="button" 
                                onClick={toggleForm}
                                style={{ background: 'none', color: 'blue', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                            >Login</button>
                        </span>
                    </>
                )}
            </div>
        </div>
    );
};

const popupStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    popup: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        position: 'relative',
    },
};
