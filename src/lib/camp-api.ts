const BASE = "https://functions.poehali.dev/28a12976-085a-453f-98a4-4f98e91bb5a5";
const TOKEN_KEY = "camp_token";
const ADMIN_TOKEN_KEY = "dabbl_token";

export const getCampToken = () => localStorage.getItem(TOKEN_KEY) || "";
export const setCampToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearCampToken = () => localStorage.removeItem(TOKEN_KEY);
const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY) || "";

async function campRequest<T>(
  action: string,
  options: {
    method?: "GET" | "POST";
    body?: unknown;
    query?: Record<string, string | number>;
    useAdminToken?: boolean;
  } = {}
): Promise<T> {
  const { method = "GET", body, query = {}, useAdminToken = false } = options;
  const params = new URLSearchParams({ action, ...(query as Record<string, string>) });
  const url = `${BASE}?${params}`;
  const token = useAdminToken ? getAdminToken() : getCampToken();
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "X-Auth-Token": token } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error((data as { error?: string }).error || "Ошибка запроса");
  return data;
}

export interface CampStudent {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  avatar_url: string;
}

export interface CampProgram {
  id: number;
  title: string;
  description: string;
  image_url: string;
  duration_label: string;
  level: string;
}

export interface CampMyProgram extends CampProgram {
  status: string;
  enrolled_at: string;
  completed_at: string | null;
  total_lectures: number;
  done_lectures: number;
}

export interface CampLecture {
  id: number;
  title: string;
  content: string;
  video_url: string;
  file_url: string;
  done: boolean;
}

export interface CampTestBrief {
  id: number;
  title: string;
  passing_score: number;
  passed: boolean;
  score: number | null;
}

export interface CampModule {
  id: number;
  title: string;
  lectures: CampLecture[];
  test: CampTestBrief | null;
}

export interface CampLearnData {
  program: { id: number; title: string; description: string };
  modules: CampModule[];
  final_test: CampTestBrief | null;
  certificate: { cert_number: string; pdf_url: string } | null;
}

export interface CampTestAnswer {
  id: number;
  answer_text: string;
}

export interface CampTestQuestion {
  id: number;
  question: string;
  answers: CampTestAnswer[];
}

export interface CampTest {
  id: number;
  title: string;
  passing_score: number;
  questions: CampTestQuestion[];
}

export interface CampCertificate {
  id: number;
  cert_number: string;
  pdf_url: string;
  issued_at: string;
  program_title: string;
}

export interface CampCertTemplate {
  template_url: string;
  preview_url: string;
  page_width: number;
  page_height: number;
  name_x: number; name_y: number; name_size: number; name_color: string; name_align: string;
  date_x: number; date_y: number; date_size: number; date_color: string; date_align: string;
  number_x: number; number_y: number; number_size: number; number_color: string; number_align: string;
}

export interface CampAdminCertificate {
  id: number;
  cert_number: string;
  pdf_url: string;
  issued_at: string;
  student_name: string;
  student_email: string;
  program_title: string;
}

export const campApi = {
  register: (email: string, password: string, full_name: string) =>
    campRequest<{ token: string; student: CampStudent }>("register", { method: "POST", body: { email, password, full_name } }),
  login: (email: string, password: string) =>
    campRequest<{ token: string; student: CampStudent }>("login", { method: "POST", body: { email, password } }),
  logout: () => campRequest("logout", { method: "POST" }),
  me: () => campRequest<{ student: CampStudent }>("me"),
  profileUpdate: (full_name: string, phone: string) =>
    campRequest<{ student: CampStudent }>("profile-update", { method: "POST", body: { full_name, phone } }),

  programs: () => campRequest<{ programs: CampProgram[] }>("programs"),
  program: (id: number) => campRequest<{ program: CampProgram & { modules: { id: number; title: string; lectures: { id: number; title: string }[] }[] } }>("program", { query: { id } }),

  enroll: (program_id: number) => campRequest<{ ok: boolean }>("enroll", { method: "POST", body: { program_id } }),
  myPrograms: () => campRequest<{ programs: CampMyProgram[] }>("my-programs"),
  learn: (program_id: number) => campRequest<CampLearnData>("learn", { query: { program_id } }),
  lectureComplete: (lecture_id: number) => campRequest<{ ok: boolean }>("lecture-complete", { method: "POST", body: { lecture_id } }),

  test: (id: number) => campRequest<{ test: CampTest }>("test", { query: { id } }),
  testSubmit: (test_id: number, answers: Record<number, number>) =>
    campRequest<{ score: number; passed: boolean; certificate: { cert_number: string; pdf_url: string } | null }>(
      "test-submit", { method: "POST", body: { test_id, answers } }
    ),

  myCertificates: () => campRequest<{ certificates: CampCertificate[] }>("my-certificates"),

  // АДМИНКА
  adminPrograms: () => campRequest<{ programs: (CampProgram & { sort_order: number; is_active: boolean })[] }>("admin-programs", { useAdminToken: true }),
  adminProgramSave: (data: Record<string, unknown>) => campRequest<{ id: number }>("admin-program-save", { method: "POST", body: data, useAdminToken: true }),
  adminProgramDelete: (id: number) => campRequest<{ ok: boolean }>("admin-program-delete", { method: "POST", body: { id }, useAdminToken: true }),

  adminModules: (program_id: number) => campRequest<{ modules: { id: number; title: string; sort_order: number; is_active: boolean }[] }>("admin-modules", { query: { program_id }, useAdminToken: true }),
  adminModuleSave: (data: Record<string, unknown>) => campRequest<{ id: number }>("admin-module-save", { method: "POST", body: data, useAdminToken: true }),
  adminModuleDelete: (id: number) => campRequest<{ ok: boolean }>("admin-module-delete", { method: "POST", body: { id }, useAdminToken: true }),

  adminLectures: (module_id: number) => campRequest<{ lectures: { id: number; title: string; content: string; video_url: string; file_url: string; sort_order: number; is_active: boolean }[] }>("admin-lectures", { query: { module_id }, useAdminToken: true }),
  adminLectureSave: (data: Record<string, unknown>) => campRequest<{ id: number }>("admin-lecture-save", { method: "POST", body: data, useAdminToken: true }),
  adminLectureDelete: (id: number) => campRequest<{ ok: boolean }>("admin-lecture-delete", { method: "POST", body: { id }, useAdminToken: true }),

  adminTests: (program_id: number) => campRequest<{ tests: { id: number; module_id: number | null; title: string; is_final: boolean; passing_score: number; sort_order: number }[] }>("admin-tests", { query: { program_id }, useAdminToken: true }),
  adminTestSave: (data: Record<string, unknown>) => campRequest<{ id: number }>("admin-test-save", { method: "POST", body: data, useAdminToken: true }),
  adminTestDelete: (id: number) => campRequest<{ ok: boolean }>("admin-test-delete", { method: "POST", body: { id }, useAdminToken: true }),

  adminQuestions: (test_id: number) => campRequest<{ questions: { id: number; question: string; sort_order: number; answers: { id: number; answer_text: string; is_correct: boolean; sort_order: number }[] }[] }>("admin-questions", { query: { test_id }, useAdminToken: true }),
  adminQuestionSave: (data: Record<string, unknown>) => campRequest<{ id: number }>("admin-question-save", { method: "POST", body: data, useAdminToken: true }),
  adminQuestionDelete: (id: number) => campRequest<{ ok: boolean }>("admin-question-delete", { method: "POST", body: { id }, useAdminToken: true }),

  adminStudents: (search?: string) => campRequest<{ students: { id: number; email: string; full_name: string; phone: string; is_active: boolean; created_at: string; enrollments: number; certificates: number }[] }>("admin-students", { query: search ? { search } : {}, useAdminToken: true }),

  upload: (file: string, ext: string) => campRequest<{ url: string }>("upload", { method: "POST", body: { file, ext }, useAdminToken: true }),

  adminCertTemplate: () => campRequest<{ template: CampCertTemplate | null }>("admin-cert-template", { useAdminToken: true }),
  adminCertTemplateUpload: (file: string) =>
    campRequest<{ template_url: string; preview_url: string; page_width: number; page_height: number }>(
      "admin-cert-template-upload", { method: "POST", body: { file }, useAdminToken: true }
    ),
  adminCertTemplateSave: (data: Record<string, unknown>) =>
    campRequest<{ ok: boolean }>("admin-cert-template-save", { method: "POST", body: data, useAdminToken: true }),
  adminCertTemplateTest: () =>
    campRequest<{ url: string }>("admin-cert-template-test", { method: "POST", useAdminToken: true }),
  adminCertificates: () => campRequest<{ certificates: CampAdminCertificate[] }>("admin-certificates", { useAdminToken: true }),
};

export function formatCampDate(s: string | null): string {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}