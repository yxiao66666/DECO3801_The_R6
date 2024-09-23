import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Userhome.css";

export default function Userhome() {
    const [userEmail, setUserEmail] = useState("");
    const [userWorks, setUserWorks] = useState([]);
    const navigate = useNavigate();
    const baseUrl = 'http://127.0.0.1:5000';

    useEffect(() => {
        const fetchUserData = async () => {
        const userId = 1; // TODO: Need to fetch id based on user email
        const userWorks = [
            "Artwork 1",
            "Artwork 2",
            "Artwork 3"
        ]; // Replace with actual fetched works
        setUserWorks(userWorks); // TODO: NOT WORKING YET
        
            const response = await fetch(`${baseUrl}/backend/users/get`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId }),
            });
    
            if (response.ok) {
                const data = await response.json();
                setUserEmail(data.email);
                //setUserWorks(data.works); TODO: NOT WORKING YET
            } else {
                console.error('Failed to fetch user data:', response.statusText);
            }
        };
    
        fetchUserData();
    }, []);
    

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn'); // Clear login state
        navigate("/"); // Redirect to the login/signup page
    };
    
    const scrollToWorks = () => {
        document.getElementById("user-works").scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="user-home">
            <header className="user-home-header" style={{ backgroundImage: 'url("../images/user_bg.png")' }}>
                <br /><br />
                <div className="user-avatar-container">
                    <img src="../images/user_profile.jpg" alt="User Avatar" className="user-avatar" />
                </div>
                <h1>Welcome, {userEmail}</h1>
                <br /><br /><br />
                <div className="user-options">
                    <button className="button" onClick={scrollToWorks}>
                        My Works
                    </button>
                    <button className="button" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>
            <main className="user-home-content">
                <section className="user-works" id="user-works">
                    <h4>My Works</h4>
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
