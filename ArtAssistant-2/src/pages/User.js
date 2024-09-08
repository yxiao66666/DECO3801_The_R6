import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Userhome.css";

export default function Userhome() {
    const [userEmail, setUserEmail] = useState("");
    const [userWorks, setUserWorks] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Here you would fetch user data from your backend
        // For now, we'll use dummy data
        const fetchedEmail = "user@example.com"; // Replace with actual fetched email
        const fetchedWorks = [
            "Artwork 1",
            "Artwork 2",
            "Artwork 3"
        ]; // Replace with actual fetched works

        setUserEmail(fetchedEmail);
        setUserWorks(fetchedWorks);
    }, []);

    const handleLogout = () => {
        // Handle logout logic here (e.g., clearing tokens, etc.)
        navigate("/"); // Redirect to homepage
    };

    const scrollToWorks = () => {
        document.getElementById("user-works").scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="user-home">
            <header className="user-home-header" style={{backgroundImage:'url("../images/user_bg.png")'}}>
                <br /><br />
                <h1>Welcome, {userEmail}</h1>
                <br /><br /><br />
                <div className="user-options">
                    <span className="option-link" onClick={scrollToWorks}>
                        My Works
                    </span>
                    <span className="option-link" onClick={handleLogout}>
                        Logout
                    </span>
                </div>
            </header>
            <main className="user-home-content">
                <section className="user-works" id="user-works">
                    <h4>Your Works</h4>
                    <ul>
                        {userWorks.map((work, index) => (
                            <li key={index}>{work}</li>
                        ))}
                    </ul>
                </section>
            </main>
        </div>
    );
}
