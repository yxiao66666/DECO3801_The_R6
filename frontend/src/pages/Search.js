import React from "react";
import "../styles/Search.css";

function fetch_api() {
  fetch("http://localhost:5000/search").then(response => response.json()).then(data => console.log(data))
}

// Search 
export default function Search() {
    fetch_api()
    return (
        <div style={{ backgroundImage:'url("../images/black-1.jpg")',backgroundSize: 'cover',
            backgroundPosition: 'center', color: 'black', minHeight: '100vh', padding: '20px'}}>
            {/* Cover image */}
            <form id="form"> 
                <center>
                    {/* Page Heading */}
                    <h1 className="tittle">ARTY</h1>
                    {/* Here is the search bar */}
                    <div className="bar">
                        <input
                            style={{paddingLeft:'10px', paddingRight:'10px'}}
                            className="searchbar" 
                            type="search" 
                            placeholder="Search..." 
                        />
                    </div>
                    {/* Search Button */}
                    <button className ="search-btn" type="submit" aria-label="edit button later" >Search</button>
                </center>
            </form>
        </div>
    );
}
