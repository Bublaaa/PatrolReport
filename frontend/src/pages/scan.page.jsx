import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import QrScanner from "../components/qr.scanner.jsx";

const ScanPage = ({}) => {
  const navigate = useNavigate();

  const handleScan = (data) => {
    if (!data) return;
    const url = new URL(data);
    navigate(url.pathname, { replace: true });
    console.log("Scanned data:", url.pathname);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full bg-white bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden mx-2"
    >
      <div className="p-8 flex flex-col gap-5">
        <h5 className="text-center bg-clip-text">Clock In</h5>
        <motion.div
          className="p-4 rounded-lg bg-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <QrScanner onScanSuccess={handleScan} />
        </motion.div>
      </div>
    </motion.div>
  );
};
export default ScanPage;
