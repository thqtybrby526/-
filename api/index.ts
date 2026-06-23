import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load environment variables
dotenv.config();

const SETTINGS_PATH = path.join(process.cwd(), "pdf-settings.json");

const DEFAULT_PDF_SETTINGS = {
  "الدليل الشامل 2026": "https://raw.githubusercontent.com/alroubymediabuyer/academy-files/main/official-booklet-2026.pdf",
  "الدليل الرسمي الشامل 2026": "https://raw.githubusercontent.com/alroubymediabuyer/academy-files/main/official-booklet-2026.pdf",
  "قسم البترول": "https://raw.githubusercontent.com/alroubymediabuyer/academy-files/main/official-booklet-2026.pdf",
  "قسم المساحة والخرائط": "https://raw.githubusercontent.com/alroubymediabuyer/academy-files/main/official-booklet-2026.pdf",
  "قسم الضيافة الجوية": "https://raw.githubusercontent.com/alroubymediabuyer/academy-files/main/official-booklet-2026.pdf",
  "قسم تكنولوجيا البرمجيات": "https://raw.githubusercontent.com/alroubymediabuyer/academy-files/main/official-booklet-2026.pdf",
  "قسم التحاليل الطبية": "https://raw.githubusercontent.com/alroubymediabuyer/academy-files/main/official-booklet-2026.pdf",
  "قسم السجل الطبي السكرتارية": "https://raw.githubusercontent.com/alroubymediabuyer/academy-files/main/official-booklet-2026.pdf",
  "قسم الخدمات الصحية المساعدة": "https://raw.githubusercontent.com/alroubymediabuyer/academy-files/main/official-booklet-2026.pdf"
};

function getPdfSettings() {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      const data = fs.readFileSync(SETTINGS_PATH, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to read pdf-settings file, using defaults:", err);
  }
  return DEFAULT_PDF_SETTINGS;
}

function savePdfSettings(settings: any) {
  try {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save pdf-settings file:", err);
  }
}

const STUDENTS_BACKUP_PATH = path.join(process.cwd(), "students_db.json");

function getLocalStudentsBackup(): any[] {
  try {
    if (fs.existsSync(STUDENTS_BACKUP_PATH)) {
      const content = fs.readFileSync(STUDENTS_BACKUP_PATH, "utf8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Failed to read local students backup JSON:", err);
  }
  return [];
}

function saveLocalStudentsBackup(rows: any[]) {
  try {
    fs.writeFileSync(STUDENTS_BACKUP_PATH, JSON.stringify(rows, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save local students backup JSON:", err);
  }
}

function localInsertStudent(row: any) {
  const list = getLocalStudentsBackup();
  const exists = list.some(r => r.reservation_code === row.reservation_code);
  if (!exists) {
    list.unshift(row);
    saveLocalStudentsBackup(list);
  }
}

function localUpdateStudent(code: string, payload: any) {
  const list = getLocalStudentsBackup();
  const index = list.findIndex(r => r.reservation_code === code);
  if (index !== -1) {
    list[index] = { ...list[index], ...payload };
    saveLocalStudentsBackup(list);
  }
}

function localDeleteStudent(code: string) {
  const list = getLocalStudentsBackup();
  const filtered = list.filter(r => r.reservation_code !== code);
  saveLocalStudentsBackup(filtered);
}

// Ensure the backup has some data or exists
if (!fs.existsSync(STUDENTS_BACKUP_PATH)) {
  const initialBackup = [
    {
      full_name: "أحمد محمود كامل",
      phone: "01098765432",
      whatsapp_number: "01098765432",
      graduation_year: "2025",
      governorate: "القاهرة",
      education_level: "ثانوية عامة",
      selected_departments: ["قسم تكنولوجيا الخدمات الطبية العاجلة", "قسم تكنولوجيا الأشعة والتصوير الطبي"],
      notes: "أرغب في الاستفسار عن تفاصيل تأجيل التجنيد والرسوم الإضافية المطلوبة لتثبيته.",
      reservation_code: "1000",
      status: "pending",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("ar-EG"),
      created_at: new Date(Date.now() - 29 * 60 * 60 * 1000).toISOString()
    },
    {
      full_name: "مريم عبد العزيز حسن",
      phone: "01234567890",
      whatsapp_number: "01234567890",
      graduation_year: "2024",
      governorate: "الإسكندرية",
      education_level: "دبلوم فني صناعي",
      selected_departments: ["قسم تكنولوجيا تصنيع تركيبات الأسنان"],
      notes: "هل تتوفر الدراسة في الفترة المسائية؟ وهل تكلفتها تختلف عن الصباحية؟",
      reservation_code: "1001",
      status: "completed",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("ar-EG"),
      created_at: new Date().toISOString()
    }
  ];
  saveLocalStudentsBackup(initialBackup);
}

const rawSupabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://wufymhbyxwheihtxadnb.supabase.co";
const supabaseUrl = rawSupabaseUrl.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

export const hasSupabase = !!(supabaseKey && supabaseKey.trim().length > 0 && supabaseKey !== "dummy-key-to-prevent-crash");
export const supabase = createClient(supabaseUrl, supabaseKey || "dummy-key-to-prevent-crash");

export const app = express();

// Enable JSON bodies parsing with 50MB limit for base64 file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Gemini client (Lazy-initialize safely to avoid crashing if API key is not present on startup)
let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined. Please configure it in the Secrets panel inside Google AI Studio.");
    }
    genAIClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAIClient;
}

// ----------------- API Endpoints & DB Section -----------------

// Lead representation on frontend / server interface
interface Lead {
  id: string;
  reservationCode: string;
  studentName: string;
  phoneNumber: string;
  whatsappNumber?: string;
  graduationYear?: string;
  governorate?: string;
  educationLevel: string;
  basicCourse?: string;
  wantsEquivalence?: boolean;
  selectedDepartments: string[];
  notes: string;
  date: string;
  timestamp: number;
  expiresAt: string;
  status: "pending" | "completed" | "no_reply";
  agentName?: string;
  internalNotes?: string;
  academyName?: string;
}

interface CallbackRequest {
  id: string;
  phoneNumber: string;
  studentName?: string;
  date: string;
  status: "pending" | "completed" | "no_reply";
  agentName?: string;
  internalNotes?: string;
  source?: string;
  specialization?: string;
}

interface Complaint {
  id: string;
  studentName: string;
  phoneNumber: string;
  type: "complaint" | "suggestion";
  text: string;
  date: string;
}

// Fallback arrays for non-students tables (callbacks & complaints remain in memory to obey instructions, only table students connects to Supabase)
let callbackRequests: CallbackRequest[] = [];

let complaintsAnswers: Complaint[] = [];

// Initial seed for PDF Leads (downloaders) in server memory
let pdfLeads: any[] = [
  {
    id: "pdf-249511",
    name: "أحمد سيد عبد العال",
    phone: "01034567891",
    specialization: "قسم البرمجة والذكاء الاصطناعي",
    downloadDate: new Date(Date.now() - 4 * 3600000).toISOString(),
    status: "pending",
    agentName: ""
  },
  {
    id: "pdf-110943",
    name: "رنا عماد الشريف",
    phone: "01287654321",
    specialization: "قسم الضيافة الجوية",
    downloadDate: new Date(Date.now() - 12 * 3600000).toISOString(),
    status: "completed",
    agentName: "سارة ممدوح"
  },
  {
    id: "pdf-830219",
    name: "مازن كريم جلال",
    phone: "01123423456",
    specialization: "قسم البترول",
    downloadDate: new Date(Date.now() - 25 * 3600000).toISOString(),
    status: "no_reply",
    agentName: "خالد عبد الفتاح"
  }
];

app.post("/api/pdf-leads", (req, res) => {
  const { name, phone, specialization } = req.body;
  if (!name || !phone) {
    res.status(400).json({ error: "الرجاء توفير الاسم ورقم الهاتف لإتمام تسجيل التحميل." });
    return;
  }
  const newPdfLead = {
    id: "pdf-" + Math.floor(100000 + Math.random() * 900000),
    name: name.trim(),
    phone: phone.trim(),
    specialization: specialization || "الدليل الرسمي الشامل 2026",
    downloadDate: new Date().toISOString(),
    status: "pending",
    agentName: ""
  };
  pdfLeads.unshift(newPdfLead);
  res.json({ success: true, lead: newPdfLead });
});

// Helper serializers/deserializers to save internalNotes & wantsEquivalence inside notes column to respect current db columns
function serializeNotes(userNotes: string, internalNotes?: string, wantsEquivalence?: boolean, academyName?: string): string {
  let result = userNotes || "";
  if (internalNotes) {
    result += `\n__INTERNAL_NOTES__:${internalNotes}`;
  }
  if (wantsEquivalence !== undefined) {
    result += `\n__WANTS_EQUIVALENCE__:${wantsEquivalence}`;
  }
  if (academyName) {
    result += `\n__ACADEMY_NAME__:${academyName}`;
  }
  return result;
}

function deserializeNotes(rawNotes: string): { userNotes: string, internalNotes: string, wantsEquivalence: boolean, academyName: string } {
  if (!rawNotes) {
    return { userNotes: "", internalNotes: "", wantsEquivalence: false, academyName: "" };
  }

  let userNotes = rawNotes;
  let internalNotes = "";
  let wantsEquivalence = false;
  let academyName = "";

  const internalIdx = rawNotes.indexOf("\n__INTERNAL_NOTES__:");
  const equivalenceIdx = rawNotes.indexOf("\n__WANTS_EQUIVALENCE__:");
  const academyIdx = rawNotes.indexOf("\n__ACADEMY_NAME__:");

  if (internalIdx !== -1) {
    const endIdx = equivalenceIdx !== -1 && equivalenceIdx > internalIdx 
      ? equivalenceIdx 
      : academyIdx !== -1 && academyIdx > internalIdx 
        ? academyIdx 
        : rawNotes.length;
    internalNotes = rawNotes.substring(internalIdx + 20, endIdx);
    userNotes = userNotes.replace(rawNotes.substring(internalIdx, endIdx), "");
  }

  if (equivalenceIdx !== -1) {
    const endIdx = academyIdx !== -1 && academyIdx > equivalenceIdx ? academyIdx : rawNotes.length;
    const valStr = rawNotes.substring(equivalenceIdx + 22, endIdx).trim();
    wantsEquivalence = valStr === "true";
    userNotes = userNotes.replace(rawNotes.substring(equivalenceIdx, endIdx), "");
  }

  if (academyIdx !== -1) {
    academyName = rawNotes.substring(academyIdx + 18).trim();
    userNotes = userNotes.replace(rawNotes.substring(academyIdx), "");
  }

  return {
    userNotes: userNotes.trim(),
    internalNotes: internalNotes.trim(),
    wantsEquivalence,
    academyName
  };
}

// Maps Supabase database row to the standard Lead interface
function mapDbRowToLead(row: any): Lead {
  const createdAt = row.created_at ? new Date(row.created_at) : new Date();

  // Safe parsing of selected_departments
  let depts: string[] = [];
  if (Array.isArray(row.selected_departments)) {
    depts = row.selected_departments;
  } else if (typeof row.selected_departments === 'string') {
    try {
      depts = JSON.parse(row.selected_departments);
    } catch {
      depts = row.selected_departments ? row.selected_departments.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    }
  }

  // Parse notes to retrieve userNotes, internalNotes, wantsEquivalence, and academyName
  const rawNotes = row.notes || "";
  const parsed = deserializeNotes(rawNotes);

  return {
    id: String(row.id || row.reservation_code || "lead-" + Math.floor(100000 + Math.random() * 900000)),
    reservationCode: row.reservation_code || "",
    studentName: row.full_name || "",
    phoneNumber: row.phone || "",
    whatsappNumber: row.whatsapp_number || "",
    graduationYear: row.graduation_year || "",
    governorate: row.governorate || "",
    educationLevel: row.education_level || "غير محدد",
    basicCourse: row.basic_course || "دورة أكتوبر 2026 (الرئيسية)",
    selectedDepartments: depts,
    notes: parsed.userNotes,
    date: createdAt.toLocaleString("ar-EG"),
    timestamp: createdAt.getTime(),
    expiresAt: row.expires_at || new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("ar-EG"),
    status: (row.status as any) || "pending",
    agentName: row.specialization || "", // Stored in specialization column
    internalNotes: parsed.internalNotes,
    wantsEquivalence: parsed.wantsEquivalence,
    academyName: parsed.academyName
  };
}

// Pulls students table, and seeds with initial data if empty
async function getLeadsFromSupabase(): Promise<Lead[]> {
  const localBackup = getLocalStudentsBackup();

  if (!hasSupabase) {
    return localBackup.map(mapDbRowToLead);
  }

  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching students from Supabase:", JSON.stringify(error, null, 2));
      console.log("Using resilient file-based cached backup containing count:", localBackup.length);
      return localBackup.map(mapDbRowToLead);
    }

    if (data && data.length > 0) {
      // Merge DB rows with local backup so nothing registered is lost or wiped out on polling
      const merged = [...data];
      for (const localRow of localBackup) {
        if (localRow && localRow.reservation_code) {
          const exists = data.some((r: any) => String(r.reservation_code) === String(localRow.reservation_code));
          if (!exists) {
            merged.push(localRow);
          }
        }
      }
      // Sort merged rows chronologically descending
      merged.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });

      saveLocalStudentsBackup(merged);
      return merged.map(mapDbRowToLead);
    } else {
      console.log("No records found in students table on Supabase, returning local backup.");
      return localBackup.map(mapDbRowToLead);
    }
  } catch (err) {
    console.error("Catch error in fetching students:", err);
    return localBackup.map(mapDbRowToLead);
  }
}

// Finds a single student row matching ID or registration code
async function findStudentRow(id: string): Promise<any> {
  if (!hasSupabase) {
    const localBackup = getLocalStudentsBackup();
    const match = localBackup.find(r => String(r.id) === id || r.reservation_code === id);
    return match || null;
  }

  try {
    const { data: rowsByCode } = await supabase
      .from('students')
      .select('*')
      .eq('reservation_code', id);
    if (rowsByCode && rowsByCode.length > 0) {
      return rowsByCode[0];
    }

    const numId = parseInt(id);
    if (!isNaN(numId)) {
      const { data: rowsById } = await supabase
        .from('students')
        .select('*')
        .eq('id', numId);
      if (rowsById && rowsById.length > 0) {
        return rowsById[0];
      }
    }

    // Fallback scan
    const { data: allRows } = await supabase
      .from('students')
      .select('*');
    if (allRows) {
      const match = allRows.find(r => String(r.id) === id || r.reservation_code === id);
      if (match) return match;
    }
  } catch (err) {
    console.error("Supabase findStudentRow error, looking up in local backup:", err);
  }

  // Graceful local search fallback
  const localBackup = getLocalStudentsBackup();
  const match = localBackup.find(r => String(r.id) === id || r.reservation_code === id);
  return match || null;
}

// Seed mock leads on first run if DB is entirely empty
async function seedInitialData() {
  const initialLeads = [
    {
      full_name: "أحمد محمود كامل",
      phone: "01098765432",
      whatsapp_number: "01098765432",
      graduation_year: "2025",
      governorate: "القاهرة",
      education_level: "ثانوية عامة",
      selected_departments: ["قسم تكنولوجيا الخدمات الطبية العاجلة", "قسم تكنولوجيا الأشعة والتصوير الطبي"],
      notes: serializeNotes("أرغب في الاستفسار عن تفاصيل تأجيل التجنيد والرسوم الإضافية المطلوبة لتثبيته.", "", false),
      reservation_code: "1000",
      status: "pending",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("ar-EG"),
      created_at: new Date(Date.now() - 29 * 60 * 60 * 1000).toISOString()
    },
    {
      full_name: "مريم عبد العزيز حسن",
      phone: "01234567890",
      whatsapp_number: "01234567890",
      graduation_year: "2024",
      governorate: "الإسكندرية",
      education_level: "دبلوم فني صناعي",
      selected_departments: ["قسم تكنولوجيا تصنيع تركيبات الأسنان"],
      notes: serializeNotes("هل تتوفر الدراسة في الفترة المسائية؟ وهل تكلفتها تختلف عن الصباحية؟", "", false),
      reservation_code: "1001",
      status: "completed",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("ar-EG"),
      created_at: new Date().toISOString()
    }
  ];

  saveLocalStudentsBackup(initialLeads);

  if (!hasSupabase) {
    return;
  }

  try {
    const { error } = await supabase.from('students').insert(initialLeads);
    if (error) {
      console.error("Error seeding initial students to Supabase:", error);
    } else {
      console.log("Successfully seeded initial students to Supabase.");
    }
  } catch (err) {
    console.error("Exception seeding to Supabase:", err);
  }
}

// Gets the next available sequential reservation code based on max code in Supabase and local backup
async function getNextReservationCode(): Promise<string> {
  let maxCode = 1001;

  // Track max code in local backup files first
  try {
    const localBackup = getLocalStudentsBackup();
    for (const row of localBackup) {
      if (row && row.reservation_code) {
        const code = parseInt(row.reservation_code);
        if (!isNaN(code) && code > maxCode) {
          maxCode = code;
        }
      }
    }
  } catch (err) {
    console.error("Failed to parse codes from local student backups:", err);
  }

  // Also query Supabase safely, overlaying on top of the local found max
  if (hasSupabase) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('reservation_code');

      if (data && !error) {
        for (const row of data) {
          if (row && row.reservation_code) {
            const code = parseInt(row.reservation_code);
            if (!isNaN(code) && code > maxCode) {
              maxCode = code;
            }
          }
        }
      }
    } catch (err) {
      console.warn("Could not query reservation codes from Supabase, using local counter:", err);
    }
  }

  return String(maxCode + 1);
}

// API: Check health/API key status
app.get("/api/health", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: "ok",
    hasApiKey: hasKey,
    time: new Date().toISOString()
  });
});

// API: Post Callback Request from student with active database pipeline
app.post("/api/callbacks", async (req, res) => {
  const { phoneNumber, studentName, source, specialization, message } = req.body;
  if (!phoneNumber) {
    res.status(400).json({ error: "الرجاء إدخال رقم الهاتف لطلب الاتصال." });
    return;
  }

  const newRequest: CallbackRequest = {
    id: "cb-" + Math.floor(100000 + Math.random() * 900000),
    phoneNumber,
    studentName: studentName || "زائر غير مسجل الاسم",
    date: new Date().toLocaleString("ar-EG"),
    status: "pending",
    source: source || "اتصال سريع",
    specialization: specialization || "",
    internalNotes: message ? `الرسالة الأساسية من الشات: ${message}` : ""
  };

  callbackRequests.unshift(newRequest);

  // PIPELINE: Also save directly into Supabase 'students' table to establish dual unified delivery pipeline
  try {
    const reservationCode = await getNextReservationCode();
    const serializedNotes = serializeNotes("", message || `قام العميل بطلب اتصال هاتفي سريع من ${source || "الشات"}.`, false);
    const chatbotLeadSource = source && (source.includes("البوت") || source.includes("الشات") || source.includes("محادثة"))
      ? "دردشة البوت الذكي 🤖"
      : `قناة الشات: ${source || "بوت استفسارات"}`;

    const newStudentRow = {
      full_name: (studentName || "طالب مجهول (تواصل تلقائي بالشات)").trim(),
      phone: phoneNumber.trim(),
      whatsapp_number: "",
      graduation_year: "",
      governorate: "",
      education_level: "غير محدد",
      basic_course: chatbotLeadSource,
      selected_departments: specialization ? [specialization] : ["استفسار عام بالشات"],
      notes: serializedNotes,
      reservation_code: reservationCode,
      status: "pending",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("ar-EG"),
      created_at: new Date().toISOString()
    };

    // Mirror to local JSON database backup
    localInsertStudent(newStudentRow);

    if (hasSupabase) {
      const { error: dbError } = await supabase
        .from('students')
        .insert([newStudentRow]);

      if (dbError) {
        console.error("Pipeline Sync Error: Failed to insert chatbot lead row directly to Supabase:", JSON.stringify(dbError, null, 2));
      } else {
        console.log("Pipeline Sync Success: Chatbot prompt/form lead row logged directly to Supabase as actual student row!");
      }
    }
  } catch (err) {
    console.error("Pipeline Sync Error: Exception thrown inside callbacks -> students pipeline handler:", err);
  }

  res.json({
    success: true,
    message: "تم استقبال طلب الاتصال بنجاح. سيتواصل معك مستشار القبول قريبًا.",
    callback: newRequest
  });
});

// API: Get and Post PDF Library Settings
app.get("/api/pdf-settings", (req, res) => {
  res.json(getPdfSettings());
});

app.post("/api/pdf-settings", (req, res) => {
  const newSettings = req.body;
  if (!newSettings || typeof newSettings !== "object") {
    res.status(400).json({ error: "الرجاء إرسال إعدادات صحيحة." });
    return;
  }
  savePdfSettings(newSettings);
  res.json({ success: true, settings: getPdfSettings() });
});

// ==========================================
// PDF DIGITAL LIBRARY MANAGER BACKEND LOGIC
// ==========================================
const LIBRARY_PATH = path.join(process.cwd(), "pdf-library.json");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure UPLOADS_DIR exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve /uploads folder statically
app.use("/uploads", express.static(UPLOADS_DIR));

const DEFAULT_LIBRARY = [
  {
    id: "lib-1",
    name: "كتيب الدليل الشامل لمعاهد وأكاديميات القبول 2026",
    specialization: "الدليل الشامل 2026",
    url: "https://raw.githubusercontent.com/alroubymediabuyer/academy-files/main/official-booklet-2026.pdf",
    mode: "external",
    uploadedAt: "2026-06-20T09:00:00.000Z"
  },
  {
    id: "lib-2",
    name: "كتيب دليل مستقبلك في قسم البترول",
    specialization: "قسم البترول",
    url: "https://raw.githubusercontent.com/alroubymediabuyer/academy-files/main/official-booklet-2026.pdf",
    mode: "external",
    uploadedAt: "2026-06-20T09:12:00.000Z"
  }
];

function getLibrary() {
  try {
    if (fs.existsSync(LIBRARY_PATH)) {
      const data = fs.readFileSync(LIBRARY_PATH, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to read pdf-library.json, using defaults:", err);
  }
  return DEFAULT_LIBRARY;
}

function saveLibrary(lib: any) {
  try {
    fs.writeFileSync(LIBRARY_PATH, JSON.stringify(lib, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save pdf-library.json:", err);
  }
}

// Get the PDF files library list
app.get("/api/pdf-library", (req, res) => {
  res.json({ success: true, list: getLibrary() });
});

// Create/Update a file record inside the library list
app.post("/api/pdf-library", (req, res) => {
  const { id, name, url, specialization } = req.body;
  if (!name || !url || !specialization) {
    res.status(400).json({ error: "الرجاء توفير مسمى الملف، رابط التحميل، والقسم المرتبط به." });
    return;
  }

  const lib = getLibrary();
  let record;

  if (id) {
    // Edit existing record
    const index = lib.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      lib[index] = {
        ...lib[index],
        name,
        url,
        specialization,
        uploadedAt: new Date().toISOString()
      };
      record = lib[index];
    } else {
      record = {
        id: "lib-" + Math.floor(100000 + Math.random() * 900000),
        name,
        url,
        specialization,
        mode: "external",
        uploadedAt: new Date().toISOString()
      };
      lib.push(record);
    }
  } else {
    // Create new record
    record = {
      id: "lib-" + Math.floor(100000 + Math.random() * 900000),
      name,
      url,
      specialization,
      mode: url.includes("/uploads/") ? "uploaded" : "external",
      uploadedAt: new Date().toISOString()
    };
    lib.push(record);
  }

  saveLibrary(lib);

  // Link this immediately to pdf-settings as requested! ("تثبيت الملف وربطه بـ بوابة التحميل")
  const settings = getPdfSettings();
  settings[specialization] = url;
  savePdfSettings(settings);

  res.json({ success: true, list: getLibrary(), settings });
});

// Delete a library file record
app.delete("/api/pdf-library/:id", (req, res) => {
  const { id } = req.params;
  const lib = getLibrary();
  const filtered = lib.filter((item: any) => item.id !== id);
  saveLibrary(filtered);
  res.json({ success: true, list: getLibrary() });
});

// Direct file uploader using Base64 strings
app.post("/api/pdf-library/upload", (req, res) => {
  const { base64, fileName } = req.body;
  if (!base64 || !fileName) {
    res.status(400).json({ error: "الرجاء إرسال الملف كاملاً مرمز بـ Base64 واسمه." });
    return;
  }

  try {
    // Sanitize fileName to prevent path traversal
    const safeName = path.basename(fileName).replace(/[^a-zA-Z0-9\.\-\_]/g, "_");
    const uniqueName = `${Date.now()}_${safeName}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);

    // Strip header if it contains e.g., "data:application/pdf;base64,"
    const parsedBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
    const buffer = Buffer.from(parsedBase64, "base64");

    fs.writeFileSync(filePath, buffer);
    const fileUrl = `/uploads/${uniqueName}`;

    res.json({ success: true, fileUrl, uniqueName });
  } catch (error: any) {
    console.error("Error writing uploaded file:", error);
    res.status(500).json({ error: "حدث خطأ أثناء حفظ الملف على السيرفر." });
  }
});

// API: Complaints and Suggestions Form
app.post("/api/complaints", (req, res) => {
  const { studentName, phoneNumber, type, text } = req.body;
  if (!text) {
    res.status(400).json({ error: "الرجاء كتابة نص الشكوى أو المقترح لإتمام الإرسال." });
    return;
  }

  const newComplaint: Complaint = {
    id: "comp-" + Math.floor(100000 + Math.random() * 900000),
    studentName: studentName ? studentName.trim() : "زائر سري للغاية 🔒",
    phoneNumber: phoneNumber ? phoneNumber.trim() : "غير محدد",
    type: type === "suggestion" ? "suggestion" : "complaint",
    text: text.trim(),
    date: new Date().toLocaleDateString("ar-EG")
  };

  complaintsAnswers.unshift(newComplaint);
  res.json({
    success: true,
    message: "تم تسليم الشكوى/المقترح مباشرة وبسرية تامة للإدارة العليا للمعاهد والأكاديميات. شكراً لاهتمامك بالتطوير!"
  });
});

// API: Mock Gmail automated email notification trigger (Google Workspace Suite SMTP simulator)
app.post("/api/simulate-gmail-trigger", (req, res) => {
  const { sender, recipient, subject, bodyTemplate } = req.body;
  console.log("=== SERVER GMAIL API TRANSMISSION LOG ===");
  console.log(`Outbound SMTP Socket: open`);
  console.log(`Sender Verified: ${sender}`);
  console.log(`Recipient Queue: ${recipient}`);
  console.log(`Subject Line: ${subject}`);
  console.log(`Body Delivery Payload:\n${bodyTemplate}`);
  console.log("=========================================");
  res.json({
    success: true,
    message: "تم محاكاة إرسال بريد التأهيل المهني الإلكتروني بنجاح لعنوان الطالب.",
    deliveryId: "gml-api-" + Math.floor(1000000 + Math.random() * 9000000)
  });
});

// API: Admin endpoint to fetch both leads, callback requests, and complaints
app.get("/api/admin/data", async (req, res) => {
  const supabaseLeads = await getLeadsFromSupabase();
  res.json({
    success: true,
    leads: supabaseLeads,
    callbacks: callbackRequests,
    complaints: complaintsAnswers,
    pdfLeads: pdfLeads
  });
});

// API: Admin endpoint to toggle status / delete entries
app.post("/api/admin/update-status", async (req, res) => {
  const { type, id, status, agentName } = req.body;
  if (type === "callback") {
    const cb = callbackRequests.find(c => c.id === id);
    if (cb) {
      cb.status = status;
      if (agentName !== undefined) {
        cb.agentName = agentName;
      }
      const supabaseLeads = await getLeadsFromSupabase();
      res.json({ success: true, callbacks: callbackRequests, leads: supabaseLeads, pdfLeads });
      return;
    }
  } else if (type === "pdfLead") {
    const pl = pdfLeads.find(p => p.id === id);
    if (pl) {
      pl.status = status;
      if (agentName !== undefined) {
        pl.agentName = agentName;
      }
      const supabaseLeads = await getLeadsFromSupabase();
      res.json({ success: true, pdfLeads: pdfLeads, callbacks: callbackRequests, leads: supabaseLeads });
      return;
    }
  } else if (type === "lead") {
    const dbRow = await findStudentRow(id);
    if (dbRow) {
      const updatePayload: any = { status };
      if (agentName !== undefined) {
        updatePayload.specialization = agentName; // Saving agentName inside specialization column
      }

      // Also mirror to local JSON database backup
      localUpdateStudent(dbRow.reservation_code, updatePayload);

      if (hasSupabase) {
        const { error: updateErr } = await supabase
          .from('students')
          .update(updatePayload)
          .eq('reservation_code', dbRow.reservation_code);

        if (updateErr) {
          console.error("Supabase update-status error:", JSON.stringify(updateErr, null, 2));
        }
      }
    }

    const supabaseLeads = await getLeadsFromSupabase();
    res.json({ success: true, callbacks: callbackRequests, leads: supabaseLeads, pdfLeads });
    return;
  }
  res.status(404).json({ error: "الطلب غير موجود" });
});

app.post("/api/admin/delete", async (req, res) => {
  const { type, id } = req.body;
  if (type === "lead") {
    const dbRow = await findStudentRow(id);
    if (dbRow) {
      // Also mirror to local JSON database backup
      localDeleteStudent(dbRow.reservation_code);

      if (hasSupabase) {
        const { error: deleteErr } = await supabase
          .from('students')
          .delete()
          .eq('reservation_code', dbRow.reservation_code);

        if (deleteErr) {
          console.error("Supabase delete error:", JSON.stringify(deleteErr, null, 2));
        }
      }
    }
    const supabaseLeads = await getLeadsFromSupabase();
    res.json({ success: true, leads: supabaseLeads, pdfLeads });
  } else if (type === "callback") {
    callbackRequests = callbackRequests.filter(c => c.id !== id);
    res.json({ success: true, callbacks: callbackRequests, pdfLeads });
  } else if (type === "complaint") {
    complaintsAnswers = complaintsAnswers.filter(c => c.id !== id);
    res.json({ success: true, complaints: complaintsAnswers, pdfLeads });
  } else if (type === "pdfLead") {
    pdfLeads = pdfLeads.filter(p => p.id !== id);
    res.json({ success: true, pdfLeads: pdfLeads });
  } else {
    res.status(400).json({ error: "النوع غير صحيح" });
  }
});

// API: Toggle equivalence status for high-accuracy synchronization
app.post("/api/admin/toggle-equivalence", async (req, res) => {
  const { id, wantsEquivalence } = req.body;
  const dbRow = await findStudentRow(id);
  if (dbRow) {
    const parsed = deserializeNotes(dbRow.notes || "");
    const serializedNotes = serializeNotes(parsed.userNotes, parsed.internalNotes, !!wantsEquivalence);

    // Also mirror to local JSON database backup
    localUpdateStudent(dbRow.reservation_code, { notes: serializedNotes });

    if (hasSupabase) {
      const { error: updateErr } = await supabase
        .from('students')
        .update({ notes: serializedNotes })
        .eq('reservation_code', dbRow.reservation_code);

      if (updateErr) {
        console.error("Error updating toggle equivalence:", JSON.stringify(updateErr, null, 2));
      }
    }

    const supabaseLeads = await getLeadsFromSupabase();
    res.json({ success: true, leads: supabaseLeads, callbacks: callbackRequests });
  } else {
    res.status(404).json({ error: "الطالب غير موجود" });
  }
});

// API: Update internal staff-only notes
app.post("/api/admin/update-internal-note", async (req, res) => {
  const { type, id, internalNotes } = req.body;
  if (type === "callback") {
    const cb = callbackRequests.find(c => c.id === id);
    if (cb) {
      cb.internalNotes = internalNotes || "";
      const supabaseLeads = await getLeadsFromSupabase();
      res.json({ success: true, callbacks: callbackRequests, leads: supabaseLeads });
      return;
    }
  } else if (type === "lead") {
    const dbRow = await findStudentRow(id);
    if (dbRow) {
      const parsed = deserializeNotes(dbRow.notes || "");
      const serializedNotes = serializeNotes(parsed.userNotes, internalNotes || "", parsed.wantsEquivalence);

      // Also mirror to local JSON database backup
      localUpdateStudent(dbRow.reservation_code, { notes: serializedNotes });

      if (hasSupabase) {
        const { error: updateErr } = await supabase
          .from('students')
          .update({ notes: serializedNotes })
          .eq('reservation_code', dbRow.reservation_code);

        if (updateErr) {
          console.error("Error updating internal notes for lead in Supabase:", JSON.stringify(updateErr, null, 2));
        }
      }
    }
    const supabaseLeads = await getLeadsFromSupabase();
    res.json({ success: true, callbacks: callbackRequests, leads: supabaseLeads });
    return;
  }
  res.status(404).json({ error: "الطلب غير موجود" });
});

// API: Handle Lead/Inquiry Registration (saves to Supabase database table)
app.post("/api/leads", async (req, res) => {
  const { studentName, phoneNumber, whatsappNumber, graduationYear, governorate, educationLevel, basicCourse, selectedDepartments, notes } = req.body;

  if (!studentName || !phoneNumber) {
    res.status(400).json({ error: "الرجاء توفير الاسم والرقم للتسجيل." });
    return;
  }

  try {
    const reservationCode = await getNextReservationCode();
    const serializedNotes = serializeNotes(notes || "", "", false);

    const newStudentRow = {
      full_name: (studentName || "").trim(),
      phone: phoneNumber.trim(),
      whatsapp_number: (whatsappNumber || "").trim(),
      graduation_year: (graduationYear || "").trim(),
      governorate: (governorate || "").trim(),
      education_level: educationLevel || "غير محدد",
      basic_course: basicCourse || "",
      selected_departments: Array.isArray(selectedDepartments) ? selectedDepartments : [],
      notes: serializedNotes,
      reservation_code: reservationCode,
      status: "pending",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("ar-EG"),
      created_at: new Date().toISOString()
    };

    // Mirror to local JSON database backup
    localInsertStudent(newStudentRow);

    let mappedLead = mapDbRowToLead(newStudentRow);

    if (hasSupabase) {
      const { data, error } = await supabase
        .from('students')
        .insert([newStudentRow])
        .select();

      if (error) {
        console.error("Error inserting student to Supabase:", JSON.stringify(error, null, 2));
      }

      const insertedRow = data && data.length > 0 ? data[0] : null;
      if (insertedRow) {
        mappedLead = mapDbRowToLead(insertedRow);
      }
    }

    res.json({
      success: true,
      message: "تم تسجيل طلبك وحفظ الخصم بنجاح! سيقوم مستشار القبول والتسجيل بالتواصل معك قريباً.",
      reservation: mappedLead
    });
  } catch (err) {
    console.error("Critical error in /api/leads:", err);
    res.status(500).json({ error: "حدث خطأ غير متوقع." });
  }
});

// API: Verify student reservation by phone number
app.post("/api/leads/verify-phone", async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    res.status(400).json({ error: "يرجى كتابة رقم الهاتف للبحث" });
    return;
  }

  try {
    const leads = await getLeadsFromSupabase();
    const cleanSearch = phone.trim().replace(/\s+|-/g, "");

    // Allow flexible match for exact phone, last 9 digits (handles international/prefix), or whatsapp
    const match = leads.find(l => {
      const p1 = (l.phoneNumber || "").trim().replace(/\s+|-/g, "");
      const p2 = (l.whatsappNumber || "").trim().replace(/\s+|-/g, "");
      return p1 === cleanSearch || p2 === cleanSearch || p1.endsWith(cleanSearch) || cleanSearch.endsWith(p1);
    });

    if (match) {
      res.json({ success: true, lead: match });
    } else {
      res.status(404).json({ error: "رقم الهاتف المدخل غير مسجل كحجز في بوابة الأكاديمية حالياً. يرجى مراجعة الرقم أو الاتصال بنا لتأكيد حجزك مسبقاً." });
    }
  } catch (err) {
    console.error("Error verifying phone:", err);
    res.status(500).json({ error: "حدث خطأ أثناء فحص البيانات." });
  }
});

// API: Fetch student payload directly by reservation ref code (Bypass Verification / Deep-Link)
app.get("/api/leads/by-ref/:ref", async (req, res) => {
  const { ref } = req.params;
  if (!ref) {
    res.status(400).json({ error: "يرجى تحديد كود المعاملة" });
    return;
  }

  try {
    const dbRow = await findStudentRow(ref);
    if (dbRow) {
      const mapped = mapDbRowToLead(dbRow);
      res.json({ success: true, lead: mapped });
    } else {
      res.status(404).json({ error: "عذراً، كود التحقق أو رمز المرجعي المرفق بالباركود غير مرئي أو غير صحيح." });
    }
  } catch (err) {
    console.error("Error retrieving by ref:", err);
    res.status(500).json({ error: "فشل التحميل التلقائي للمعاملة." });
  }
});

// API: Save corrections & update registration details
app.post("/api/leads/update-details", async (req, res) => {
  const { reservationCode, selectedDepartments, agentName, academyName } = req.body;
  if (!reservationCode) {
    res.status(400).json({ error: "رقم الحجز مطلوب لتعديل البيانات." });
    return;
  }

  try {
    const dbRow = await findStudentRow(reservationCode);
    if (!dbRow) {
      res.status(404).json({ error: "لم يتم العثور على الحجز المحدد بمذكرة الأكاديمية." });
      return;
    }

    const deserialized = deserializeNotes(dbRow.notes);
    const mergedNotes = serializeNotes(deserialized.userNotes, deserialized.internalNotes, deserialized.wantsEquivalence, academyName);

    const updatePayload: any = {
      selected_departments: Array.isArray(selectedDepartments) ? selectedDepartments : [selectedDepartments],
      specialization: agentName || dbRow.specialization || "", // advisor/sales
      notes: mergedNotes
    };

    // Keep backup in Sync
    localUpdateStudent(dbRow.reservation_code, updatePayload);

    if (hasSupabase) {
      const { error: supaErr } = await supabase
        .from("students")
        .update(updatePayload)
        .eq("reservation_code", dbRow.reservation_code);

      if (supaErr) {
        console.error("Error syncing update to Supabase:", supaErr);
      }
    }

    // Retrieve fresh updated lead details
    const freshRow = await findStudentRow(dbRow.reservation_code);
    const updatedLead = mapDbRowToLead(freshRow);

    res.json({
      success: true,
      message: "✓ تم تحديث وتأكيد شعبتكم واختياركم المفضل بنجاح داخل قواعد البيانات الرسمية.",
      lead: updatedLead
    });
  } catch (err) {
    console.error("Critical error in update-details API:", err);
    res.status(500).json({ error: "فشل النظام في حفظ تعديلات التنسيق المطلوبة." });
  }
});

// API: Dynamic Chat Advisor powered safely by Gemini 3.5-flash
app.post("/api/chat-advisor", async (req, res) => {
  const { message, history, promptBase } = req.body;
  if (!message) {
    res.status(400).json({ error: "الرجاء إدخال نص رسالتك." });
    return;
  }

  // Intercept Accreditation questions exactly and instantly
  const normMsg = message.toLowerCase().trim();
  const isAccreditation = normMsg.includes("معتمد") || 
                          normMsg.includes("اعتماد") || 
                          normMsg.includes("تبع إيه") || 
                          normMsg.includes("تبع ايه") || 
                          normMsg.includes("تبع اي") ||
                          normMsg.includes("شعبة إيه") ||
                          normMsg.includes("شعبه ايه") ||
                          normMsg.includes("توثيق") ||
                          normMsg.includes("الختم") ||
                          normMsg.includes("النسر");

  if (isAccreditation) {
    res.json({
      success: true,
      text: "الشهادات التي يمنحها لك المعهد أو الأكاديمية معتمدة من جامعة حكومية مصرية ومختومة بختم النسر ومتاح توثيقها من الخارجية المصرية برسوم إضافية، ومتاح استخراج كارنيهات مزاولة المهنة وبعض الشهادات الإضافية الأخرى بتعرف تفاصيلها من الأكاديمية أو المعهد لما تتوجه للمقر للتقديم أو من مستشار التقديمات."
    });
    return;
  }

  const basePrompt = (promptBase && promptBase.trim()) 
    ? promptBase.trim() 
    : "أنت مستشار قبول ذكي، ساعد الطالب في التقديم والاستفسار";

  const safetyGuardrail = `
أنت مستشار أكاديمي خبير وذكي للغاية. مهمتك الأساسية والقصوى هي الإجابة عن كافة استفسارات الطلاب بالاعتماد كلياً وبشكل حتمي ومطلق على التغذية المرفقة (Knowledge Base / Prompt Base) لتكون هي المرجعية الفريدة والأولى لك لكافة الردود.

🚨 تعليمات الذكاء، التحليل المنهجي، ومنع تداخل الإجابات:
1. **التحليل الذكي والعميق للسؤال**: يرجى قراءة السؤال وفهمه جيداً قبل الرد لتحديد مقصود الطالب بالضبط بدون تشتت أو خلط المواضيع.
2. **منع تداخل الردود**: لا تقم بخلط أو تجميع دبلومات، تخصصات، أسعار، أو شروط دراسة مختلفة في فقرة واحدة عشوائية، بل جاوب بالتحديد والضبط على ما تم السؤال عنه مستعيناً بالتغذية فقط. إذا سألك الطالب عن تخصص معين (مثل صيانة الأجهزة الطبية)، فلا تقحم تفاصيل التحاليل الطبية أو المساحة طالما لم يطلبها.
3. **أولوية التغذية والامتناع الكامل عن الافتراض أو الفبركة**: لا تدعي وجود أسعار أو فروع أو عروض أو دبلومات إضافية غير مكتوبة نصاً وتفصيلاً في التغذية الملقنة لك. الاعتماد الكامل والمنطلق هو التغذية فقط.
4. **تسيير ذكي ومرن نحو مستشاري التقديم بذكاء**: إذا سألك الطالب عن تخصص أو إجابة غير مذكورة نهائياً بالملف المرفق، فلا تفترض ولا تجتهد، بل أجب عما هو متاح في التغذية أولاً بذكاء ثم اعرض عليه بلطف تحويله لمستشار بشري للحسابات الدقيقة أو المعلومات التفصيلية الإضافية.

🚨 القواعد الصارمة والاعتمادات الرسمية القانونية والتنظيمية:
1. يُمنع منعاً باتاً وقاطعاً استخدام كلمة "أكاديميتنا" أو "معهدنا" في ردودك نهائياً! هذا خط أحمر. بدلاً من ذلك، يجب عليك دائماً وبشكل حيادي وموضوعي الإشارة بـ "المعهد أو الأكاديمية" أو "بوابة المعاهد والمنصات التنسيقية".
2. إذا سأل الطالب أو استفسر عن الاعتماد أو التبعية أو الترخيص الحكومي، يجب عليك الرد بهذه الصيغة الحرفية الدقيقة والكاملة دون تغيير أو اختصار:
"الشهادات التي يمنحها لك المعهد أو الأكاديمية معتمدة من جامعة حكومية مصرية ومختومة بختم النسر ومتاح توثيقها من الخارجية المصرية برسوم إضافية، ومتاح استخراج كارنيهات مزاولة المهنة وبعض الشهادات الإضافية الأخرى بيعرفها من الأكاديمية أو المعهد لما يروح يقدم أو من مستشار التقديمات."
3. لا تدّعي أبداً أن هناك تبعية أكاديمية مباشرة وحصرية لوزارة التعليم العالي إلا في حدود الصيغة الرسمية المعتمدة أعلاه.
4. تجنب تماماً اختراع مسميات أو قرارات وزارية وهمية أو تزييف الهوية المهنية للمؤسسة. كن صادقاً ومهنياً وجاذباً في نفس الوقت.
5. الاعتماد الكلي والكامل على التغذية (Knowledge Base): يجب أن تبحث في التغذية المرفقة (الأقسام، المصروفات، الأوراق، إلخ) أولاً وتجيب منها بتفصيلها بذكاء وسلاسة لتفيد العميل بأفضل صورة ممكنة.
6. إذا كان السؤال عن تفاصيل، أقسام، شروط، أو نقاط متوفرة في التغذية، أجب الطالب بشكل كامل وواضح ومفصل منها، ولا تطلب بياناته للتحويل إلا بعد إجابته بالكامل أو إذا أبدى رغبة بالتحويل.
7. تفعيل دور المستشار البشري في حال عدم المعرفة أو السير خارج التغذية: إذا سألك الطالب عن أي تخصص، تساؤل، دبلومة، سعر، معلومة، كليات وتخصصات، أو استفسار "غير متوفر نهائياً" بالتغذية المرفقة ببيانات النظام والمنظومة، أو سأل عن مجالات وكليات طبية/هندسية تقليدية أخرى (مثل الصيدلة، الأسنان، الحقوق، الألسن، إلخ)، فلا ترفض الطلب بجفاف ولا تقل "غير متاح" أو "غير متوفر لدينا". بل تفاعل بمرونة مع الطالب وأجب حرفياً وتماماً بهذه العبارة الرائعة والمهذبة:
"سؤالك مهم جداً، اسمح لي أن أحولك لمستشار الأكاديمية المختص ليجيبك بدقة، هل يمكنني أخذ اسمك ورقم تليفونك؟"
تلتزم بالحفاظ على هذه الصياغة بشكل كامل لجذب تواصل الطالب وضمان تسجيل رغبته.
`;

  const systemInstruction = `${basePrompt}\n\n${safetyGuardrail}`;

  
  try {
    const ai = getGenAI();

    // Convert history format to GenAI structure
    const formattedContents: any[] = [];
    if (Array.isArray(history)) {
      history.forEach((m: any) => {
        if (m.sender === "user") {
          formattedContents.push({ role: "user", parts: [{ text: m.text }] });
        } else if (m.sender === "bot") {
          formattedContents.push({ role: "model", parts: [{ text: m.text }] });
        }
      });
    }

    // Append current user message
    formattedContents.push({ role: "user", parts: [{ text: message }] });

    // Robust content generator with model fallbacks & retries to bypass transient 503 errors
    const generateWithFallback = async (): Promise<string> => {
      const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];
      let lastError: any = null;

      for (const modelName of modelsToTry) {
        let delay = 250;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const res = await ai.models.generateContent({
              model: modelName,
              contents: formattedContents,
              config: {
                systemInstruction: systemInstruction,
                temperature: 0.75,
              }
            });
            if (res && res.text) {
              return res.text;
            }
          } catch (err: any) {
            lastError = err;
            const errStr = String(err?.message || err || "").toLowerCase();
            // If it's a structural key/credential error, don't bother retrying across other models
            if (errStr.includes("api_key") || errStr.includes("apikey") || errStr.includes("invalid key") || errStr.includes("unauthorized")) {
              throw err;
            }
            // Wait and apply exponential retry
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
          }
        }
      }
      throw lastError || new Error("All fallback models failed");
    };

    const textResult = await generateWithFallback();

    res.json({
      success: true,
      text: textResult || "عذراً، لم أستطع معالجة الرد بجودة كافية."
    });
  } catch (error: any) {
    console.warn("Gemini API is unavailable or KEY is missing. Applying smart live conversational fallback...", error.message);
    
    // Core fallback builder based on keywords and promptBase rules (Never blocks or outputs errors)
    const msg = message.toLowerCase();
    let reply = "";

    if (msg.includes("قسط") || msg.includes("تقسيط") || msg.includes("مصاريف") || msg.includes("سعر") || msg.includes("فلوس") || msg.includes("دفع") || msg.includes("كم")) {
      reply = "أهلاً بك يا غالي! نوفر لك ولجميع الطلاب نظام تقسيط شهري مريح جداً لتسهيل دفع المصروفات والرسوم الدراسية على دفعات ميسرة وبدون تعقيدات. \n\nهل ترغب في معرفة تفاصيل القسط الخاص بشعبة معينة؟";
    } else if (msg.includes("قسم") || msg.includes("أقسام") || msg.includes("شعبة") || msg.includes("تخصص") || msg.includes("دراسة") || msg.includes("صيانة") || msg.includes("تحاليل") || msg.includes("حاسب") || msg.includes("مجال")) {
      reply = "يسعدنا جداً اهتمامك بالأقسام المتميزة لدينا! نحن نقدم 5 تخصصات دبلومات مهنية معتمدة ورائدة في سوق العمل:\n1. 🩺 شعبة صيانة الأجهزة الطبية والمعملية\n2. 💻 شعبة الحاسب الآلي والبرمجيات ونظم النظم\n3. 🏥 شعبة السجل الطبي والسكرتارية الطبية والمستندات\n4. 🔬 شعبة التحاليل الطبية والخدمات الصحية المساعدة\n5. 📐 شعبة المساحة والخرائط والمقاولات العامة.\n\nأي تخصص بالتحديد تود معرفة تفاصيل المواد والتدريب به؟";
    } else if (msg.includes("شغل") || msg.includes("توظيف") || msg.includes("عمل") || msg.includes("تدريب") || msg.includes("مستشفى") || msg.includes("شركات")) {
      reply = "بالتأكيد! من أهم مزايا الانضمام إلينا هو توفير التدريب العملي والنقدي المكثف داخل كبرى المستشفيات والشركات والمصانع الشريكة، مما يمنحك خبرة حقيقية ويضمن لك فرصة توظيف فوري ومباشر بعد التخرج! 💼📈";
    } else if (msg.includes("تقديم") || msg.includes("تسجيل") || msg.includes("سجل") || msg.includes("قدم") || msg.includes("عنوان") || msg.includes("مكان") || msg.includes("مقر")) {
      reply = "يمكنك التقديم وتأكيد حجزك معنا الآن وبأسهل طريقة! فقط قم بملء استمارة الحجز وسيتواصل معك مستشارك الأكاديمي لشرح الأوراق والمستندات المطلوبة وبدء الإجراءات فوراً. التقديم والقبول فوري ومتاح حالياً!";
    } else if (msg.includes("سلام") || msg.includes("مرحبا") || msg.includes("أهلاً") || msg.includes("هلا") || msg.includes("صباح") || msg.includes("مساء") || msg.includes("ازيك")) {
      reply = "أهلاً بك في الأكاديمية! أنا مستشك الأكاديمي والمهني الذكي. يسعدني جداً الإجابة عن أي استفسار لديك بخصوص التقديم، المصروفات، الأوراق، أو الأقسام المعتمدة. كيف يمكنني مساعدتك اليوم؟ ✨";
    } else {
      reply = "سؤالك مهم جداً، اسمح لي أن أحولك لمستشار الأكاديمية المختص ليجيبك بدقة، هل يمكنني أخذ اسمك ورقم تليفونك؟";
    }

    res.json({
      success: true,
      text: reply
    });
  }
});

// --- ROI DEPARTMENTS DATABASE FILE PERSISTENT STORAGE ---
const ROI_DEPARTMENTS_PATH = path.join(process.cwd(), "roi-departments.json");

const DEFAULT_ROI_DEPARTMENTS = [
  {
    id: "computers",
    name: "شعبة الحاسبات البرمجية وتكنولوجيا المعلومات 💻",
    salary: 9500,
    careerPct: "طلب بنسبة %94 في السوق",
    role: "فني برمجة ونظم معلومات وقواعد بيانات بالشركات الكبرى والمنشآت الذكية",
    demandBadge: "🔥 طلب شديد جداً - مقاعد محدودة متبقية"
  },
  {
    id: "medical",
    name: "شعبة صيانة الأجهزة الطبية والمعامل 🩺",
    salary: 11000,
    careerPct: "طلب بنسبة %96 في السوق",
    role: "مهندس صيانة فني للمستشفيات، غرف العمليات، مراكز التشخيص الدورية",
    demandBadge: "🔥 طلب شديد جداً - مقاعد محدودة متبقية"
  },
  {
    id: "labs",
    name: "شعبة السكرتارية الطبية والمختبرات الحيوية 🔬",
    salary: 10500,
    careerPct: "طلب بنسبة %92 في السوق",
    role: "مختص استقبال وسجلات طبية أو مساعد معمل تحاليل وفحوصات حيوية",
    demandBadge: "🔥 طلب شديد جداً - مقاعد محدودة متبقية"
  },
  {
    id: "office",
    name: "شعبة المساحة والخرائط والمقاولات 📏",
    salary: 12000,
    careerPct: "طلب بنسبة %90 في السوق",
    role: "فني مساحي ورسام مخططات هندسية بشركات المقاولات والاستثمار العقاري",
    demandBadge: "🔥 طلب شديد جداً - مقاعد محدودة متبقية"
  }
];

function getRoiDepartments() {
  try {
    if (fs.existsSync(ROI_DEPARTMENTS_PATH)) {
      const data = fs.readFileSync(ROI_DEPARTMENTS_PATH, "utf8");
      return JSON.parse(data);
    } else {
      fs.writeFileSync(ROI_DEPARTMENTS_PATH, JSON.stringify(DEFAULT_ROI_DEPARTMENTS, null, 2), "utf8");
      return DEFAULT_ROI_DEPARTMENTS;
    }
  } catch (err) {
    console.error("Failed to read roi-departments file, using defaults:", err);
  }
  return DEFAULT_ROI_DEPARTMENTS;
}

function saveRoiDepartments(data: any) {
  try {
    fs.writeFileSync(ROI_DEPARTMENTS_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save roi-departments file:", err);
  }
}

// REST API for ROI Departments to support real Network DELETE and POST requests
app.get("/api/roi-departments", (req, res) => {
  const depts = getRoiDepartments();
  res.json({ success: true, departments: depts });
});

app.post("/api/roi-departments", (req, res) => {
  const { id, name, salary, careerPct, role, demandBadge } = req.body;
  if (!name) {
    return res.status(400).json({ error: "اسم القسم مطلوب" });
  }

  const depts = getRoiDepartments();
  const existingIndex = depts.findIndex((d: any) => d.id === id);
  const deptData = {
    id: id || "dept_" + Date.now(),
    name,
    salary: Number(salary) || 10000,
    careerPct: careerPct || "95%",
    role: role || "",
    demandBadge: demandBadge || "🔥 طلب شديد جداً - مقاعد محدودة متبقية"
  };

  if (existingIndex > -1) {
    depts[existingIndex] = deptData;
  } else {
    depts.push(deptData);
  }

  saveRoiDepartments(depts);
  res.json({ success: true, departments: depts });
});

app.delete("/api/roi-departments/:id", (req, res) => {
  const { id } = req.params;
  let depts = getRoiDepartments();
  depts = depts.filter((d: any) => d.id !== id);
  saveRoiDepartments(depts);
  res.json({ success: true, departments: depts });
});

app.post("/api/roi-departments/bulk", (req, res) => {
  const { departments } = req.body;
  if (!Array.isArray(departments)) {
    return res.status(400).json({ error: "الرجاء توفير مصفوفة الأقسام" });
  }
  saveRoiDepartments(departments);
  res.json({ success: true, departments });
});

export default app;
