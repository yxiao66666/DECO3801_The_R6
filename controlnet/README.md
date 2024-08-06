# Controlnet

## Get Started

### 1. Install stable-diffusion-webui

1.  Clone AUTOMATIC1111's [stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) repository.
2.  Run `webui.bat` for windows, or run `./webui.sh` for macos.

If you run into any issue, please refer to the original documentory [here](https://github.com/AUTOMATIC1111/stable-diffusion-webui).

### 2. Install Controlnet Extension

1. Start stable-diffusion-webui by running `webui.bat` or `./webui.sh`.
2. Navige to the "Extensions" page
3. Select the Install from URL tab, and put in the following URL:

   `https://github.com/Mikubill/sd-webui-controlnet`

   And click the install button.

4. Wait for the confirmation message and then restart the webui.

### 3. Download Model Weights

- [v1-5-pruned.ckpt](https://huggingface.co/runwayml/stable-diffusion-v1-5/tree/main)
- [sd1.5 controlnet models](https://huggingface.co/lllyasviel/ControlNet-v1-1/tree/main)

## References

This project utilizes components and code from the following repositories:

- [stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) by AUTOMATIC1111
- [sd-webui-controlnet](https://github.com/Mikubill/sd-webui-controlnet) by Mikubill

### stable-diffusion-webui

We use this repository as the backend for our project. This repository provides the essential backend functionalities and optimisations to interact with Controlnet.

### Mikubill/sd-webui-controlnet

The Controlnet extension for stable-diffusion-webui.
