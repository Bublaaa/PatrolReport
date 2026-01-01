export const compressImages = async (
  files,
  {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.75,
    minSize = 80 * 1024,
  } = {}
) => {
  if (!Array.isArray(files)) return [];

  const results = [];

  for (const file of files) {
    if (!(file instanceof Blob) || !file.type.startsWith("image/")) {
      results.push(file);
      continue;
    }

    // ✅ Always convert non-WEBP
    if (file.type !== "image/webp" || file.size >= minSize) {
      const compressed = await resizeAndCompress(file, {
        maxWidth,
        maxHeight,
        quality,
      });
      results.push(compressed);
    } else {
      results.push(file);
    }
  }

  return results;
};

const resizeAndCompress = (file, { maxWidth, maxHeight, quality }) => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);

    reader.onload = () => {
      const img = new Image();

      img.onerror = () => resolve(file);
      img.src = reader.result;

      img.onload = () => {
        let { width, height } = img;

        if (width > height && width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              resolve(file);
              return;
            }

            resolve(
              new File([blob], file.name.replace(/\.\w+$/, ".webp"), {
                type: "image/webp",
                lastModified: Date.now(),
              })
            );
          },
          "image/webp",
          quality
        );
      };
    };
  });
};
