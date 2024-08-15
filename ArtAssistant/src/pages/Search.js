import React from "react";
import "../styles/Search.css";

export default function Search() {
    return (
        <div>
            <form id="form"> 
                <center>
                <h1>Search</h1>
                <p>This is the Search page content.</p>
                    {/* Here is the search bar */}
                    <div className="bar">
                        <input 
                            className="searchbar" 
                            type="search" 
                            title="Search"
                            name="artsearch" 
                            aria-label="Search" 
                            placeholder="Search..." 
                        />
                    </div>
                    <button aria-label="edit button later" >Search</button>
                </center>
            </form>
        </div>
    );
}
