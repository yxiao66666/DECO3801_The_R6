import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";

const fileTypes = ["JPG", "PNG", "GIF"];

export default function Upload() {
    const [file, setFile] = useState(null);
    const handleChange = (file) => {
        const reader = new FileReader();
        reader.onload=(e)=>
            {
                setFile(e.target.result);

        }
        reader.readAsDataURL(file);
        
    };

  return (
    <div>
        <center>
            <h1 className="tittle">ARTY</h1>
            {/* Here is the image upload */}
            <form method="post">
                <FileUploader handleChange={handleChange} name="file" types={fileTypes}/>
            </form>
            
            <div style={{ marginTop: '20px' }}>
                {file && (
                    <div>
                        <h2 className="description">Uploaded Image:</h2>
                        <img src={file} alt="Uploaded" style={{ maxWidth: '100%', height: 'auto' }} />
                    </div>
                )}
            </div>

            <br></br>
            <br></br>


            {/* Here is the text upload */}
            <form data-mdb-input-init class="form-outline" method="post">
                <textarea class="form-control" id="textAreaExample1" rows="4" placeholder="Enter your description here..."></textarea>
                <br></br>
                <br></br>
                <button className="search-btn" type="submit" value="Submit" >Upload</button>
            </form>


        </center>
    </div>

  );
}













