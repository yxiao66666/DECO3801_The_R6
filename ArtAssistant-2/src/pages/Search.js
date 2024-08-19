import React from "react";
import "../styles/Search.css";

export default function Search() {
    return (
        <div style={{ backgroundImage:'url("../images/black-1.jpg")',backgroundSize: 'cover',
            backgroundPosition: 'center', color: 'black', minHeight: '100vh', padding: '20px'}}>
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
