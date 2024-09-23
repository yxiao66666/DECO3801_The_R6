import React, { useState, useEffect, useRef, useCallback } from "react";
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
    const [showCanvas, setShowCanvas] = useState(false);
    const [loading, setLoading] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [rect, setRects] = useState([]);
    const [currentRect, setCurrentRect] = useState(null);
    const canvasRef = useRef(null);
    const drawingCanvasRef = useRef(null);
    const undoStack = useRef([]);
    const [cachedImage, setCachedImage] = useState(null);

    const baseUrl = 'http://127.0.0.1:5000';

    useEffect(() => {
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
        setAiOptions(new Array(files.length).fill('AI Options'));
        return () => newPreviews.forEach(preview => URL.revokeObjectURL(preview));
    }, [files]);

    const drawImageOnCanvas = useCallback((ctx) => {
        if (!cachedImage || !ctx) return;

        const imgScale = Math.min(ctx.canvas.width / originalWidth, ctx.canvas.height / originalHeight);
        const offsetX = (ctx.canvas.width - originalWidth * imgScale) / 2;
        const offsetY = (ctx.canvas.height - originalHeight * imgScale) / 2;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(cachedImage, offsetX, offsetY, originalWidth * imgScale, originalHeight * imgScale);

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        rect.forEach(r => {
            ctx.fillRect(offsetX + r.x * imgScale, offsetY + r.y * imgScale, r.width * imgScale, r.height * imgScale);
            ctx.strokeRect(offsetX + r.x * imgScale, offsetY + r.y * imgScale, r.width * imgScale, r.height * imgScale);
        });

        if (currentRect) {
            ctx.fillRect(offsetX + currentRect.x * imgScale, offsetY + currentRect.y * imgScale, currentRect.width * imgScale, currentRect.height * imgScale);
            ctx.strokeRect(offsetX + currentRect.x * imgScale, offsetY + currentRect.y * imgScale, currentRect.width * imgScale, currentRect.height * imgScale);
        }
    }, [cachedImage, originalWidth, originalHeight, rect, currentRect]);

    useEffect(() => {
        if (canvasRef.current && cachedImage) {
            const ctx = canvasRef.current.getContext('2d');
            drawImageOnCanvas(ctx);
        }
    }, [cachedImage, drawImageOnCanvas]);

    const handleOptionChange = (index, value) => {
        const updatedOptions = [...aiOptions];
        updatedOptions[index] = value;
        setAiOptions(updatedOptions);
    };

    const handleChange = (event) => {
        const selectedFiles = event.target.files;
        if (selectedFiles.length > 0) {
            if(selectedFiles.length > 3) {
                alert("Please choose no more than 3 images");
                return;
            }
            setFiles(Array.from(selectedFiles));
        }
    };

    const handleClick = () => {
        if (textvisible) {
            setText('');
        }
        setTextVisible(prev => !prev);
    };

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

    const clearCanvas = () => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            setRects([]);
            setCurrentRect(null);
            undoStack.current = [];
            
            if (cachedImage) {
                const imgScale = Math.min(ctx.canvas.width / originalWidth, ctx.canvas.height / originalHeight);
                const offsetX = (ctx.canvas.width - originalWidth * imgScale) / 2;
                const offsetY = (ctx.canvas.height - originalHeight * imgScale) / 2;
                ctx.drawImage(cachedImage, offsetX, offsetY, originalWidth * imgScale, originalHeight * imgScale);
            }
        }
    };

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
            setRects(prev => [...prev, currentRect]);
            setCurrentRect(null);
        }

        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            drawImageOnCanvas(ctx);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        const drawingCanvas = drawingCanvasRef.current;
        const formData = new FormData();

        if (files.length > 0) {
            files.forEach((file, index) => {
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

        try {
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
                                            <optgroup label="Canny">
                                                <option value="Canny_low">Canny (Low Intensity)</option>
                                                <option value="Canny_medium">Canny (Medium Intensity)</option>
                                                <option value="Canny_high">Canny (High Intensity)</option>
                                            </optgroup>
                                            <optgroup label="mlsd">
                                                <option value="mlsd_low">mlsd (Low Intensity)</option>
                                                <option value="mlsd_medium">mlsd (Medium Intensity)</option>
                                                <option value="mlsd_high">mlsd (High Intensity)</option>
                                            </optgroup>
                                            <optgroup label="openpose_faceonly">
                                                <option value="openpose_faceonly_low">openpose_faceonly (Low Intensity)</option>
                                                <option value="openpose_faceonly_medium">openpose_faceonly (Medium Intensity)</option>
                                                <option value="openpose_faceonly_high">openpose_faceonly (High Intensity)</option>
                                            </optgroup>
                                            <optgroup label="openpose_hand">
                                                <option value="openpose_hand_low">openpose_hand (Low Intensity)</option>
                                                <option value="openpose_hand_medium">openpose_hand (Medium Intensity)</option>
                                                <option value="openpose_hand_high">openpose_hand (High Intensity)</option>
                                            </optgroup>
                                            <optgroup label="dw_openpose_full">
                                                <option value="dw_openpose_full_low">dw_openpose_full (Low Intensity)</option>
                                                <option value="dw_openpose_full_medium">dw_openpose_full (Medium Intensity)</option>
                                                <option value="dw_openpose_full_high">dw_openpose_full (High Intensity)</option>
                                            </optgroup>
                                            <optgroup label="animal_openpose">
                                                <option value="animal_openpose_low">animal_openpose (Low Intensity)</option>
                                                <option value="animal_openpose_medium">animal_openpose (Medium Intensity)</option>
                                                <option value="animal_openpose_high">animal_openpose (High Intensity)</option>
                                            </optgroup>
                                            <optgroup label="depth_anything_v2">
                                                <option value="depth_anything_v2_low">depth_anything_v2 (Low Intensity)</option>
                                                <option value="depth_anything_v2_medium">depth_anything_v2 (Medium Intensity)</option>
                                                <option value="depth_anything_v2_high">depth_anything_v2 (High Intensity)</option>
                                            </optgroup>
                                            <optgroup label="seg_ofade20k">
                                                <option value="seg_ofade20k_low">seg_ofade20k (Low Intensity)</option>
                                                <option value="seg_ofade20k_medium">seg_ofade20k (Medium Intensity)</option>
                                                <option value="seg_ofade20k_high">seg_ofade20k (High Intensity)</option>
                                            </optgroup>
                                            <optgroup label="seg_anime_face">
                                                <option value="seg_anime_face_low">seg_anime_face (Low Intensity)</option>
                                                <option value="seg_anime_face_medium">seg_anime_face (Medium Intensity)</option>
                                                <option value="seg_anime_face_high">seg_anime_face (High Intensity)</option>
                                            </optgroup>
                                            <optgroup label="shuffle">
                                                <option value="shuffle_low">shuffle (Low Intensity)</option>
                                                <option value="shuffle_medium">shuffle (Medium Intensity)</option>
                                                <option value="shuffle_high">shuffle (High Intensity)</option>
                                            </optgroup>
                                            <optgroup label="t2ia_color_grid">
                                                <option value="t2ia_color_grid_low">t2ia_color_grid (Low Intensity)</option>
                                                <option value="t2ia_color_grid_medium">t2ia_color_grid (Medium Intensity)</option>
                                                <option value="t2ia_color_grid_high">t2ia_color_grid (High Intensity)</option>
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
                                    <button className="function-btn" type="button" onClick={() => document.getElementById('imageUpload').click()}>
                                        Browse
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