import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import EdoLayout from "./EdoLayout";
import EdoDashboard from "./EdoDashboard";
import EdoDocList from "./EdoDocList";
import EdoDocView from "./EdoDocView";
import EdoDocForm from "./EdoDocForm";
import EdoOrgs from "./EdoOrgs";
import EdoTrash from "./EdoTrash";

export default function EdoApp() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/id/auth?client_id=edo&redirect_uri=/edo");
    }
  }, [user, loading, navigate]);

  if (loading || !user) return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#1a0a6e]/20 border-t-[#1a0a6e] rounded-full animate-spin" />
    </div>
  );

  return (
    <EdoLayout>
      <Routes>
        <Route index element={<EdoDashboard />} />
        <Route path="docs" element={<EdoDocList />} />
        <Route path="docs/new" element={<EdoDocForm />} />
        <Route path="docs/:id" element={<EdoDocView />} />
        <Route path="docs/:id/edit" element={<EdoDocForm />} />
        <Route path="inbox" element={<EdoDocList filter={{ doc_type: "incoming" }} />} />
        <Route path="outbox" element={<EdoDocList filter={{ doc_type: "outgoing" }} />} />
        <Route path="archive" element={<EdoDocList filter={{ status: "archive" }} />} />
        <Route path="orgs" element={<EdoOrgs />} />
        <Route path="trash" element={<EdoTrash />} />
      </Routes>
    </EdoLayout>
  );
}
