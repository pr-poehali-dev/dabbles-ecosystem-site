import { Navigate, useSearchParams } from "react-router-dom";

export default function Login() {
  const [params] = useSearchParams();
  const next = params.get("next") || "/cabinet";
  const target = `/id/auth?client_id=cabinet&redirect_uri=${encodeURIComponent(next)}`;
  return <Navigate to={target} replace />;
}
