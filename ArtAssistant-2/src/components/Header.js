import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Header.css";

// Header
export default function Header() {
    const location = useLocation();
    const [activeLink, setActiveLink] = useState(location.pathname);

    //login popup
    const [showPopup, setShowPopup] = useState(false);




    // Toggle button select or unselect
    useEffect(() => {
        setActiveLink(location.pathname);
    }, [location]);

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
                                style={{ color: 'white', fontWeight: 'bold', fontFamily: 'serif', transistion: 'transform 0.3s'}}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.25)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                Home
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${activeLink === "/about" ? "active" : ""}`} 
                                to="/about" 
                                style={{ color: 'white', fontWeight: 'bold', fontFamily: 'serif', transistion: 'transform 0.3s'}}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.25)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                About Us
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${activeLink === "/search" ? "active" : ""}`} 
                                to="/search" 
                                style={{ color: 'white', fontWeight: 'bold', fontFamily: 'serif' , transistion: 'transform 0.3s'}}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.25)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                Art Search
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${activeLink === "/upload" ? "active" : ""}`} 
                                to="/upload" 
                                style={{ color: 'white', fontWeight: 'bold', fontFamily: 'serif', transistion: 'transform 0.3s' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.25)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                AI Art Generator
                            </Link>
                        </li>
                    </ul>

                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${activeLink === "/" ? "active" : ""}`} 
                                style={{ color: 'white', fontWeight: 'bold', fontFamily: 'serif', transistion: 'transform 0.3s' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.25)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowPopup(true);

                                }}
                            >
                                Login/Signup
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
        {showPopup && <LoginSignupPopup closePopup={() => setShowPopup(false)} />}
    </header>

    );
}

// Login/Signup Popup Component
const LoginSignupPopup = ({ closePopup }) => {
    return (
        <div style={popupStyles.overlay}>
            <div style={popupStyles.popup}>
            <button type="button" onClick={closePopup} style={{position:'fixed',top:160,right:500,padding:'3px 6px',border:'2px', borderRadius:'5px'}}>×</button>
                <h2>Login</h2>
                <br ></br>
                <form>
                    <label>
                        Email:<input type="email" name="email" required />
                    </label>
                    <br ></br>
                    <br ></br>
                    <label>
                        Password:<input type="password" name="password" required />
                    </label>
                    <br ></br>
                    <br ></br>
                    <button type="submit" style={{padding:'5px 10px', margin:'1px', border:'2px', borderRadius:'5px'}}>Login</button>
                    <br ></br>
                    <br ></br>
                    <Link 
                        to="/about"
                        style={{ color: 'black', fontWeight: 'bold', fontFamily: 'serif' }}
                        onClick={(e) => {
                            e.preventDefault(); 
                        }}
                    >
                        Create an account.
                    </Link>
                </form>
            </div>
        </div>
    );
};

// Popup Styles
const popupStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex:1
    },
    popup: {
        backgroundColor: 'white',
        padding: '50px 50px',
        borderRadius: '8px',
        width: '300px',
        textAlign: 'center',
        zIndex:1
    }
};
