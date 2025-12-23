import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";

const QrScanner = ({ onScanSuccess }) => {
  const scannerRef = useRef(null);
  const isScanning = useRef(false);
  const [isDebounced, setIsDebounced] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const startScanner = async () => {
      if (isScanning.current || isDebounced) return;

      try {
        scannerRef.current = new Html5Qrcode("reader");
        const cameras = await Html5Qrcode.getCameras();

        if (cameras.length === 0) {
          console.error("No cameras found");
          return;
        }

        isScanning.current = true;
        const camera =
          cameras.find(
            (cam) =>
              cam.label.toLowerCase().includes("back") ||
              cam.label.toLowerCase().includes("environment")
          ) || cameras[1];
        await scannerRef.current.start(
          camera.id,

          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            if (isDebounced) return;
            setIsDebounced(true);
            await stopScanner();
            onScanSuccess?.(decodedText);
            navigate("/", { replace: true });
            setTimeout(() => {
              window.location.reload();
            }, 5000);
          },
          async (errorMessage) => {
            console.warn("QR Scan Error:", errorMessage);
            // await stopScanner();
            console.log(cameras);
          }
        );
      } catch (error) {
        console.error("Error starting scanner:", error);
        await stopScanner();
      }
    };

    startScanner();

    return () => stopScanner();
  }, [onScanSuccess, isDebounced, navigate]);

  const stopScanner = async () => {
    if (scannerRef.current && isScanning.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        scannerRef.current = null;
        isScanning.current = false;
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
    }
  };

  return <div id="reader"></div>;
};

export default QrScanner;
