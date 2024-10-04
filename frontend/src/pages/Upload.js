import React, { useState, useEffect, useRef, useCallback } from "react";
import "../styles/Upload.css";

export default function Upload() {
    const [files, setFiles] = useState([]);  // Array of selected files
    const [showClear, setShowClear] = useState(false);  // Flag to toggle the visibility of the clear button

    const [text, setText] = useState('');  // Text input state
    const [textvisible, setTextVisible] = useState(false);  // Toggle visibility of text input
    const [previews, setPreviews] = useState([]);  // Previews of the selected images
    const [aiOptions, setAiOptions] = useState([]);  // Options for AI image processing
    const [isDrawing, setIsDrawing] = useState(false);  // Flag to determine if the user is drawing on the canvas
    const [originalWidth, setOriginalWidth] = useState(0);  // Width of the selected image
    const [originalHeight, setOriginalHeight] = useState(0);  // Height of the selected image
    const [selectedImage, setSelectedImage] = useState(null);  // The currently selected image for drawing
    const [showCanvas, setShowCanvas] = useState(false);  // Flag to toggle the visibility of the canvas
    const [loading, setLoading] = useState(false);  // Loading state for the submission process
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });  // Starting position for drawing rectangles
    const [rect, setRects] = useState([]);  // Array to hold the drawn rectangles
    const [currentRect, setCurrentRect] = useState(null);  // The rectangle currently being drawn
    const canvasRef = useRef(null);  // Reference to the main canvas element
    const drawingCanvasRef = useRef(null);  // Reference to the drawing canvas element
    const undoStack = useRef([]);  // Stack to keep track of actions for undo functionality
    const [cachedImage, setCachedImage] = useState(null);  // Cached version of the selected image
    const [generatedImages, setGeneratedImages] = useState({}); // State to store AI-generated image filenames
    const baseUrl = 'http://127.0.0.1:5000';

    // Function to call the cleanup generated images
    const cleanupImages = () => {
        fetch(`${baseUrl}/backend/cleanup`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    console.log('Images cleaned up successfully.');
                } else {
                    console.error('Failed to clean up images.');
                }
            })
            .catch(error => console.error('Error during cleanup:', error));
    };
    
    // useEffect to handle the cleanup on page unload or navigation
    useEffect(() => {
        // Call cleanupImages when the component unmounts
        return () => {
            cleanupImages();
        };
    }, []); // Empty dependency array to run once on mount

    // useEffect hook to generate image previews when files are selected
    useEffect(() => {
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
        setAiOptions(new Array(files.length).fill('AI Options'));
        return () => newPreviews.forEach(preview => URL.revokeObjectURL(preview));
    }, [files]);

    // Function to draw the image and any drawn rectangles on the canvas
    const drawImageOnCanvas = useCallback((ctx) => {
        if (!cachedImage || !ctx) return;
        // Calculate scaling and offsets to center the image in the canvas
        const imgScale = Math.min(ctx.canvas.width / originalWidth, ctx.canvas.height / originalHeight);
        const offsetX = (ctx.canvas.width - originalWidth * imgScale) / 2;
        const offsetY = (ctx.canvas.height - originalHeight * imgScale) / 2;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(cachedImage, offsetX, offsetY, originalWidth * imgScale, originalHeight * imgScale);

        // Set styles for drawing rectangles
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        // Draw all the rectangles from the rect array
        rect.forEach(r => {
            ctx.fillRect(offsetX + r.x * imgScale, offsetY + r.y * imgScale, r.width * imgScale, r.height * imgScale);
            ctx.strokeRect(offsetX + r.x * imgScale, offsetY + r.y * imgScale, r.width * imgScale, r.height * imgScale);
        });

        // Draw the current rectangle if it's being drawn
        if (currentRect) {
            ctx.fillRect(offsetX + currentRect.x * imgScale, offsetY + currentRect.y * imgScale, currentRect.width * imgScale, currentRect.height * imgScale);
            ctx.strokeRect(offsetX + currentRect.x * imgScale, offsetY + currentRect.y * imgScale, currentRect.width * imgScale, currentRect.height * imgScale);
        }
    }, [cachedImage, originalWidth, originalHeight, rect, currentRect]);

    // useEffect hook to draw the image when the canvas or cached image changes
    useEffect(() => {
        if (canvasRef.current && cachedImage) {
            const ctx = canvasRef.current.getContext('2d');
            drawImageOnCanvas(ctx);
        }
    }, [cachedImage, drawImageOnCanvas]);

    // Function to update AI options when selected in the dropdown
    const handleOptionChange = (index, value) => {
        const updatedOptions = [...aiOptions];
        updatedOptions[index] = value;
        setAiOptions(updatedOptions);
    };

    // Handle file selection and enforce a maximum of 3 images
    const handleChange = (event) => {
        const selectedFiles = event.target.files;
        if (selectedFiles.length > 0) {
            if(selectedFiles.length > 3) {
                alert("Please choose no more than 3 images");
                return;
            }

            
            // Convert the FileList to an array and create object URLs for each image
            const imagePreviews = Array.from(selectedFiles).map(file => URL.createObjectURL(file));
            
            setPreviews(imagePreviews); // Update the previews state with the new image URLs
            setFiles(Array.from(selectedFiles)); // Store the selected files in the state
            setShowClear(true);

        }
    };

    // Function to clear uploaded images
    const handleClear = () => {
        setPreviews([]); // Clear the image previews
        setFiles([]); // Clear the selected files
        setShowClear(false); // Hide the clear button
        document.getElementById('imageUpload').value = null; // Clear the file input
    };

    // Toggle the visibility of the text input and clear the text if it was visible
    const handleClick = () => {
        if (textvisible) {
            setText('');
        }
        setTextVisible(prev => !prev);
    };

    // Handle selection of an image to display on the canvas
    const handleCanvasChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            const img = new Image();
            img.onload = () => {
                setOriginalWidth(img.width);
                setOriginalHeight(img.height);
                setSelectedImage(selectedFile);
                setCachedImage(img);
                const drawingCanvas = drawingCanvasRef.current;
                drawingCanvas.width = img.width;
                drawingCanvas.height = img.height;
            };
            img.src = URL.createObjectURL(selectedFile);
        }
    };

    // Clear the canvas and reset the drawn rectangles and undo stack
    const clearCanvas = () => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            setRects([]);
            setCurrentRect(null);
            undoStack.current = [];
            // Redraw the image on the cleared canvas
            if (cachedImage) {
                const imgScale = Math.min(ctx.canvas.width / originalWidth, ctx.canvas.height / originalHeight);
                const offsetX = (ctx.canvas.width - originalWidth * imgScale) / 2;
                const offsetY = (ctx.canvas.height - originalHeight * imgScale) / 2;
                ctx.drawImage(cachedImage, offsetX, offsetY, originalWidth * imgScale, originalHeight * imgScale);
            }
        }
    };

    // Undo the last drawn rectangle
    const undoLastAction = () => {
        if (rect.length > 0) {
            const newRects = rect.slice(0, -1);
            setRects(newRects);
            undoStack.current.push(rect[rect.length - 1]);

            if (canvasRef.current && cachedImage) {
                const ctx = canvasRef.current.getContext('2d');
                drawImageOnCanvas(ctx);
            }
        }
    };

    // Start drawing a rectangle when the user clicks on the canvas
    const startDrawing = (e) => {
        if (!selectedImage) {
            alert("Please choose image first");
            return;
        }
        setIsDrawing(true);
        const canvas = canvasRef.current;
        const rectBounds = canvas.getBoundingClientRect();
        const imgScale = Math.min(canvas.width / originalWidth, canvas.height / originalHeight);
        const offsetX = (canvas.width - originalWidth * imgScale) / 2;
        const offsetY = (canvas.height - originalHeight * imgScale) / 2;

        const x = (e.clientX - rectBounds.left - offsetX) / imgScale;
        const y = (e.clientY - rectBounds.top - offsetY) / imgScale;

        setStartPos({ x, y });
        setCurrentRect({ x, y, width: 0, height: 0 });
    };

    // Finish drawing a rectangle when the user releases the mouse
    const draw = (e) => {
        if (!isDrawing || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const imgScale = Math.min(canvas.width / originalWidth, canvas.height / originalHeight);
        const offsetX = (canvas.width - originalWidth * imgScale) / 2;
        const offsetY = (canvas.height - originalHeight * imgScale) / 2;

        const currentX = (e.clientX - canvas.getBoundingClientRect().left - offsetX) / imgScale;
        const currentY = (e.clientY - canvas.getBoundingClientRect().top - offsetY) / imgScale;
        const width = currentX - startPos.x;
        const height = currentY - startPos.y;

        setCurrentRect({ ...currentRect, width, height });

        drawImageOnCanvas(ctx);
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);

        if (currentRect && currentRect.width !== 0 && currentRect.height !== 0) {
            setRects(prev => [...prev, currentRect]); // Add the new rectangle to the array
            setCurrentRect(null);
        }

        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            // Redraw the canvas with the updated rectangles
            drawImageOnCanvas(ctx);
        }
    };

    // Handle file submission and send the selected files and drawn rectangles to the backend
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        const drawingCanvas = drawingCanvasRef.current;
        const formData = new FormData();
    
        if (files.length > 0) {
            files.forEach((file, index) => {
                // Logging the files and options
                console.log(`Appending file: ${file.name}, Option: ${aiOptions[index]}`);
                formData.append(`image${index}`, file);
                formData.append(`option${index}`, aiOptions[index]);
            });
        }
    
        formData.append('text', text);
        if (selectedImage && drawingCanvas) {
            const exportCanvas = document.createElement('canvas');
            exportCanvas.width = originalWidth;
            exportCanvas.height = originalHeight;
            const exportCtx = exportCanvas.getContext('2d');
            exportCtx.fillStyle = '#000000';
            exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
            exportCtx.fillStyle = 'white';
            rect.forEach(r => {
                exportCtx.fillRect(r.x, r.y, r.width, r.height);
            });
    
            const maskBlob = await new Promise((resolve, reject) => {
                exportCanvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error("Mask toBlob failed"));
                    }
                }, 'image/png');
            });
            formData.append('maskImage', maskBlob);
            formData.append('canvasImage', selectedImage);
        }
    
        // Debugging the formData
        for (let pair of formData.entries()) {
            console.log(`${pair[0]}: ${pair[1] instanceof Blob ? pair[1].name : pair[1]}`);
        }
    
        try {
            const response = await fetch(`${baseUrl}/backend/upload`, {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                const result = await response.json();
                console.log('AI generated image:', result);
                setGeneratedImages(result); // Update state with the generated images
            } else {
                console.error('Upload failed');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: 'black', minHeight: '100vh' }}>
            <center>
                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <div className="container" style={{ margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
                        <br />
                        <div className="avatar-upload" style={{ width: '100%' }}>
                            <div className="avatar-preview" style={{ width: '100%', display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                {previews.length === 0 && (
                                    <div id="defaultPreview" style={{ backgroundImage: 'url(/images/hum-2.gif)' }}>
                                        <h2>-Upload your work-</h2>
                                    </div>
                                )}
                            
                                {previews.map((preview, index) => (
                                    <div key={index} style={{ width: '100%', position: 'relative' }}>
                                        <div id="imagePreview" style={{ backgroundImage: `url(${preview})` }}></div>

                                        <select
                                            value={aiOptions[index]}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                        >
                                            <option value="AI Options">AI options</option>
                                            <optgroup label="Edge Detection">
                                                <option value="canny|low">Canny (Low Intensity)</option>
                                                <option value="canny|balanced">Canny (Balance Intensity)</option>
                                                <option value="canny|high">Canny (High Intensity)</option>
                                            </optgroup>
                                            <optgroup label="Architechure">
                                                <option value="mlsd|low">mlsd (Low Intensity)</option>
                                                <option value="mlsd|balanced">mlsd (Balance Intensity)</option>
                                                <option value="mlsd|high">mlsd (High Intensity)</option>
                                            </optgroup>
                                            <optgroup label="Face">
                                                <option value="openpose_faceonly|low">openpose_faceonly (Low Intensity)</option>
                                                <option value="openpose_faceonly|balanced">openpose_faceonly (Balance Intensity)</option>
                                                <option value="openpose_faceonly|high">openpose_faceonly (High Intensity)</option>
                                            </optgroup>
                                            <optgroup label="Hand">
                                                <option value="openpose_hand|low"> openpose_hand (Low Intensity)</option>
                                                <option value="openpose_hand|balanced">openpose_hand (Balance Intensity)</option>
                                                <option value="openpose_hand|high">openpose_hand (High Intensity)</option>
                                            </optgroup>
                                            <optgroup label="Full Pose">
                                                <option value="dw_openpose_full|low">dw_openpose_full (Low Intensity)</option>
                                                <option value="dw_openpose_full|balanced">dw_openpose_full (Balance Intensity)</option>
                                                <option value="dw_openpose_full|high">dw_openpose_full (High Intensity)</option>
                                            </optgroup>
                                            <optgroup label="Animal Pose">
                                                <option value="animal_openpose|low">animal_openpose (Low Intensity)</option>
                                                <option value="animal_openpose|balanced">animal_openpose (Balance Intensity)</option>
                                                <option value="animal_openpose|high">animal_openpose (High Intensity)</option>
                                            </optgroup>
                                            <optgroup label="Depth">
                                                <option value="depth_anything_v2|low">depth_anything_v2 (Low Intensity)</option>
                                                <option value="depth_anything_v2|balanced">depth_anything_v2 (Balance Intensity)</option>
                                                <option value="depth_anything_v2|high">depth_anything_v2 (High Intensity)</option>
                                            </optgroup>
                                            <optgroup label="Segmentation">
                                                <option value="seg_ofade20k|low">seg_ofade20k (Low Intensity)</option>
                                                <option value="seg_ofade20k|balanced">seg_ofade20k (Balance Intensity)</option>
                                                <option value="seg_ofade20k|high">seg_ofade20k (High Intensity)</option>
                                            </optgroup>
                                            <optgroup label="Segmentation Anime">
                                                <option value="seg_anime_face|low">seg_anime_face (Low Intensity)</option>
                                                <option value="seg_anime_face|balanced">seg_anime_face (Balance Intensity)</option>
                                                <option value="seg_anime_face|high">seg_anime_face (High Intensity)</option>
                                            </optgroup>
                                            <optgroup label="Color Palatte">
                                                <option value="shuffle|low">shuffle (Low Intensity)</option>
                                                <option value="shuffle|balanced">shuffle (Balance Intensity)</option>
                                                <option value="shuffle|high">shuffle (High Intensity)</option>
                                            </optgroup>
                                            <optgroup label="Color Composition">
                                                <option value="t2ia_color_grid|low">t2ia_color_grid (Low Intensity)</option>
                                                <option value="t2ia_color_grid|balanced">t2ia_color_grid (Balance Intensity)</option>
                                                <option value="t2ia_color_grid|high">t2ia_color_grid (High Intensity)</option>
                                            </optgroup>
                                        </select>
                                    </div>
                                ))}
                                <br />
                                <br />
                                <div className="avatar-edit">
                                    <input
                                        multiple
                                        type="file"
                                        id="imageUpload"
                                        accept=".png, .jpg, .jpeg"
                                        onChange={handleChange}
                                        style={{ display: 'none' }}
                                    />

                                    {/* Button that toggles between Browse and Clear */}
                                    <button 
                                        className="function-btn" 
                                        type="button" 
                                        onClick={() => {
                                            if (showClear) {
                                                handleClear(); // Call handleClear when Clear is shown
                                            } else {
                                                document.getElementById('imageUpload').click(); // Trigger file input click when Browse is shown
                                            }
                                        }}
                                    >
                                        {showClear ? "Clear" : "Browse"} {/* Toggle button text */}
                                    </button>
                                    <button className="function-btn" type="button" onClick={() => setShowCanvas(!showCanvas)}>
                                        {showCanvas ? "No inpainting" : "With Inpainting"}
                                    </button>
                                    <button
                                        className="function-btn"
                                        type="button"
                                        onClick={handleClick}
                                    >
                                        {textvisible ? "No text" : "With text"}
                                    </button>
                                    <input className="function-btn" type="submit" id="submit" style={{ display: 'none' }} />
                                    <button className="function-btn" type="submit">
                                        Generate
                                    </button>
                                </div>
                            </div>
                            <br />
                            <br />

                            {showCanvas && (
                                <>
                                    <h1 style={{ color: 'white' }}>Polish your work with inpainting</h1>
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
                                        style={{ backgroundColor: 'white', display: 'start', border: '3px solid #ccc', marginTop: '10px' }}
                                    />
                                    <canvas
                                        ref={drawingCanvasRef}
                                        width="500"
                                        height="500"
                                        style={{ display: 'none' }}
                                    />
                                    <br />
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <button type="button" onClick={undoLastAction} className="painting-tool">
                                            <img src="../images/undo.png" className="painting-icon" alt="undo" />
                                        </button>
                                        <input
                                            type="file"
                                            id="canvasUpload"
                                            accept=".png, .jpg, .jpeg"
                                            onChange={handleCanvasChange}
                                            style={{ display: 'none' }}
                                        />
                                        <div style={{ alignItems: 'center' }}>
                                            <button className="function-btn" type="button" onClick={() => document.getElementById('canvasUpload').click()}>
                                                Choose an image
                                            </button>
                                            <button className="function-btn" type="button" onClick={clearCanvas}>
                                                Clear canvas
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <br />
                    <br />

                    {textvisible && (
                        <textarea
                            className="form-control"
                            id="textAreaExample1"
                            rows="4"
                            value={text}
                            placeholder="Enter your description here..."
                            onChange={e => setText(e.target.value)}
                            style={{ width: '65%' }}
                        ></textarea>
                    )}
                    
                    <br />
                    <br />

                    {/* Render the AI-generated images */}
                    {Object.keys(generatedImages).length > 0 && (
                        <div className="generated-images" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <h2 style={{ color: 'white' }}>Generated Images:</h2>
                            {Object.values(generatedImages).map((imageName, index) => (
                            <img
                                key={index}
                                src={`${baseUrl}/static/generations/${imageName}`} // No replacement needed if backend handles spaces
                                alt={`Generated ${index}`}
                                style={{ width: '300px', margin: '10px' }} // Adjust styles as needed
                            />
                            ))}
                        </div>
                    )}

                    <br />
                    <br />

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




