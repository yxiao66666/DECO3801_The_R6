import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/User.css"; // Make sure this contains the masonry grid CSS

export default function Userhome() {
    const [userId, setUserId] = useState(null);
    const [userEmail, setUserEmail] = useState("");
    const [savedImages, setSavedImages] = useState(new Set()); // For saved images
    const navigate = useNavigate();
    const baseUrl = 'http://127.0.0.1:5000';
    const [visibleImages] = useState(999); // To control how many images are visible initially

    useEffect(() => {
        const id = localStorage.getItem('userId');
        console.log("Retrieved user ID:", id); // Log to verify
        setUserId(id);
    }, [userId]); // Runs when userId changes
    
    useEffect(() => {
        const fetchSavedImages = async (id) => {
            try {
                const response = await fetch(`${baseUrl}/backend/saved_image/get/user`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ user_id: id }),
                });
                if (response.ok) {
                    const savedImageArray = await response.json();
                    const savedImageSet = new Set(savedImageArray.map(image => image.sd_image_path));
                    setSavedImages(savedImageSet); // Store saved images in state
                } else {
                    console.error('Failed to fetch saved images');
                }
            } catch (error) {
                console.error('Error fetching saved images:', error);
            }
        };

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
    
                // Fetch saved images once user ID is obtained
                fetchSavedImages(userId);

                const userResponse = await fetch(`${baseUrl}/backend/users/get`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ user_id: userId }),
                });

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
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        navigate("/"); 
    };

    const scrollToWorks = () => {
        document.getElementById("user-works").scrollIntoView({ behavior: 'smooth' });
    };

    const getUsernameFromEmail = (email) => {
        const atIndex = email.indexOf('@');
        return atIndex !== -1 ? email.substring(0, atIndex) : email;
    };

    const toggleSaveImage = async (imageUrl) => {
        const newSavedImages = new Set(savedImages);
        if (newSavedImages.has(imageUrl)) {
            await deleteSavedImage(imageUrl); // Call the delete function
            newSavedImages.delete(imageUrl); // Remove if already saved
        } else {
            newSavedImages.add(imageUrl); // Add if not saved
            console.log('Saving image with:', {
                user_id: userId, // Use the state variable here
                sd_image_path: imageUrl,
            });

            if (!userId) {
                console.error("User ID is not available. Cannot save image.");
                return; // Exit the function if userId is null
            }

            // Make the API call to save the image
            try {
                const response = await fetch(`${baseUrl}/backend/saved_image/insert`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        sd_image_path: imageUrl,
                    }),
                });
    
                if (!response.ok) {
                    throw new Error('Failed to save image');
                }
            } catch (error) {
                console.error('Error saving image:', error);
            }
        }
        setSavedImages(newSavedImages);
    };

    const deleteSavedImage = async (imageUrl) => {
        if (!userId) {
            console.error("User ID is not available. Cannot delete image.");
            return; // Exit if userId is null
        }

        try {
            const response = await fetch(`${baseUrl}/backend/saved_image/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    sd_image_path: imageUrl,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete saved image');
            }
        } catch (error) {
            console.error('Error deleting image:', error);
        }
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
                    <h4>Saved Images</h4>
                    <div className="image-grid">
                        {Array.from(savedImages).slice(0, visibleImages).map((url, index) => (
                            <div key={index} className="image-cell" style={{ position: 'relative' }}>
                                <img className="results" src={`${url}`} alt={`Saved Image ${index + 1}`} />
                                <img 
                                    src={savedImages.has(url) ? "../images/saved.png" : "../images/save.png"} 
                                    alt={savedImages.has(url) ? "Saved Icon" : "Save Icon"} 
                                    className="upload-icon" 
                                    onClick={() => toggleSaveImage(url)} 
                                    style={{ position: 'absolute', top: '-9px', right: '1px' }}
                                />
                            </div>
                        ))}
                    </div>
                    <h4>My Works</h4>
                </section>
            </main>
        </div>
    );
}
