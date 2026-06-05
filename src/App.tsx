import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cabinet from "./pages/Cabinet";
import Vibe from "./pages/Vibe";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Legal from "./pages/Legal";
import Meroshkins from "./pages/Meroshkins";
import MeroshkinsShare from "./pages/MeroshkinsShare";
import MeroshkinsPromo from "./pages/meroshkins/PromoPage";
import MeroshkinsInvite from "./pages/meroshkins/InvitePage";
import YandexCallback from "./pages/meroshkins/YandexCallback";
import IdAuth from "./pages/id/IdAuth";
import IdProfile from "./pages/id/IdProfile";
import IdInvite from "./pages/id/IdInvite";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/lib/auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cabinet" element={<Cabinet />} />
            <Route path="/meroshkins" element={<Meroshkins />} />
            <Route path="/meroshkins/promo" element={<MeroshkinsPromo />} />
            <Route path="/meroshkins/share" element={<MeroshkinsShare />} />
            <Route path="/meroshkins/invite" element={<MeroshkinsInvite />} />
            <Route path="/meroshkins/yandex-callback" element={<YandexCallback />} />
            <Route path="/vibe" element={<Vibe />} />
            <Route path="/id" element={<IdAuth />} />
            <Route path="/id/auth" element={<IdAuth />} />
            <Route path="/id/profile" element={<IdProfile />} />
            <Route path="/id/invite/:token" element={<IdInvite />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;