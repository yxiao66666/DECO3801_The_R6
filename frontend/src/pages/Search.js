import React, { useState, useEffect } from "react";
import "../styles/Search.css";

export default function Search() {
    const [images, setImages] = useState([]); // Store the image data
    const [visibleImages, setVisibleImages] = useState(9); // Control how many images are visible initially
    const [searchQuery, setSearchQuery] = useState(''); // Empty string for search query
    const [selectedImage, setSelectedImage] = useState(null); // State for the selected image file
    const [loading, setLoading] = useState(false); // State for loading indicator
    const baseUrl = 'http://127.0.0.1:5000/';


    const loadMore = () => {
        setVisibleImages(prevVisible => prevVisible + 9); // Increase the visible images by 9 each time
    };

    const handleInputChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true); // Show loading icon
        try {
            const response = await fetch(`${baseUrl}/backend/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: searchQuery })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Search results:', result);

                // Convert the result object to an array if necessary
                const resultArray = Object.values(result);
                setImages(resultArray); // Update images state with search results
            } else {
                console.error('Search failed');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false); // Hide loading icon
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
            const imageUrl = URL.createObjectURL(file); // Create a URL for the selected image
            setSelectedImage(imageUrl); // Update state with the image URL
            console.log("Uploaded file:", file);
        } else {
            alert('Please select a valid .png or .jpg file.');
        }
    };

    return (
        <div className="background-container" style={{ backgroundImage: 'url("../images/Sketch.png")'}}>
            <form id="form" onSubmit={handleSubmit}>
                <center>
                    <img src="../images/ARTY.png" alt="ARTY" className="arty-image"/>
                    {/* Container for searchbar, upload icon, and search icon */}
                    <div className="searchbar-container">
                        <input 
                            className="searchbar" 
                            type="search" 
                            placeholder="Upload and Search..." 
                            onChange={handleInputChange}
                            value={searchQuery}
                        />
                        {/* Hidden file input for upload */}
                        <input
                            type="file"
                            accept=".png,.jpg"
                            id="file-upload"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        {/* Upload icon placed inside search bar */}
                        <img 
                            src="../images/upload.png" 
                            alt="Upload Icon" 
                            className="upload-icon"
                            onClick={() => document.getElementById('file-upload').click()} // Trigger file input when clicked
                        />
                        {/* Search button with icon */}
                        <button 
                            className="search-btn" 
                            type="submit" 
                            aria-label="Search button">
                            <img src="../images/search_icon.png" alt="Search Icon" className="search-icon" />
                        </button>
                        
                    </div>
                </center>
            </form>

            {/* Display loading icon while fetching images */}
            {loading && (
                <div className="loading-container">
                    <img src="../images/loading.gif" alt="Loading..." className="loading-icon" />
                </div>

            )}

            {/* Preview of selected image Grid */}
            {selectedImage && (
                <div className="image-preview-container">
                    <img src={selectedImage} alt="Selected Preview" className="image-preview" />
                </div>
            )}

            <br />

            {/* Grid Container for images */}
            <div className="image-grid">
                {images.slice(0, visibleImages).map((url, index) => (
                    <div key={index} className="image-cell">
                        <img className="results" src={url} alt={`Image ${index}`} />
                    </div>
                ))}
            </div>
            {visibleImages < images.length && (
                <label onClick={loadMore} className="load-more">
                    More results...
                </label>
            )}
            <br />
        </div>
    );
}
