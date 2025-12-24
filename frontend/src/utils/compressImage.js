export const compressImages = async (
  files,
  {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.75,
    minSize = 80 * 1024, // 80KB
  } = {}
) => {
  if (!Array.isArray(files)) return [];

  const results = [];

  for (const file of files) {
    if (
      !(file instanceof Blob) ||
      !file.type.startsWith("image/") ||
      file.size < minSize
    ) {
      results.push(file);
      continue;
    }

    const compressed = await resizeAndCompress(file, {
      maxWidth,
      maxHeight,
      quality,
    });

    results.push(compressed);
  }

  return results;
};

const resizeAndCompress = (file, { maxWidth, maxHeight, quality }) => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.readAsArrayBuffer(file);

    reader.onload = (e) => {
      const blob = new Blob([e.target.result]);
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.src = url;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // === SAME LOGIC AS YOUR CODE ===
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
          (compressedBlob) => {
            URL.revokeObjectURL(url);

            // 🛑 GUARANTEE: never increase size
            if (!compressedBlob || compressedBlob.size >= file.size) {
              resolve(file);
              return;
            }

            resolve(
              new File([compressedBlob], file.name.replace(/\.\w+$/, ".webp"), {
                type: "image/webp",
                lastModified: Date.now(),
              })
            );
          },
          "image/webp", // 🚀 key improvement
          quality
        );
      };
    };
  });
};
