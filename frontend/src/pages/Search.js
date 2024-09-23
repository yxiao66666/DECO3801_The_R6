import React, { useState } from "react";
import "../styles/Search.css";

export default function Search() {
    // State to store the image data
    const [images, setImages] = useState([]);
    // State to control how many images are visible initially
    const [visibleImages, setVisibleImages] = useState(9);
    // State to store the search query
    const [searchQuery, setSearchQuery] = useState('');
    // State to store the selected image file
    const [selectedImage, setSelectedImage] = useState(null);
    // State to handle loading indicator
    const [loading, setLoading] = useState(false);
    // Base URL for API requests
    const baseUrl = 'http://127.0.0.1:5000';

    // Function to load more images by increasing the visible count
    const loadMore = () => {
        setVisibleImages(prevVisible => prevVisible + 9);
    };

    // Function to handle input change for the search query
    const handleInputChange = (event) => {
        setSearchQuery(event.target.value);
    };

    // Function to handle form submission and fetch search results
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true); // Show loading icon while fetching data
    
        try {
            const formData = new FormData();
            formData.append('query', searchQuery); // Always send the search query
    
            // If there's an image selected, append it to the form data
            const fileInput = document.getElementById('file-upload');
            if (fileInput && fileInput.files.length > 0) {
                formData.append('image', fileInput.files[0]); // Append the selected image
            }
    
            const response = await fetch(`${baseUrl}/backend/search`, {
                method: 'POST',
                body: formData, // Send the form data
            });
    
            if (response.ok) {
                const result = await response.json();
                console.log('Search results:', result);
    
                // Convert the result object to an array if necessary
                const resultArray = Object.values(result);
                setImages(resultArray); // Update state with search results
            } else {
                console.error('Search failed');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false); // Hide loading icon after fetching data
        }
    };
    

    // Function to handle file input change and update selected image
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
        <div className="background-container" style={{ backgroundImage: 'url("../images/Sketch.png")' }}>
            <form id="form" onSubmit={handleSubmit}>
                <center>
                    {/* Logo image */}
                    <img src="../images/ARTY.png" alt="ARTY" className="arty-image" />
                    {/* Container for search bar, upload icon, and search button */}
                    <div className="searchbar-container">
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
                        {/* Upload icon to trigger file input */}
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
            {/* Preview of the selected image */}
            {selectedImage && (
                <div className="image-preview-container">
                    <img src={selectedImage} alt="Selected Preview" className="image-preview" />
                </div>
            )}
            <br />
            {/* Grid Container for displaying images */}
            <div className="image-grid">
                {images.slice(0, visibleImages).map((url, index) => (
                    <div key={index} className="image-cell">
                        <img className="results" src={url} alt={`Searched result ${index}`} />
                    </div>
                ))}
            </div>
            {/* Load more button if there are more images to display */}
            {visibleImages < images.length && (
                <label onClick={loadMore} className="load-more">More results...</label>
            )}
            <br />
        </div>
    );
}
