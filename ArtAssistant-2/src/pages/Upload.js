import React, { useState, useEffect, useRef} from "react";



export default function Upload() {
    const [files, setFiles] = useState([]);
    const [text, setText] = useState('');
    const [previews, setPreviews] = useState([]); 
    const [aiOptions, setAiOptions] = useState([]);
    const [inpaint, setInpaint] = useState(null);

    const [tool, setTool] = useState('brush'); 
    const [brushSize, setBrushSize] = useState(15); 
    const [brushColor, setBrushColor] = useState('#000000'); 
    const [imageChosen, setChosen] = useState(false)
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
        setAiOptions(new Array(files.length).fill('AI Options'));
        return () => newPreviews.forEach(preview => URL.revokeObjectURL(preview));
    }, [files]);

    //for canvas.
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctxRef.current = ctx;
        ctx.lineCap = 'round';
        ctx.lineWidth = brushSize;
        ctx.strokeStyle = 'rgba(255,255,248, 0.3)';

    }, [brushSize]);

    const handleChange = (event) => {
        const selectedFiles = event.target.files; 
        if (selectedFiles.length > 0) {
            setFiles(Array.from(selectedFiles));

            
        } else {
            console.warn("No file selected or the selected files are not valid.");
        }
    };

    const handleCanvasChange = (event) => {
        const selectedImage = event.target.files[0]; 
        if (selectedImage) {
            const img = new Image();
            img.src = URL.createObjectURL(selectedImage);
            img.onload = () => {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height); 
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height); 
            };
            setChosen(true);


            
        } else {
            setChosen(false);
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

     // drawing on canvas
     const startDrawing = (e) => {
        e.preventDefault();
        const { offsetX, offsetY } = getPointerPosition(e);
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };


    const draw = (e) => {
        
        if (!isDrawing) return;
        e.preventDefault();
        const { offsetX, offsetY } = getPointerPosition(e);
        ctxRef.current.lineTo(offsetX, offsetY);
        ctxRef.current.stroke();
    };

    const stopDrawing = (e) => {
        e.preventDefault();
        ctxRef.current.closePath();
        setIsDrawing(false);
    };

    const getPointerPosition = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect(); 

        const scaleX = canvas.width / rect.width;   
        const scaleY = canvas.height / rect.height;  

        if (e.touches) {
            const touch = e.touches[0];
            return {
                offsetX: (touch.clientX - rect.left) * scaleX,  
                offsetY: (touch.clientY - rect.top) * scaleY  
            };
        } else {
            return {
                offsetX: (e.clientX - rect.left) * scaleX,
                offsetY: (e.clientY - rect.top) * scaleY 
            };
        }
    };

    const changeTool = (toolName) => {
        setTool(toolName);
        if (toolName === 'eraser') {
            ctxRef.current.strokeStyle = 'black'; 
        } else {
            ctxRef.current.strokeStyle = brushColor;
        }
    };

    useEffect(() => {
        if (imageChosen) {
            const preventScroll = (e) => e.preventDefault();
            document.body.addEventListener('touchmove', preventScroll, { passive: false });
            return () => {
                document.body.removeEventListener('touchmove', preventScroll);
            };
        }
    }, [imageChosen]);


    const handleSubmit = async (event) => {
        event.preventDefault();
        
        // add option available images
        const formData = new FormData();
        if (files.length > 0) {
            files.forEach((file,index) => {
                formData.append(`image${index}`,file);
                formData.append(`option${index}`, aiOptions[index]);
            });
        }

        //add text description
        formData.append('text', text);

        const canvas = canvasRef.current;
        const canvasBlob = await new Promise((resolve, reject) => {   
            canvas.toBlob((blob) => {
                
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error("Canvas toBlob failed"));
                }
            }, 'image/png');
        }).catch((error) => {
            console.error("Failed to generate canvas blob:", error);
            return null; 
        });
    
        if (canvasBlob) {
            formData.append('canvasImage', canvasBlob, 'canvasImage.png');
        }
        

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
                                
                                    </div>
                                ))}
                            </div>
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
                            </div>
                            <br></br>
                            <br></br>
                            <br />
                            <br />

                            <h1>Polish your work with inpainting, if you use this on ipad, two fingers double touch to move up/down the whole page</h1>
                            <canvas
                                ref={canvasRef}
                                onMouseDown={startDrawing}
                                onMouseUp={stopDrawing}
                                onMouseMove={draw}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                onTouchStart={startDrawing}
                                width="800"
                                height="600"
                                style={{ backgroundColor:'white',display: 'start', width: '50em', height: '50em', border: '1px solid white', marginTop: '10px' }}
                            />
                            <br />
                            <div>
                                <button type="button" onClick={() => changeTool('brush')} className="search-btn" style={{ marginRight: '10px'}}>
                                    <img src="../images/png-transparent-paintbrush-painting-black-brush-s-hand-monochrome-head.png" className="painting-icon"></img>
                                </button>
                                <button type="button" onClick={() => changeTool('eraser')} className="search-btn" style={{ marginRight: '10px' }}>
                                    <img src="../images/be6c2fe2ca4a392ca28be1acc4f8ad44.jpg" className="painting-icon"></img>
                                </button>
                                <label>Brush Size:</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    value={brushSize}
                                    onChange={(e) => setBrushSize(e.target.value)}
                                    style={{ marginLeft: '10px', marginRight:'10px'}}
                                />

                                <input
                                    multiple
                                    type="file"
                                    id="canvasUpload"
                                    accept=".png, .jpg, .jpeg"
                                    onChange={handleCanvasChange}
                                    style={{ display: 'none' }}
                                    
                                />
                                <label htmlFor="canvasUpload" style={{ cursor: 'pointer', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                                    Choose an image
                                </label>  
                                
                                
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
                <label htmlFor="submit" style={{ cursor: 'pointer', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                    Generate
                </label> 
            </form>

        </center>
    </div>

  );
}






















