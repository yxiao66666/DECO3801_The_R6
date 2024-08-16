import React from "react";
import "../styles/Search.css";

export default function Search() {
    return (
        <div>
            <form id="form"> 
                <center>
                <h1 className="tittle">ARTY</h1>
                    {/* Here is the search bar */}
                    <div className="bar">
                        <input 
                            className="searchbar" 
                            type="search" 
                            placeholder="Search..." 
                        />
                    </div>

                    <button className ="search-btn" type="submit" aria-label="edit button later" >Search</button>
                    
                </center>
            </form>
        </div>
    );
}
