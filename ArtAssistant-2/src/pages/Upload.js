import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";

const fileTypes = ["JPG", "PNG", "GIF"];

export default function Upload() {
    const [file, setFile] = useState(null);
    const [text, setText] = useState('');

    const handleChange = (file) => {
        const reader = new FileReader();
        reader.onload=(e)=>
            {
                setFile(e.target.result);

            }
        reader.readAsDataURL(file)};

    const handleTextChange = (event) => {
        setText(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        

        const formData = new FormData();
        if (file) {
            formData.append('image', file);
        }
        formData.append('text', text);

        try {
            console.log("submitted!");
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                console.log('AI generated image:', result);
            } else {
                console.error('Upload failed');
            }
        } catch (error) {
            console.error('Error:', error);
        }
        
        
    };

  return (
    <div style={{ backgroundImage:'url("../images/Sketch.png")',backgroundColor: 'black', color: 'white', backgroundSize: 'cover',
        backgroundPosition: 'center', minHeight: '100vh', padding: '20px' }}>
        <center>
            <h1 style={{fontFamily:'serif', fontSize:'18vw', color:'white'}}>ARTY</h1>

            {/* Here is the text upload */}
            <form data-mdb-input-init class="form-outline" onSubmit={handleSubmit}>
                {/* Here is the image upload */}   
                <FileUploader handleChange={handleChange} name="file" types={fileTypes}/>

                <div style={{ marginTop: '20px' }}>
                {file && (
                    <div>
                        <h2 className="description">Uploaded Image:</h2>
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
            </form>


        </center>
    </div>

  );
}













