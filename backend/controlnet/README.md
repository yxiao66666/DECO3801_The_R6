# Controlnet

The backbone for Stable Diffuion 1.5 with ControlNet.

-   `sd_backbone.py` contains all methods related to the stable diffusion backbone.
-   `test_backbone.ipynb` contains some tests and example usages.

Here is a graph of the Stable Diffuion backbone pipeline:

<img src = '..\images\sd_pipeline.png' alt = 'stable diffusion backbone pipeline'>

## Get Started

### 1. Install stable-diffusion-webui

1.  Clone AUTOMATIC1111's [stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) repository.
2.  Run `webui.bat` for windows, or run `./webui.sh` for macos.

If you run into any issue, please refer to the original document [here](https://github.com/AUTOMATIC1111/stable-diffusion-webui).

### 2. Install Controlnet Extension

1. Start stable-diffusion-webui by running `webui.bat` or `./webui.sh`.
2. Navige to the "Extensions" page.
3. Select the Install from URL tab, and put in the following URL:

    `https://github.com/Mikubill/sd-webui-controlnet`

    And click the install button.

4. Wait for the confirmation message and then restart the webui.

### 3. Download Model Weights

-   ~~[v1-5-pruned.ckpt](https://huggingface.co/runwayml/stable-diffusion-v1-5/tree/main)~~ (Original repo was deprecated.)
-   [v1-5-pruned.ckpt](https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5)
-   [sd1.5 controlnet models](https://huggingface.co/lllyasviel/ControlNet-v1-1/tree/main)

## References

The backbone utilises components and code from the following repositories:

1. **ControlNet Extension for Stable Diffusion Web UI**:
    - [Mikubill ControlNet GitHub Repository](https://github.com/Mikubill/sd-webui-controlnet)
2. **Stable Diffusion v1.5**:
    - [Hugging Face: Stable Diffusion v1.5](https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5)
3. **Stable Diffusion Web UI**:
    - [AUTOMATIC1111 GitHub Repository](https://github.com/AUTOMATIC1111/stable-diffusion-webui)
