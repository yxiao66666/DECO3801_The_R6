import React, { useState } from "react";
import "../styles/Search.css";

// Search 
export default function Search() {
// Chck if text entered
const [searchQuery, setSearchQuery] = useState(''); // Empty string

const handleInputChange = (event) => {
    // Update state if text entered
    setSearchQuery(event.target.value);
};

const handleSubmit = async (event) => {
    // Keep this line to avoid page refresh and lost everything MUST HAVE OR ELSE ERROR
    event.preventDefault();

    try {
        const response = await fetch('http://127.0.0.1:5000/search', { // A new url for search, different from upload
            method: 'POST',
            // Mark the data type
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({query: searchQuery})
        });

        if (response.ok) {
            const result = await response.json();
            // Print out the result (search input) in console
            console.log('Search results:', result); 
        } else {
            console.error('Search failed');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};
    return (
        <div style={{ backgroundImage:'url("../images/Sketch.png")',backgroundSize: 'cover',
            backgroundPosition: 'center', backgroundColor: 'black', color: 'white', minHeight: '100vh', padding: '20px'}}>
            <form id="form" onSubmit={handleSubmit}> 
                <center>
                    <h1 style={{fontFamily:'serif', fontSize:'18vw', color:'white'}}>ARTY</h1>
                    {/* container for searchbar and icon */}
                    <div className="search-container">
                        <input 
                            style = {{paddingLeft:'15px', paddingRight:'15px'}}
                            className="searchbar" 
                            type="search" 
                            placeholder="Search..." 
                            onChange={handleInputChange}
                            value={searchQuery}
                        />

                        <button className="search-btn" type="submit" aria-label="edit button later">
                            <img src="../images/search_icon.png" alt="Search Icon" className="search-icon" />
                        </button>
                    </div>
                    
                </center>
            </form>
        </div>
    );
}
