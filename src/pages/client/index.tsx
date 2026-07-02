import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { getCpToken } from "@/lib/client-api";
import ClientLogin from "./ClientLogin";
import ClientLayout from "./ClientLayout";
import ClientDashboard from "./ClientDashboard";
import ClientCases from "./ClientCases";
import ClientCaseView from "./ClientCaseView";
import ClientPayments from "./ClientPayments";
import ClientDocuments from "./ClientDocuments";
import ClientSubmit from "./ClientSubmit";

function ProtectedRoutes() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!getCpToken()) navigate("/client");
  }, [navigate]);
  if (!getCpToken()) return null;
  return (
    <ClientLayout>
      <Routes>
        <Route index element={<ClientDashboard />} />
        <Route path="cases" element={<ClientCases />} />
        <Route path="cases/:id" element={<ClientCaseView />} />
        <Route path="payments" element={<ClientPayments />} />
        <Route path="documents" element={<ClientDocuments />} />
        <Route path="submit" element={<ClientSubmit />} />
      </Routes>
    </ClientLayout>
  );
}

export default function ClientPortal() {
  return (
    <Routes>
      <Route index element={<ClientLogin />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}
