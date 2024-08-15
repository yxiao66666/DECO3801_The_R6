import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";

const fileTypes = ["JPG", "PNG", "GIF"];

export default function Upload() {
    const [file, setFile] = useState(null);
    const handleChange = (file) => {
        setFile(file);
    };

  return (
    <div>
        <center>
            <h1>Upload</h1>
            <p>This is the Upload page content.</p>
            
            {/* Here is the image upload */}
            <form method="post">
                <FileUploader handleChange={handleChange} name="file" types={fileTypes}/>
            </form>

            <br></br>

            {/* Here is the text upload */}
            <form data-mdb-input-init class="form-outline" method="post">
                <textarea class="form-control" id="textAreaExample1" rows="4"></textarea>
                <label class="form-label" for="textAreaExample">Enter your description here</label>
                <br></br>
                <input type="submit" value="Submit" class="submitButton" />
            </form>


        </center>
    </div>

  );
}













