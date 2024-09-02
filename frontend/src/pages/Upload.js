import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";

// Allowed image type
const fileTypes = ["JPG", "PNG", "GIF"];

// Upload
export default function Upload() {
    // Chck if image
    const [file, setFile] = useState(null);
    // Chck if search text
    const [text, setText] = useState('');

    // Handle upload file
    const handleChange = (file) => {
        const reader = new FileReader();
        reader.onload=(e)=>
            {
                setFile(e.target.result);
            }
        reader.readAsDataURL(file)};

    // Handle upload text
    const handleTextChange = (event) => {
        setText(event.target.value);
    };

    // Submit
    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        if (file) {
            formData.append('image', file);
        }
        formData.append('text', text);

        try {
            console.log("submitted!"); // print out a success message
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                // Wait for fetch data in json type
                const result = await response.json();
                // If success print out
                console.log('AI generated image:', result);
            } else {
                console.error('Upload failed');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div style={{ backgroundImage:'url("../images/black-1.jpg")',backgroundSize: 'cover',
            backgroundPosition: 'center', color: 'black', minHeight: '100vh', padding: '20px' }}>
            {/* Cover image */}
            <center>
                {/* Page Heading */}
                <h1 className="tittle">ARTY</h1>
                {/* Here is the text upload */}
                <form data-mdb-input-init class="form-outline" onSubmit={handleSubmit}>
                    {/* Here is the image upload */}   
                    <FileUploader handleChange={handleChange} name="file" types={fileTypes}/>
                    <div style={{ marginTop: '20px' }}>
                    {file && (
                        <div>
                            <h2 className="description">Uploaded Image:</h2>
                            {/* The uploaded image will appear here */}  
                            <img src={file} alt="Uploaded" style={{ maxWidth: '40%', height: '100%' }} />
                        </div>
                        )}
                    </div>
                    <br></br>
                    <br></br>
                    <textarea class="form-control" id="textAreaExample1" rows="4"  value={text} placeholder="Enter your description here..." onChange={handleTextChange}></textarea>
                    <br></br>
                    <br></br>
                    <button className="search-btn" type="submit" value="Submit" >Upload</button>
                    <br></br>
                    <br></br>
                </form>
            </center>
        </div>
    );
}













