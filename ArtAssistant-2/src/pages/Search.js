import React from "react";
import { useState } from 'react';
import "../styles/Search.css";

/**Cecilia 8.13 */
export default function Search() {
    const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; /** Need API KEY FROM PINTEREST */

    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`https://api.unsplash.com/search/photos?query=${query}&per_page=10`, {
                headers: {
                    Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
                },
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setResults(data.results);
        } catch (error) {
            console.error("Error fetching search results:", error);
        }
    };

    return (
        <div>
            <form id="form" onSubmit={handleSearch}> 
                <center>
                <h1 className="tittle">ARTY</h1>
                    {/* Here is the search bar */}
                    <div className="bar">
                        <input 
                            className="searchbar" 
                            type="search" 
                            placeholder="Search..." 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <button className ="search-btn" type="submit" aria-label="edit button later" >Search</button>
                    
                </center>
            </form>
            <div className="results-container">
                {results.map(result => (
                    <div key={result.id} className="result-item">
                        <img 
                            src={result.urls.small} 
                            alt={result.alt_description || 'Image'} 
                            className="result-image"
                        />
                        <p className="result-title">{result.alt_description || 'No description'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
