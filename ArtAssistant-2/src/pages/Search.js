import React from "react";
import "../styles/Search.css";

export default function Search() {
    return (
        <div style={{ backgroundImage:'url("../images/Sketch.png")',backgroundSize: 'cover',
            backgroundPosition: 'center', backgroundColor: 'black', color: 'white', minHeight: '100vh', padding: '20px'}}>
            <form id="form"> 
                <center>
                <h1 style={{fontFamily:'serif', fontSize:'18vw', color:'white'}}>ARTY</h1>
                    {/* container for searchbar and icon */}
                    <div className="search-container">
                        <input 
                            style = {{paddingLeft:'15px', paddingRight:'15px'}}
                            className="searchbar" 
                            type="search" 
                            placeholder="Search..." 
                        />

                        <button className="search-btn" type="submit" aria-label="Search">
                            <img src="../images/search_icon.png" alt="Search Icon" className="search-icon" />
                        </button>
                    </div>
                    
                </center>
            </form>
        </div>
    );
}
