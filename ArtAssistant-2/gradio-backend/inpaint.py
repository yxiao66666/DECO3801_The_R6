import gradio as gr
import numpy as np
from PIL import Image

def inpaint(image: Image, mask: Image) -> Image:
    image_np = np.array(image)
    mask_np = np.array(mask)
    # Simple inpainting logic: replace masked area with a solid color for demonstration
    image_np[mask_np > 0] = [0, 255, 0]  # Green color for masked area
    return Image.fromarray(image_np)

iface = gr.Interface(
    fn=inpaint,
    inputs=["image", "image"],
    outputs="image",
    live=True
)

iface.launch(share=True)
