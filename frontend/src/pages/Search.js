import React, { useState, useEffect } from "react";
import "../styles/Search.css";

export default function Search() {
    // State variables
    const [userId, setUserId] = useState(null);
    const [images, setImages] = useState([]);
    const [visibleImages, setVisibleImages] = useState(9);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [savedImages, setSavedImages] = useState(new Set());
    const baseUrl = 'http://127.0.0.1:5000';

    useEffect(() => {
        const id = localStorage.getItem('userId');
        console.log("Retrieved user ID:", id); // Log to verify
        setUserId(id);

        // Fetch saved images for the user
        if (id) {
            fetchSavedImages(id);
        }
    }, [userId]); // Runs when userId changes

    // Fetch saved images for the user from the backend
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
                setSavedImages(savedImageSet);
            } else {
                console.error('Failed to fetch saved images');
            }
        } catch (error) {
            console.error('Error fetching saved images:', error);
        }
    };

    // Function to load more images
    const loadMore = () => {
        setVisibleImages(prevVisible => prevVisible + 9);
    };

    // Updates the search query state when the user types in the input field
    const handleInputChange = (event) => {
        setSearchQuery(event.target.value);
    };

    // Handles the search submission (with text and image upload) when the form is submitted
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true); // Set loading to true to show the loading indicator
    
        try {
            const formData = new FormData();
            formData.append('query', searchQuery);// Append the search query to the form data
    
            const fileInput = document.getElementById('file-upload');
            if (fileInput && fileInput.files.length > 0) {
                formData.append('image', fileInput.files[0]);// Append image file if selected
            }
    
            const response = await fetch(`${baseUrl}/backend/search`, {
                method: 'POST',
                body: formData,
            });
    
            if (response.ok) {
                const result = await response.json();
                console.log('Search results:', result);
                const resultArray = Object.values(result);
                setImages(resultArray); // Update the state with the search results
                setSelectedImage(null); // Clear the selected image
            } else {
                console.error('Search failed');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false); // Set loading to false after search completes
        }
    };

    // Handles the image file input change (validates and shows a preview)
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl); // Set the selected image for preview
            console.log("Uploaded file:", file);
        } else {
            alert('Please select a valid .png or .jpg file.');
        }
    };

    // Clears the selected image (removes the preview)
    const clearSelectedImage = () => {
        setSelectedImage(null); // Clear the image preview
        document.getElementById('file-upload').value = ''; // Clear the file input field
    };

    // Toggles the saving or unsaving of an image
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
        setSavedImages(newSavedImages); // Update the state with the new saved images set
    };

    // Deletes a saved image from the server
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
    // Return the JSX to render the search form and image results
    return (
        // The container for the entire search form and image results
        <div className="background-container" >
            
            {/* Form submission triggers the search */}
            <form id="form" onSubmit={handleSubmit}>
                <center>
                    <img src="../images/ARTY.png" alt="ARTY" className="arty-image" />
                    {/* Container for the search bar and file upload components */}
                    <div className="searchbar-container">
                        {/* Input field for text-based search */}
                        <input 
                            className="searchbar" 
                            type="search" 
                            placeholder="Upload and Search..." 
                            onChange={handleInputChange}
                            value={searchQuery}
                        />
                        {/* Hidden file input for image upload */}
                        <input
                            type="file"
                            accept=".png,.jpg"
                            id="file-upload"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        {/* Image icon that triggers file input on click */}
                        <img 
                            src="../images/upload.png" 
                            alt="Upload Icon" 
                            className="upload-icon"
                            onClick={() => document.getElementById('file-upload').click()}
                        />
                        {/* Search button to submit the form */}
                        <button 
                            className="search-btn" 
                            type="submit" 
                            aria-label="Search button">
                            <img src="../images/search_icon.png" alt="Search Icon" className="search-icon" />
                        </button>
                    </div>
                </center>
            </form>

            {/* Loading indicator that shows while waiting for search results */}
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-container">
                        <img src="../images/loading-icon.gif" alt="Loading..." className="loading-icon" />
                    </div>
                </div>
            )}
            {/* If an image is selected (from file upload), show a preview */}
            {selectedImage && (
                <div className="image-preview-container">
                    <img src={selectedImage} alt="Selected Preview" className="image-preview" />
                    {/* Add a close button (X) to cancel the uploaded image */}
                    <button className="discard-button" onClick={clearSelectedImage}>
                        Discard
                    </button>
                </div>

                
            )}
            <br />
            {/* Display grid of search results */}
            <div className="image-grid">
                {/* Iterate through the list of images and display each one */}
                {images.slice(0, visibleImages).map((url, index) => (
                    <div key={index} className="image-cell" style={{ position: 'relative' }}>
                        <img className="results" src={url} alt={`Searched result ${index}`} />
                        {/* Show a save or saved icon based on whether the image is saved */}
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
            {/* If there are more images to load, display the "More results" button */}
            {visibleImages < images.length && (
                <label onClick={loadMore} className="load-more">More results...</label>
            )}
            <br />
        </div>
    );
}
