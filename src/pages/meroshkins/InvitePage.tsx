import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { mApi } from "@/lib/meroshkins";
import { useAuth } from "@/lib/auth";

export default function InvitePage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [info, setInfo] = useState<{ invite_email: string; status: string } | null>(null);
  const [err, setErr] = useState("");
  const [fetching, setFetching] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) { setErr("Неверная ссылка"); setFetching(false); return; }
    mApi.inviteInfo(token)
      .then(d => setInfo({ invite_email: d.invite_email, status: d.status }))
      .catch(() => setErr("Ссылка недействительна или уже использована"))
      .finally(() => setFetching(false));
  }, [token]);

  const accept = async () => {
    if (!user) {
      navigate(`/id/auth?redirect_uri=/meroshkins/invite?token=${token}`);
      return;
    }
    setAccepting(true);
    try {
      await mApi.acceptInvite(token);
      setDone(true);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Ошибка");
    } finally { setAccepting(false); }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center p-6"
      style={{ fontFamily: "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#7c3aed]/25">
            <Icon name="CalendarDays" size={28} className="text-white" />
          </div>
          <div className="text-[13px] text-black/40 font-medium">Даббл · Мерошкинс</div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-black/5 p-8">
          {fetching ? (
            <div className="flex justify-center py-4">
              <Icon name="Loader" size={20} className="animate-spin text-black/20" />
            </div>
          ) : err ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Icon name="X" size={20} className="text-red-400" />
              </div>
              <p className="text-[15px] font-semibold text-black mb-1">Ошибка</p>
              <p className="text-[13px] text-black/45">{err}</p>
              <Link to="/meroshkins" className="mt-6 block text-[13px] text-[#7c3aed] font-semibold">
                На главную
              </Link>
            </div>
          ) : done ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <Icon name="Check" size={22} className="text-emerald-500" />
              </div>
              <p className="text-[17px] font-bold text-black mb-2">Доступ получен!</p>
              <p className="text-[13px] text-black/45 mb-6">Теперь вы можете редактировать общий календарь</p>
              <Link to="/meroshkins"
                className="block w-full py-3 rounded-2xl bg-[#7c3aed] text-white text-[15px] font-semibold text-center hover:bg-[#6d28d9] transition-colors">
                Открыть Мерошкинс
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#7c3aed]/10 flex items-center justify-center shrink-0">
                  <Icon name="Users" size={18} className="text-[#7c3aed]" />
                </div>
                <div>
                  <p className="text-[11px] text-black/40 font-medium uppercase tracking-wide">Приглашение</p>
                  <p className="text-[13px] text-black/60">Совместный доступ к календарю</p>
                </div>
              </div>

              <h1 className="text-[20px] font-bold text-black tracking-[-0.5px] mb-1">Вас пригласили</h1>
              <p className="text-[13px] text-black/45 mb-6">
                Приглашение для <span className="font-medium text-black/70">{info?.invite_email}</span>
              </p>

              {!user && (
                <p className="text-[12px] text-amber-600 bg-amber-50 rounded-xl px-3 py-2 mb-4">
                  Для принятия приглашения войдите в аккаунт с этим email
                </p>
              )}

              <button
                onClick={accept}
                disabled={accepting}
                className="w-full py-3 rounded-2xl bg-[#7c3aed] text-white text-[15px] font-semibold hover:bg-[#6d28d9] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {accepting && <Icon name="Loader" size={15} className="animate-spin" />}
                {user ? "Принять приглашение" : "Войти и принять"}
              </button>

              <Link to="/" className="block text-center text-[12px] text-black/30 hover:text-black/60 mt-4 transition-colors">
                Отмена
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
