import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

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
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container">
                    <Link className="navbar-brand" to="/">ArtAssistant</Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <Link className={`nav-link ${activeLink === "/" ? "active" : ""}`} to="/"> Home </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`nav-link ${activeLink === "/about" ? "active" : ""}`} to="/about">About Us</Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`nav-link ${activeLink === "/search" ? "active" : ""}`} to="/search">Art Search</Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`nav-link ${activeLink === "/upload" ? "active" : ""}`} to="/upload">AI Art Generator</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
}
