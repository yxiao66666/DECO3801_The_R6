import React, { useState, useEffect, useRef } from "react";

export default function Upload() {
    const [files, setFiles] = useState([]);
    const [text, setText] = useState('');
    const [previews, setPreviews] = useState([]); 
    const [aiOptions, setAiOptions] = useState([]);
    const [brushSize, setBrushSize] = useState(15);
    const [tool, setTool] = useState('brush');
    const [isDrawing, setIsDrawing] = useState(false);
    const [originalWidth, setOriginalWidth] = useState(0);
    const [originalHeight, setOriginalHeight] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageChosen, setChosen] = useState(false);
    const [showCanvas, setShowCanvas] = useState(false);

    const undoStack = useRef([]);
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const drawingCanvasRef = useRef(null);
    const drawingCtxRef = useRef(null);
    const baseUrl = 'http://127.0.0.1:5000/';

    useEffect(() => {
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
        setAiOptions(new Array(files.length).fill('AI Options'));
        return () => newPreviews.forEach(preview => URL.revokeObjectURL(preview));
    }, [files]);


    const handleOptionChange = (index, value) => {
        const updatedOptions = [...aiOptions];
        updatedOptions[index] = value;
        setAiOptions(updatedOptions);
    };

    // Initialize canvas context
    useEffect(() => {
        if(showCanvas){
            //canvas displayed for user
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            //canvas used to send to backend.
            const drawingCanvas = drawingCanvasRef.current;
            const drawingCtx = drawingCanvas.getContext('2d');

            ctxRef.current = ctx;
            drawingCtxRef.current = drawingCtx;

            ctx.lineCap = 'round';
            ctx.lineWidth = brushSize;
            ctx.strokeStyle = '#FFFFFF';

            drawingCtx.lineCap = 'round';
            drawingCtx.lineWidth = brushSize;
            drawingCtx.strokeStyle = '#FFFFFF';

        }
        
    });

 
    // Original handleChange function to handle file uploads
    const handleChange = (event) => {
        const selectedFiles = event.target.files;
        if (selectedFiles.length > 0) {
            setFiles(Array.from(selectedFiles));
            const newPreviews = Array.from(selectedFiles).map(file => URL.createObjectURL(file));
            setPreviews(newPreviews);
        }
    };

    // handleCanvasChange for uploading and placing image on the canvas
    const handleCanvasChange = (event) => {
        
        const selectedImage = event.target.files[0];
        if (selectedImage) {
            const img = new Image();
            img.src = URL.createObjectURL(selectedImage);
            img.onload = () => {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Center and scale image to fit canvas
                const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
                const x = (canvas.width / 2) - (img.width / 2) * scale;
                const y = (canvas.height / 2) - (img.height / 2) * scale;
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                setSelectedImage(selectedImage);
                setOriginalWidth(img.width);
                setOriginalHeight(img.height);
                setChosen(true);

                // Reset mask canvas for drawing
                const drawingCanvas = drawingCanvasRef.current;
                const drawingCtx = drawingCanvas.getContext('2d');
                drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            };

            
        
        }
    };

    // drawing functions on both the visible and hidden canvas
    const startDrawing = (e) => {
        e.preventDefault();
        setIsDrawing(true);
        draw(e); // Start drawing immediately
    };

    const stopDrawing = (e) => {
        e.preventDefault();
        setIsDrawing(false);
        ctxRef.current.beginPath();
        drawingCtxRef.current.beginPath(); // Reset drawing on the mask canvas
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
    
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();  // Get canvas size and position
        
        let clientX, clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        // Adjust for the scaling factor if canvas has been resized by CSS
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
    
        const x = (clientX - rect.left) * scaleX;  // Adjusting the X coordinate
        const y = (clientY - rect.top) * scaleY;   // Adjusting the Y coordinate
    
        // Draw on visible canvas
        const ctx = ctxRef.current;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.strokeStyle = tool === 'eraser' ? '#000000' : '#FFFFFF';
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    
        // Draw on hidden mask canvas
        const drawingCtx = drawingCtxRef.current;
        drawingCtx.lineWidth = brushSize;
        drawingCtx.lineCap = 'round';
        drawingCtx.strokeStyle = tool === 'eraser' ? '#000000' : '#FFFFFF'; // White strokes on mask
        drawingCtx.lineTo(x, y);
        drawingCtx.stroke();
        drawingCtx.beginPath();
        drawingCtx.moveTo(x, y);

        saveCanvasState();
    };
    

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height); 

        const drawingCanvas = drawingCanvasRef.current;
        const drawingCtx = drawingCanvas.getContext('2d');
        drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height); 
        setChosen(false);
        setSelectedImage('');
    };


    // Save the current canvas state for undo
    const saveCanvasState = () => {
        const canvas = canvasRef.current;
        undoStack.current.push(canvas.toDataURL()); // Save the current canvas state as an image URL
    };

    //what eraser does
    const undoLastAction = () => {
        if (undoStack.current.length > 0) {
            const lastState = undoStack.current.pop();
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = lastState;
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
                ctx.drawImage(img, 0, 0); // Redraw the previous state
            };
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


    
    // Handle file upload and submit together
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Export the mask (hidden canvas) as a black and white image
        const drawingCanvas = drawingCanvasRef.current;
        if ((!(selectedImage)) || (!(drawingCanvas))){
            // Create form data for file upload and AI options
            const formData = new FormData();
            if (files.length > 0) {
                files.forEach((file, index) => {
                    formData.append(`image${index}`, file);
                    formData.append(`option${index}`, aiOptions[index]);
                });
            }

            // Add text description
            formData.append('text', text);
            try {
                console.log("submitted!");
                const response = await fetch(`${baseUrl}/backend/upload`, {
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
            
        }
        else
        {
            // Create form data for file upload and AI options
            const formData = new FormData();
            if (files.length > 0) {
                files.forEach((file, index) => {
                    formData.append(`image${index}`, file);
                    formData.append(`option${index}`, aiOptions[index]);
                });
            }

            // Add text description
            formData.append('text', text);

            
            // Export the mask (hidden canvas) as a black and white image
            const exportCanvas = document.createElement('canvas');
            exportCanvas.width = originalWidth;
            exportCanvas.height = originalHeight;
            const exportCtx = exportCanvas.getContext('2d');

            // Fill with black background
            exportCtx.fillStyle = '#000000';
            exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

            // Draw only the white strokes from the hidden canvas
            const scale = Math.min(canvasRef.current.width / originalWidth, canvasRef.current.height / originalHeight);
            const scaledWidth = originalWidth * scale;
            const scaledHeight = originalHeight * scale;
            const offsetX = (canvasRef.current.width - scaledWidth) / 2;
            const offsetY = (canvasRef.current.height - scaledHeight) / 2;

            exportCtx.drawImage(drawingCanvasRef.current, 
                offsetX, offsetY, scaledWidth, scaledHeight, 
                0, 0, originalWidth, originalHeight
            );

            
            const maskBlob = await new Promise((resolve, reject) => {
                exportCanvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error("Mask toBlob failed"));
                    }
                }, 'image/png');
            }).catch((error) => {
                console.error("Failed to generate mask blob:", error);
                return null; 
            });
 
            formData.append('maskImage', maskBlob);
            formData.append('canvasImage', selectedImage);  
            try {
                console.log("submitted!");
                const response = await fetch(`${baseUrl}/backend/upload`, {
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
        

        
        
    };

    

    return (
    <div style={{ backgroundImage: 'url("../images/Sketch.png")', backgroundColor: 'black', color: 'white', backgroundSize: 'cover',
        backgroundPosition: 'center', minHeight: '100vh'}}>
        <center>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <div className="container" style={{ margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
                    <h2>Want AI pictures? Upload your work here!</h2>
                    <div className="avatar-upload" style={{ width: '100%' }}>
                        <div className="avatar-preview" style={{ width: '100%', display: 'flex', flexDirection: 'row', gap: '10px' }}>
                            {previews.length === 0 && (
                                <div id="defaultPreview" style={{
                                    width: '70%', height: '33em', justifyContent: 'center', alignItems: 'center',
                                    margin: '0% auto', backgroundImage: 'url(/images/hum-2.jpg)',
                                    backgroundSize: 'cover', backgroundPosition: 'center', border: '2px solid white', borderRadius: '5px'}}>
                                </div>
                            )}
                            {previews.map((preview, index) => (
                                <div key={index} style={{ width: '100%', position: 'relative' }}>
                                    <div id="imagePreview" style={{
                                        width: '100%', height: '20em', backgroundImage: `url(${preview})`,
                                        backgroundSize: 'cover', backgroundPosition: 'center', border: '2px solid white', borderRadius: '5px'}}>
                                    </div>

                                    {/* Selection Box for AI Options */}
                                    <select
                                        value={aiOptions[index]}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        style={{ position: 'absolute', top: '10px', right: '10px', padding: '5px', borderRadius: '5px' }}>
                                        <option value="AI Options">AI options</option>
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
                            <label htmlFor="imageUpload" style={{ cursor: 'pointer', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', color: 'white' }}>
                                Browse
                            </label>
                            <button type="button" onClick={() => setShowCanvas(!showCanvas)} style={{ backgroundColor:'black', color:'white',cursor: 'pointer', padding: '10px', border: '1px solid #ccc', borderRadius: '5px',marginLeft:'5px', }}>
                                {showCanvas ? "No inpainting" : "With Inpainting"}
                            </button>                   
                        </div>

                        

                        <br />
                        <br />
                        {showCanvas && (
                            <>
                                <h1>Polish your work with inpainting, if you use this on iPad, two fingers double touch to move up/down the whole page</h1>
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
                                <canvas 
                                    ref={drawingCanvasRef} 
                                    onMouseDown={startDrawing}
                                    onMouseUp={stopDrawing}
                                    onMouseMove={draw}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                    onTouchStart={startDrawing}
                                    width="500" 
                                    height="500" 
                                    style={{display:'none'}}
                                />
        
                                <br/>
                                <div>
                                    <button type="button" onClick={() => setTool('brush')} className="search-btn" style={{ marginRight: '10px'}}>
                                        <img src="../images/brush.png" className="painting-icon" alt="brush"/>
                                    </button>
                                    <button type="button" onPointerDown={undoLastAction} className="search-btn" style={{ marginRight: '10px' }}>
                                        <img src="../images/eraser.jpg" className="painting-icon" alt="undo"/>
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
                                    <label htmlFor="canvasUpload" onPointerDown={() => document.getElementById('canvasUpload').click()} style={{ cursor: 'pointer', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                                        Choose an image
                                    </label>
                                    <button type="button" onPointerDown={clearCanvas} style={{ backgroundColor:'black', color:'white',cursor: 'pointer', padding: '10px', border: '1px solid #ccc', borderRadius: '5px',marginLeft:'3px', }}>
                                        Clear canvas
                                    </button>  
                                
                                </div>
                            </>   
                        )}
                        
                    </div>
                </div>

                <br></br>
                <br></br>

                <h2>Add Text</h2>
                <textarea className="form-control" id="textAreaExample1" rows="4" value={text} placeholder="Enter your description here..." onChange={e => setText(e.target.value)} style={{ width: '65%' }}></textarea>
                
                <br></br>
                <br></br>

                <input type="submit" id="submit" style={{ display: 'none' }} />
                <label htmlFor="submit" style={{ cursor: 'pointer', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', color: 'white'}}>
                    Generate
                </label>
    
            </form>
            
        </center>
        
    </div>
    
  );
}