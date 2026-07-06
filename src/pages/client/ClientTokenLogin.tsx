import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setCpToken } from "@/lib/client-api";
import Icon from "@/components/ui/icon";

export default function ClientTokenLogin() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      setCpToken(token);
      navigate("/client/home", { replace: true });
    } else {
      navigate("/client", { replace: true });
    }
  }, [params, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Icon name="Loader2" size={24} className="animate-spin text-black/30" />
    </div>
  );
}
