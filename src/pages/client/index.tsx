import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
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
    if (!getCpToken()) navigate("/client/login");
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
      <Route path="login" element={<ClientLogin />} />
      {/* Корень /client — если залогинен → дашборд, нет → логин */}
      <Route index element={
        getCpToken() ? <Navigate to="/client/home" replace /> : <ClientLogin />
      } />
      <Route path="home/*" element={<ProtectedRoutes />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}
