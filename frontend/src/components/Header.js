import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Header.css";

// Header
export default function Header() {
    const location = useLocation();
    const [activeLink, setActiveLink] = useState(location.pathname);

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
                                style={{ color: 'white', fontWeight: 'bold', fontFamily: 'Cursive, sans-serif' }}
                                onMouseEnter={(e) => e.currentTarget.style.fontSize = '20px'}
                                onMouseLeave={(e) => e.currentTarget.style.fontSize = '16px'}
                            >
                                Home
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${activeLink === "/about" ? "active" : ""}`} 
                                to="/about" 
                                style={{ color: 'white', fontWeight: 'bold', fontFamily: 'Cursive, sans-serif' }}
                                onMouseEnter={(e) => e.currentTarget.style.fontSize = '20px'}
                                onMouseLeave={(e) => e.currentTarget.style.fontSize = '16px'}
                            >
                                About Us
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${activeLink === "/search" ? "active" : ""}`} 
                                to="/search" 
                                style={{ color: 'white', fontWeight: 'bold', fontFamily: 'Cursive, sans-serif' }}
                                onMouseEnter={(e) => e.currentTarget.style.fontSize = '20px'}
                                onMouseLeave={(e) => e.currentTarget.style.fontSize = '16px'}
                            >
                                Art Search
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${activeLink === "/upload" ? "active" : ""}`} 
                                to="/upload" 
                                style={{ color: 'white', fontWeight: 'bold', fontFamily: 'Cursive, sans-serif' }}
                                onMouseEnter={(e) => e.currentTarget.style.fontSize = '20px'}
                                onMouseLeave={(e) => e.currentTarget.style.fontSize = '16px'}
                            >
                                AI Art Generator
                            </Link>
                        </li>
                    </ul>

                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${activeLink === "/" ? "active" : ""}`} 
                                to="/" 
                                style={{ color: 'white', fontWeight: 'bold', fontFamily: 'Cursive, sans-serif' }}
                                onMouseEnter={(e) => e.currentTarget.style.fontSize = '20px'}
                                onMouseLeave={(e) => e.currentTarget.style.fontSize = '16px'}
                            >
                                Login/Signup
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </header>

    );
}
