import React, { useState, useEffect} from "react";



export default function Upload() {
    const [files, setFiles] = useState([]);
    const [text, setText] = useState('');
    const [previews, setPreviews] = useState([]); 
    const [aiOptions, setAiOptions] = useState([]);
    const [inpaint, setInpaint] = useState(null);

    useEffect(() => {
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
        setAiOptions(new Array(files.length).fill('AI Options'));
        return () => newPreviews.forEach(preview => URL.revokeObjectURL(preview));
    }, [files]);

    const handleChange = (event) => {
        const selectedFiles = event.target.files; 
        if (selectedFiles.length > 0) {
            setFiles(Array.from(selectedFiles)); 
        } else {
            console.warn("No file selected or the selected files are not valid.");
        }
    };

    const handleTextChange = (event) => {
        setText(event.target.value);
    };

    const handleOptionChange = (index, value) => {
        const updatedOptions = [...aiOptions];
        updatedOptions[index] = value;
        setAiOptions(updatedOptions);
        if (value === "Inpaint") {
            setInpaint(index); 
        } else if (inpaint === index) {
            setInpaint(null); 
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        

        const formData = new FormData();
        if (files.length > 0) {
            files.forEach((file,index) => {
                formData.append(`image${index}`,file);
                formData.append(`option${index}`, aiOptions[index]);
            });
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
        backgroundPosition: 'center', minHeight: '100vh'}}>
        <center>
            {/* Here is the text upload */}
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <div className="container" style={{ margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
                        <h2>Want AI pictures? Upload your work here!</h2>
                        <div className="avatar-upload" style={{width:'100%'}}>
                            <div className="avatar-preview" style={{width:'100%',display:'flex',flexDirection:'row',gap:'10px'}}>
                                {previews.length === 0 && (
                                        <div
                                            id="defaultPreview"
                                            style={{
                                                width: '70%',
                                                height: '33em',
                                                justifyContent:'center',
                                                alignItems:'center',
                                                margin:'0% auto',
                                                backgroundImage: 'url(/images/hum-2.jpg)',
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                border: '2px solid white',
                                                borderRadius: '5px',
                                                
                                            }}
                                        >
                                        </div>
                                    )}
                                
                                
                                {previews.map((preview, index) => (
                                    <div key={index} style={{ width:'100%',position: 'relative' }}>
                                    <div
                                        id="imagePreview"
                                        style={{
                                            width: '100%',
                                            height: '20em',
                                            backgroundImage: `url(${preview})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            border: '2px solid white',
                                            borderRadius: '5px',
                                        }}
                                    >
                                    </div>
                                    {/* Selection Box for AI Options */}
                                    <select
                                        value={aiOptions[index]}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        style={{ position: 'absolute', top: '10px', right: '10px', padding: '5px', borderRadius: '5px' }}
                                    >
                                        <option value= "AI Options">AI options</option>
                                        <option value="Inpaint">Inpaint</option>
                                        <option value="Canny">Canny</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <br></br>
                                    <br></br>
                                    
                                    {/*Need to implement a inpainting canvas*/ }
                                    {inpaint === index && (
                                    <canvas style={{ margin:'auto', width: '50em', height: '50em', border: '1px solid white', marginTop: '10px' }}>
                                         {/* E component for inpainting */}
                                    </canvas>
                                
                                )}
                                    
                                </div>
                                ))}
                            </div>
                            <br></br>
                            <br></br>
                            <div className="avatar-edit">
                                <input
                                    multiple
                                    type="file"
                                    id="imageUpload"
                                    accept=".png, .jpg, .jpeg"
                                    onChange={handleChange}
                                    style={{ display: 'none' }}
                                    
                                />
                                <label htmlFor="imageUpload" style={{ cursor: 'pointer', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                                    Browse
                                </label>
                                <input
                                    type="submit"
                                    id="submit"
                                    style={{display:'none'}}
                                    
                                />                    
                            </div>

                        </div>
                    </div>
                <br></br>
                <br></br>
                <h2>Text To Image</h2>
                <textarea class="form-control" id="textAreaExample1" rows="4"  value={text} placeholder="Enter your description here..." onChange={handleTextChange} style={{width:'65%'}}></textarea>
                <br></br>
                <br></br>
                <input
                    type="submit"
                    id="submit"
                    style={{display:'none'}}
                    
                />
                <button type="submit" style={{ cursor: 'pointer', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                    Upload
                </button> 
            </form>

        </center>
    </div>

  );
}













