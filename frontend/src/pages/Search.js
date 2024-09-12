import React, { useState, useEffect} from "react";
import "../styles/Search.css";

// Search 
export default function Search() {

    const [images, setImages] = useState([]); // Store the image data
    const [visibleImages, setVisibleImages] = useState(9); // Control how many images are visible initially

    // Simulating fetching image data from backend
    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            //Fetch the search engine api
            const imageResponse = await fetch('http://localhost:5000/search'); 
            const imageData = await imageResponse.json(); 
            setImages(imageData); 
        } catch (error) {
            console.error("Error fetching images:", error); 
        }
    };

    // Function to load more images when the button is clicked
    const loadMore = () => {
        setVisibleImages(prevVisible => prevVisible + 9); // Increase the visible images by 3 each time
    };


    

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
        <div style={{ backgroundImage:'url("../images/Sketch.png")',backgroundSize: 'cover', backgroundRepeat:'no-repeat',
            backgroundPosition: 'center', backgroundColor: 'black', color: 'white', minHeight: '100vh', padding: '20px'}}>
            <form id="form" onSubmit={handleSubmit}> 
                <center>
                    <h1 style={{fontFamily:'serif', fontSize:'18vw', color:'white'}}>ARTY</h1>
                    {/* container for searchbar and icon */}
                    <div style={{display:'flex', justifyContent:'center',alignItems:'center'}}>
                        
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
            <br></br>
            <br></br>
            <div style={{display:'flex',gap:'3em', flexDirection:'column'}}>
                {images.slice(0,visibleImages).map((image, index) =>  (
                    <div key={index} style={{display:'flex',gap:'3em',textAlign:'center'}}>
                        <img className="results" src={image.url} alt={image.description}></img>
                    </div>
                    
                ))}

                {visibleImages < images.length && (
                <label onClick={loadMore} class="row" style={{ margin:'auto', cursor: 'pointer', border:'2px solid white', borderRadius: '5px', textAlign:'center',justifyContent:'center'}}>
                        More results...
                </label>
                )}
            </div>
            <br></br>
            
        </div>
    );
}
