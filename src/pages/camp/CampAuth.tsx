import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function CampAuth() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/id/auth?client_id=camp&redirect_uri=/camp/app", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Icon name="Loader" size={24} className="animate-spin text-black/30" />
    </div>
  );
}
