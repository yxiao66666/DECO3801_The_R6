import React, { useState, useEffect, useRef } from "react";
import "../styles/Upload.css";

export default function Upload() {
    const [files, setFiles] = useState([]);
    const [text, setText] = useState('');
    const [textvisible, setTextVisible] = useState(false);
    const [previews, setPreviews] = useState([]); 
    const [aiOptions, setAiOptions] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [originalWidth, setOriginalWidth] = useState(0);
    const [originalHeight, setOriginalHeight] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageChosen, setChosen] = useState(false);
    const [showCanvas, setShowCanvas] = useState(false);
    const [isDrawingEnd, setIsDrawingEnd] = useState(false);
    // State to handle loading indicator
    const [loading, setLoading] = useState(false);

    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [rect, setRects] = useState([]);

    const undoStack = useRef([]);
    const canvasRef = useRef(null);
    const drawingCanvasRef = useRef(null);
    // Base URL for API requests
    const baseUrl = 'http://127.0.0.1:5000';

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

    // Original handleChange function to handle file uploads
    const handleChange = (event) => {
        const selectedFiles = event.target.files;
        if (selectedFiles.length > 0) {
            if(selectedFiles.length > 3) {
                alert("Please choose no more than 3 images");
                return
            }
            setFiles(Array.from(selectedFiles));
            const newPreviews = Array.from(selectedFiles).map(file => URL.createObjectURL(file));
            setPreviews(newPreviews);
        }
    };

    const handleClick = () => {
        if(textvisible) {
            setText('');
        }
        setTextVisible(prev => !prev);
    }

    // handleCanvasChange for uploading and placing image on the canvas
    const handleCanvasChange = (event) => {
        const selectedImage = event.target.files[0];
        if (selectedImage ) {
            const img = new Image();
            img.src = URL.createObjectURL(selectedImage);
            img.onload = () => {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                
                const canvasAspectRatio = canvas.width / canvas.height;
                const imgAspectRatio = img.width / img.height;

                let drawWidth, drawHeight;

                if (imgAspectRatio > canvasAspectRatio) {
                    drawWidth = canvas.width;
                    drawHeight = drawWidth / imgAspectRatio;
                } else {
                    drawHeight = canvas.height;
                    drawWidth = drawHeight * imgAspectRatio;
                }

                const offsetX = (canvas.width - drawWidth) / 2;
                const offsetY = (canvas.height - drawHeight) / 2;

                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

                setSelectedImage(selectedImage);
                setOriginalWidth(img.width);
                setOriginalHeight(img.height);
                setChosen(true);

                // Reset mask canvas for drawing
                const drawingCanvas = drawingCanvasRef.current;
                drawingCanvas.width = img.width;
                drawingCanvas.height = img.height;
                const drawingCtx = drawingCanvas.getContext('2d');
                drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            };
        }
    };

    // drawing functions on both the visible and hidden canvas
    const startDrawing = (e) => {
        e.preventDefault();
        if(!selectedImage){
            alert("Please choose an image first");
            return;
        }
        else{
            setIsDrawing(true);
            setIsDrawingEnd(false);
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();

            //correct mousedown position
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setStartPos({ x, y });
            setRects(prev => [...prev, { x, y, width: 0, height: 0 }]);
        }
    }

    const draw = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rectBounds = canvas.getBoundingClientRect();
    
        if (isDrawing) {
            e.preventDefault();
    
            // Get current curser position
            const currentX = e.clientX - rectBounds.left;
            const currentY = e.clientY - rectBounds.top;
    
            const width = currentX - startPos.x;
            const height = currentY - startPos.y;

            // Uploaded image
            const img = new Image();
            img.src = selectedImage; // Use the uploaded images
            img.onload = () => {
                // Redraw canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height); 
                
                // Create the rectangle for canvas
                rect.forEach(r => {
                    ctx.strokeStyle = 'black';
                    ctx.strokeRect(r.x, r.y, r.width, r.height);
                });
    
                // Size of the canvas
                ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)'; // Colour of the canvas
                ctx.strokeRect(startPos.x, startPos.y, width, height);
            };
        }
    };
    
    const stopDrawing = (e) => {
        e.preventDefault();
        setIsDrawing(false);
    
        if (!isDrawing) return;
    
        const canvas = canvasRef.current;
        const rectBounds = canvas.getBoundingClientRect();
        const width = e.clientX - rectBounds.left - startPos.x;
        const height = e.clientY - rectBounds.top - startPos.y;
    
        const newRect = { x: startPos.x, y: startPos.y, width, height };
        setRects(prev => [...prev, newRect]);

        draw(e);
    };

    const clearCanvas = () => {
        const drawingCanvas = drawingCanvasRef.current;
        const drawingCtx = drawingCanvas.getContext('2d');
        drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height); 
        setChosen(false);
        setRects([]);
    };

    const drawMask = (newRect) => {
        const drawingCanvas = drawingCanvasRef.current;
        const drawingCtx = drawingCanvas.getContext('2d');
        drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        
        // Draw white rectangle for the mask
        drawingCtx.fillStyle = 'white';
        drawingCtx.fillRect(newRect.x, newRect.y, newRect.width, newRect.height);
        
        // Ensure the rest is black
        const maskWidth = drawingCanvas.width;
        const maskHeight = drawingCanvas.height;
        drawingCtx.fillStyle = 'black';
        drawingCtx.fillRect(0, 0, maskWidth, maskHeight);

    }


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
        setLoading(true);

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
    <div style={{backgroundColor:'black', minHeight:'100vh'}}>
        <center>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <div className="container" style={{ margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
                    <br/>
                    <div className="avatar-upload" style={{ width: '100%' }}>
                        <div className="avatar-preview" style={{ width: '100%', display: 'flex', flexDirection: 'row', gap: '10px' }}>
                            {previews.length === 0 && (
                                <div id="defaultPreview" style={{ backgroundImage: 'url(/images/hum-2.gif)',invert:-1}}>
                                    <h2>-Upload your work-</h2>
                                </div>
                            )}
                            {previews.map((preview, index) => (
                                <div key={index} style={{ width: '100%', position: 'relative' }}>
                                    <div id="imagePreview" style={{backgroundImage: `url(${preview})`}}>
                                        
                                    </div>

                                    {/* Selection Box for AI Options */}
                                    <select
                                        value={aiOptions[index]}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        >
                                        <option value="AI Options">AI options</option>
                                        <option value="Inpaint">Canny</option>
                                        <option value="Canny">mlsd</option>
                                        <option value="Other">openpose_faceonly</option>
                                        <option value="Other">openpose_hand</option>
                                        <option value="Other">dw_openpose_full</option>
                                        <option value="Other">animal_openpose</option>
                                        <option value="Other">depth_anything_v2</option>
                                        <option value="Other">seg_ofade20k</option>
                                        <option value="Other">seg_anime_face</option>
                                        <option value="Other">shuffle</option>
                                        <option value="Other">t2ia_color_grid</option>
                                    </select>
                                    
                                </div>
                            ))}
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
                                <button className="function-btn" type="button" htmlFor="imageUpload" onPointerDown={() => document.getElementById('imageUpload').click()} >
                                    Browse
                                </button>
                                <button className="function-btn" type="button" onClick={() => setShowCanvas(!showCanvas)} >
                                    {showCanvas ? "No inpainting" : "With Inpainting"}
                                </button>
                                <button
                                    className="function-btn"
                                    type="button"
                                    htmlFor="textAreaExample1" onClick={handleClick} 
                                >
                                    {textvisible? "No text" : "With text"}
                                </button>
                                <input className="function-btn" type="submit" id="submit" style={{ display: 'none' }} />
                                <button className="function-btn" htmlFor="submit">
                                    Generate
                                </button>          
                            </div>
                        </div>

                        <br />
                        <br />

                        {showCanvas && (
                            <>
                                <h1 style={{color:'white'}}>Polish your work with inpainting, if you use this on iPad, two fingers double touch to move up/down the whole page</h1>
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
                                    style={{ backgroundColor:'white',display: 'start', border: '3px solid #ccc', marginTop: '10px' }}
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

                                <div style={{display:'flex', alignItems:'center',justifyContent:'center'}}>
                                    <button type="button" onPointerDown={undoLastAction} className="painting-tool" >
                                        <img src="../images/undo.png" className="painting-icon" alt="undo"/>
                                    </button>
                                    <input
                                        multiple
                                        type="file"
                                        id="canvasUpload"
                                        accept=".png, .jpg, .jpeg"
                                        onChange={handleCanvasChange}
                                        style={{ display: 'none' }}
                                    />
                                    <div style={{alignItems:'center'}}>
                                        <button className="function-btn" type="button" htmlFor="canvasUpload" onPointerDown={() => document.getElementById('canvasUpload').click()}>
                                            Choose an image
                                        </button>
                                        <button className="function-btn" type="button" onPointerDown={clearCanvas} >
                                            Clear canvas
                                        </button> 
                                    </div>
                                </div>
                            </>   
                        )}
                    </div>
                </div>

                <br></br>
                <br></br>

                {textvisible && (
                    <textarea 
                        className="form-control" 
                        id="textAreaExample1" 
                        rows="4" 
                        value={text} 
                        placeholder="Enter your description here..." 
                        onChange={e => setText(e.target.value)} 
                        style={{ width: '65%'}}
                    ></textarea>
                )} 
                <br/>
                <br/>
                {loading && (
                <div className="loading-overlay">
                    <div className="loading-container">
                        <img src="../images/loading-icon.gif" alt="Loading..." className="loading-icon" />
                    </div>
                </div>
                )}
    
            </form>
            
        </center>
        
    </div>
    
    
  );
}
