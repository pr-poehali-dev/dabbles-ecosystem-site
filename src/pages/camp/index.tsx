import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { getCampToken } from "@/lib/camp-api";
import CampLanding from "./CampLanding";
import CampAuth from "./CampAuth";
import CampLayout from "./CampLayout";
import CampDashboard from "./CampDashboard";
import CampProgramView from "./CampProgramView";
import CampTestView from "./CampTestView";
import CampCertificates from "./CampCertificates";
import CampProfile from "./CampProfile";

function ProtectedRoutes() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!getCampToken()) navigate("/camp/login");
  }, [navigate]);
  if (!getCampToken()) return null;
  return (
    <CampLayout>
      <Routes>
        <Route index element={<CampDashboard />} />
        <Route path="dashboard" element={<CampDashboard />} />
        <Route path="program/:id" element={<CampProgramView />} />
        <Route path="test/:id" element={<CampTestView />} />
        <Route path="certificates" element={<CampCertificates />} />
        <Route path="profile" element={<CampProfile />} />
      </Routes>
    </CampLayout>
  );
}

export default function CampPortal() {
  return (
    <Routes>
      <Route index element={<CampLanding />} />
      <Route path="login" element={<CampAuth />} />
      <Route path="app/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}