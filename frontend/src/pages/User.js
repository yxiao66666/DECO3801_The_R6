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
            const email = localStorage.getItem('userEmail'); 
            if (!email) {
                console.error('No email found in localStorage');
                return;
            }
    
            const idResponse = await fetch(`${baseUrl}/backend/users/get_id`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
    
            if (idResponse.ok) {
                const idData = await idResponse.json();
                const userId = idData.user_id;
    
                // Fetch the user details using the user ID
                const userResponse = await fetch(`${baseUrl}/backend/users/get`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ user_id: userId }),
                });

                const userWorks = [
                    "Artwork 1",
                    "Artwork 2",
                    "Artwork 3"
                ]; // Need to Replace with actual fetched works
                setUserWorks(userWorks); // TODO: NOT WORKING YET

                if (userResponse.ok) {
                    const data = await userResponse.json();
                    setUserEmail(data.email);
                } else {
                    console.error('Failed to fetch user data:', userResponse.statusText);
                }
            } else {
                console.error('Failed to fetch user ID:', idResponse.statusText);
            }
        };
    
        fetchUserData();
    }, []);
    

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn'); // Clear login state
        localStorage.removeItem('userEmail'); // Clear user email from localStorage
        navigate("/"); // Redirect to the Home page
    };
    
    const scrollToWorks = () => {
        document.getElementById("user-works").scrollIntoView({ behavior: 'smooth' });
    };

    // This function gets everything infront of the @ in a email
    // Input: Ben@google.com -> Output: Ben
    const getUsernameFromEmail = (email) => {
        const atIndex = email.indexOf('@');
        return atIndex !== -1 ? email.substring(0, atIndex) : email;
    };

    return (
        <div className="user-home">
            <header className="user-home-header" style={{ backgroundImage: 'url("../images/user_bg.png")' }}>
                <br /><br />
                <div className="user-avatar-container">
                    <img src="../images/user_profile.jpg" alt="User Avatar" className="user-avatar" />
                </div>
                <h1>Welcome, {getUsernameFromEmail(userEmail)}</h1>
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
