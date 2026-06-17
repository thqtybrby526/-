import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://wufymhbyxwheihtxadnb.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export const app = express();

// Enable JSON bodies parsing
app.use(express.json());

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
}

interface CallbackRequest {
  id: string;
  phoneNumber: string;
  studentName?: string;
  date: string;
  status: "pending" | "completed" | "no_reply";
  agentName?: string;
  internalNotes?: string;
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
let callbackRequests: CallbackRequest[] = [
  {
    id: "cb-1",
    phoneNumber: "01511223344",
    studentName: "يوسف علي النجار",
    date: new Date().toLocaleString("ar-EG"),
    status: "pending"
  },
  {
    id: "cb-2",
    phoneNumber: "01122334455",
    studentName: "والد الطالبة منة الله",
    date: new Date().toLocaleString("ar-EG"),
    status: "completed"
  }
];

let complaintsAnswers: Complaint[] = [
  {
    id: "comp-1",
    studentName: "خالد سعيد صالح",
    phoneNumber: "01011223344",
    type: "suggestion",
    text: "نقترح توفير باصات لنقل المغتربين من مواقف المحافظات الرئيسية إلى الأكاديمية.",
    date: new Date().toLocaleDateString("ar-EG")
  }
];

// Helper serializers/deserializers to save internalNotes & wantsEquivalence inside notes column to respect current db columns
function serializeNotes(userNotes: string, internalNotes?: string, wantsEquivalence?: boolean): string {
  let result = userNotes || "";
  if (internalNotes) {
    result += `\n__INTERNAL_NOTES__:${internalNotes}`;
  }
  if (wantsEquivalence !== undefined) {
    result += `\n__WANTS_EQUIVALENCE__:${wantsEquivalence}`;
  }
  return result;
}

function deserializeNotes(rawNotes: string): { userNotes: string, internalNotes: string, wantsEquivalence: boolean } {
  if (!rawNotes) {
    return { userNotes: "", internalNotes: "", wantsEquivalence: false };
  }

  let userNotes = rawNotes;
  let internalNotes = "";
  let wantsEquivalence = false;

  const internalIdx = rawNotes.indexOf("\n__INTERNAL_NOTES__:");
  const equivalenceIdx = rawNotes.indexOf("\n__WANTS_EQUIVALENCE__:");

  if (internalIdx !== -1) {
    const endIdx = equivalenceIdx !== -1 && equivalenceIdx > internalIdx ? equivalenceIdx : rawNotes.length;
    internalNotes = rawNotes.substring(internalIdx + 20, endIdx);
    userNotes = userNotes.replace(rawNotes.substring(internalIdx, endIdx), "");
  }

  if (equivalenceIdx !== -1) {
    const valStr = rawNotes.substring(equivalenceIdx + 22).trim();
    wantsEquivalence = valStr === "true";
    userNotes = userNotes.replace(rawNotes.substring(equivalenceIdx), "");
  }

  return {
    userNotes: userNotes.trim(),
    internalNotes: internalNotes.trim(),
    wantsEquivalence
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

  // Parse notes to retrieve userNotes, internalNotes, and wantsEquivalence
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
    wantsEquivalence: parsed.wantsEquivalence
  };
}

// Pulls students table, and seeds with initial data if empty
async function getLeadsFromSupabase(): Promise<Lead[]> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching students from Supabase:", error);
      return [];
    }

    if (data && data.length === 0) {
      console.log("No records found in students table. Seeding initial data...");
      await seedInitialData();
      const { data: seededData } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });
      return (seededData || []).map(mapDbRowToLead);
    }

    return (data || []).map(mapDbRowToLead);
  } catch (err) {
    console.error("Catch error in fetching students:", err);
    return [];
  }
}

// Finds a single student row matching ID or registration code
async function findStudentRow(id: string): Promise<any> {
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

  return null;
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

  const { error } = await supabase.from('students').insert(initialLeads);
  if (error) {
    console.error("Error seeding initial students to Supabase:", error);
  } else {
    console.log("Successfully seeded initial students to Supabase.");
  }
}

// Gets the next available sequential reservation code based on max code in Supabase
async function getNextReservationCode(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('reservation_code');

    if (error || !data) {
      return "1002";
    }

    let maxCode = 1001;
    for (const row of data) {
      const code = parseInt(row.reservation_code);
      if (!isNaN(code) && code > maxCode) {
        maxCode = code;
      }
    }
    return String(maxCode + 1);
  } catch (err) {
    return "1002";
  }
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

// API: Post Callback Request from student
app.post("/api/callbacks", (req, res) => {
  const { phoneNumber, studentName } = req.body;
  if (!phoneNumber) {
    res.status(400).json({ error: "الرجاء إدخال رقم الهاتف لطلب الاتصال." });
    return;
  }

  const newRequest: CallbackRequest = {
    id: "cb-" + Math.floor(100000 + Math.random() * 900000),
    phoneNumber,
    studentName: studentName || "زائر غير مسجل الاسم",
    date: new Date().toLocaleString("ar-EG"),
    status: "pending"
  };

  callbackRequests.unshift(newRequest);
  res.json({
    success: true,
    message: "تم استقبال طلب الاتصال بنجاح. سيتواصل معك مستشار القبول قريبًا.",
    callback: newRequest
  });
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

// API: Admin endpoint to fetch both leads, callback requests, and complaints
app.get("/api/admin/data", async (req, res) => {
  const supabaseLeads = await getLeadsFromSupabase();
  res.json({
    success: true,
    leads: supabaseLeads,
    callbacks: callbackRequests,
    complaints: complaintsAnswers
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
      res.json({ success: true, callbacks: callbackRequests, leads: supabaseLeads });
      return;
    }
  } else if (type === "lead") {
    const dbRow = await findStudentRow(id);
    if (dbRow) {
      const updatePayload: any = { status };
      if (agentName !== undefined) {
        updatePayload.specialization = agentName; // Saving agentName inside specialization column
      }

      const { error: updateErr } = await supabase
        .from('students')
        .update(updatePayload)
        .eq('reservation_code', dbRow.reservation_code);

      if (updateErr) {
        console.error("Supabase update-status error:", updateErr);
      }
    }

    const supabaseLeads = await getLeadsFromSupabase();
    res.json({ success: true, callbacks: callbackRequests, leads: supabaseLeads });
    return;
  }
  res.status(404).json({ error: "الطلب غير موجود" });
});

app.post("/api/admin/delete", async (req, res) => {
  const { type, id } = req.body;
  if (type === "lead") {
    const dbRow = await findStudentRow(id);
    if (dbRow) {
      const { error: deleteErr } = await supabase
        .from('students')
        .delete()
        .eq('reservation_code', dbRow.reservation_code);

      if (deleteErr) {
        console.error("Supabase delete error:", deleteErr);
      }
    }
    const supabaseLeads = await getLeadsFromSupabase();
    res.json({ success: true, leads: supabaseLeads });
  } else if (type === "callback") {
    callbackRequests = callbackRequests.filter(c => c.id !== id);
    res.json({ success: true, callbacks: callbackRequests });
  } else if (type === "complaint") {
    complaintsAnswers = complaintsAnswers.filter(c => c.id !== id);
    res.json({ success: true, complaints: complaintsAnswers });
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

    const { error: updateErr } = await supabase
      .from('students')
      .update({ notes: serializedNotes })
      .eq('reservation_code', dbRow.reservation_code);

    if (updateErr) {
      console.error("Error updating toggle equivalence:", updateErr);
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

      const { error: updateErr } = await supabase
        .from('students')
        .update({ notes: serializedNotes })
        .eq('reservation_code', dbRow.reservation_code);

      if (updateErr) {
        console.error("Error updating internal note:", updateErr);
      }

      const supabaseLeads = await getLeadsFromSupabase();
      res.json({ success: true, callbacks: callbackRequests, leads: supabaseLeads });
      return;
    }
  }
  res.status(404).json({ error: "الطلب غير موجود" });
});

// API: Handle Lead/Inquiry Registration (saves to Supabase database table)
app.post("/api/leads", async (req, res) => {
  const { studentName, phoneNumber, whatsappNumber, graduationYear, governorate, educationLevel, basicCourse, selectedDepartments, notes } = req.body;

  if (!studentName || !phoneNumber) {
    res.status(400).json({ error: "الرجاء توفير الاسم الرباعي ورقم الهاتف لإتمام عملية الحجز المبدئي." });
    return;
  }

  // Sequential code generator based on max code in DB
  const reservationCode = await getNextReservationCode();

  // Serialize to preserve equivalence and internalNotes natively
  const serializedNotes = serializeNotes(notes || "", "", false);

  const newStudentRow = {
    full_name: studentName.trim(),
    phone: phoneNumber.trim(),
    whatsapp_number: whatsappNumber ? whatsappNumber.trim() : "",
    graduation_year: graduationYear ? graduationYear.trim() : "",
    governorate: governorate ? governorate.trim() : "",
    education_level: educationLevel || "غير محدد",
    basic_course: basicCourse || "دورة أكتوبر 2026 (الرئيسية)",
    selected_departments: selectedDepartments || [],
    notes: serializedNotes,
    reservation_code: reservationCode,
    status: "pending",
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("ar-EG"),
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('students')
    .insert([newStudentRow])
    .select();

  if (error) {
    console.error("Supabase error during student registration:", error);
    res.status(500).json({ 
      error: "حدث خطأ أثناء حفظ البيانات بقاعدة البيانات. الرجاء المحاولة لاحقاً.",
      supabaseError: {
        message: error.message,
        details: error.details,
        code: error.code
      }
    });
    return;
  }

  const insertedRow = data && data.length > 0 ? data[0] : null;
  const mappedLead = insertedRow ? mapDbRowToLead(insertedRow) : mapDbRowToLead(newStudentRow);

  res.json({
    success: true,
    message: "تم تسجيل طلبك وحفظ الخصم بنجاح! سيقوم مستشار القبول والتسجيل بالتواصل معك قريباً.",
    reservation: mappedLead
  });
});

export default app;
