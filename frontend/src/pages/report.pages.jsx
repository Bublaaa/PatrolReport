import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { motion } from "framer-motion";

const ReportPages = () => {
  const patrolPointId = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
};
