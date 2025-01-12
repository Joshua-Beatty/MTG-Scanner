export async function takePhotoFromStream(
    stream: MediaStream,
    box: { width: number; height: number; x: number; y: number }
  ): Promise<{ main: string; crop: string }> {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("new take photo");
        const track = stream.getVideoTracks()[0];
        //   const capabilities = track.getCapabilities();
        let imageCapture = new ImageCapture(track);
        const imageBitmap = await imageCapture.grabFrame();
  
        const canvas = document.createElement("canvas");
        canvas.width = imageBitmap.width;
        canvas.height = imageBitmap.height;
  
        // Get the 2D rendering context
        const ctx = canvas.getContext("2d");
        if (!ctx) throw "failed to create canvas";
        // Draw the ImageBitmap onto the canvas
        ctx.drawImage(imageBitmap, 0, 0);
  
        const canvas2 = document.createElement("canvas");
        canvas2.width = box.width;
        canvas2.height = box.height;
        canvas2
          .getContext("2d")
          ?.drawImage(
            canvas,
            box.x,
            box.y,
            box.width,
            box.height,
            0,
            0,
            box.width,
            box.height
          );
  
        ctx.rect(box.x, box.y, box.width, box.height);
        ctx.strokeStyle = "red";
        ctx.stroke();
  
        // Get the data URL
        resolve({ main: canvas.toDataURL(), crop: canvas2.toDataURL() });
      } catch (e) {
        console.log(e);
        reject(e);
      }
    });
  }
  