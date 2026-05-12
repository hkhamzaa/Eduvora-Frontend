"use client";
import React from "react";
import { useGetGraphStatsQuery, useGetEnrollmentGraphQuery } from "@/redux/features/neo4j/neo4jApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { styles } from "@/app/styles/style";

// ── Types ──────────────────────────────────────────────────────────────────────
type EnrollmentEdge = {
  userId: string;
  userEmail: string;
  courseId: string;
  courseName: string;
};

type CourseGroup = { name: string; emails: string[]; count: number };

// ── Helpers ────────────────────────────────────────────────────────────────────
function groupByCourse(edges: EnrollmentEdge[]): CourseGroup[] {
  const map = new Map<string, CourseGroup>();
  for (const e of edges) {
    if (!map.has(e.courseId))
      map.set(e.courseId, { name: e.courseName, emails: [], count: 0 });
    const entry = map.get(e.courseId)!;
    entry.emails.push(e.userEmail);
    entry.count += 1;
  }
  return Array.from(map.values());
}

// ── Constants ──────────────────────────────────────────────────────────────────
const BAR_COLORS = ["#45CBA0", "#5ce1e6", "#8A7EFF"];

const SCHEMA_COLORS = {
  user: "#45CBA0",
  course: "#5ce1e6",
  category: "#FF9F43",
  rel: "#8A7EFF",
};

// ── Sub-components ─────────────────────────────────────────────────────────────
const GraphSchemaDiagram = () => (
  <svg viewBox="0 0 500 230" width="100%" height="100%">
    <defs>
      <marker id="neo4j-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill={SCHEMA_COLORS.rel} />
      </marker>
    </defs>

    <circle cx="75" cy="90" r="38" fill="rgba(69,203,160,0.12)" stroke={SCHEMA_COLORS.user} strokeWidth="2" />
    <text x="75" y="86" textAnchor="middle" fill={SCHEMA_COLORS.user} fontSize="12" fontWeight="700">:User</text>
    <text x="75" y="102" textAnchor="middle" fill={SCHEMA_COLORS.user} fontSize="9" opacity="0.65">id · email</text>

    <circle cx="255" cy="90" r="38" fill="rgba(92,225,230,0.12)" stroke={SCHEMA_COLORS.course} strokeWidth="2" />
    <text x="255" y="86" textAnchor="middle" fill={SCHEMA_COLORS.course} fontSize="12" fontWeight="700">:Course</text>
    <text x="255" y="102" textAnchor="middle" fill={SCHEMA_COLORS.course} fontSize="9" opacity="0.65">id · name · level</text>

    <circle cx="430" cy="90" r="38" fill="rgba(255,159,67,0.12)" stroke={SCHEMA_COLORS.category} strokeWidth="2" />
    <text x="430" y="86" textAnchor="middle" fill={SCHEMA_COLORS.category} fontSize="11" fontWeight="700">:Category</text>
    <text x="430" y="102" textAnchor="middle" fill={SCHEMA_COLORS.category} fontSize="9" opacity="0.65">name</text>

    <circle cx="255" cy="195" r="28" fill="rgba(92,225,230,0.07)" stroke={SCHEMA_COLORS.course} strokeWidth="1.5" strokeDasharray="5,3" />
    <text x="255" y="199" textAnchor="middle" fill={SCHEMA_COLORS.course} fontSize="10">:Course</text>

    <line x1="114" y1="90" x2="216" y2="90" stroke={SCHEMA_COLORS.rel} strokeWidth="1.5" markerEnd="url(#neo4j-arrow)" />
    <text x="165" y="77" textAnchor="middle" fill={SCHEMA_COLORS.rel} fontSize="8.5">ENROLLED_IN</text>

    <line x1="294" y1="90" x2="391" y2="90" stroke={SCHEMA_COLORS.rel} strokeWidth="1.5" markerEnd="url(#neo4j-arrow)" />
    <text x="342" y="77" textAnchor="middle" fill={SCHEMA_COLORS.rel} fontSize="8.5">BELONGS_TO</text>

    <line x1="255" y1="129" x2="255" y2="166" stroke={SCHEMA_COLORS.rel} strokeWidth="1.5" markerEnd="url(#neo4j-arrow)" strokeDasharray="4,3" />
    <text x="335" y="152" textAnchor="middle" fill={SCHEMA_COLORS.rel} fontSize="7.5">IS_PREREQUISITE_OF</text>
  </svg>
);

type StatCardProps = { icon: string; label: string; value: number | string; color: string };
const StatCard = ({ icon, label, value, color }: StatCardProps) => (
  <div className="dark:bg-[#0d1b3e] bg-gray-50 border dark:border-[#2a3a6e] border-gray-200 rounded-md p-4 text-center">
    <span className="text-[22px]">{icon}</span>
    <p className="mt-1 text-[10px] font-Poppins dark:text-gray-400 text-gray-500 uppercase tracking-widest">{label}</p>
    <p className="text-[24px] font-bold font-Poppins mt-1 leading-tight" style={{ color }}>{value}</p>
  </div>
);

const LiveBadge = () => (
  <span className="text-[11px] font-Poppins dark:text-[#45CBA0] text-green-700 bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-full border dark:border-green-800 border-green-200">
    ● Live
  </span>
);

// ── Main component ─────────────────────────────────────────────────────────────
const Neo4jGraphStats = () => {
  // Section 1: aggregate stats
  const { data: statsData, isLoading: statsLoading } = useGetGraphStatsQuery({});
  const stats = statsData?.graphStats;

  const statChartData = [
    { name: "Users",       value: stats?.totalUsers       ?? 0 },
    { name: "Courses",     value: stats?.totalCourses     ?? 0 },
    { name: "Enrollments", value: stats?.totalEnrollments ?? 0 },
  ];

  // Section 2: live enrollment edges
  const { data: graphData, isLoading: graphLoading } = useGetEnrollmentGraphQuery({});
  const edges: EnrollmentEdge[] = graphData?.enrollmentGraph ?? [];
  const grouped: CourseGroup[] = groupByCourse(edges);
  const enrollmentBarData = grouped.map((g) => ({ name: g.name, Enrolled: g.count }));

  return (
    <div className="mt-8 dark:bg-[#111c43] w-[94%] m-auto rounded-sm shadow-sm mb-8">

      {/* ══════════════════════════════════════════════════════════════
          Section 1 — Aggregate stats + schema diagram
      ══════════════════════════════════════════════════════════════ */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`${styles.title} !text-[20px] !text-start`}>Neo4j Knowledge Graph</h2>
          <LiveBadge />
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Left: stat cards + bar chart */}
          <div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              <StatCard icon="👤" label="Users"       value={statsLoading ? "…" : (stats?.totalUsers       ?? 0)} color={BAR_COLORS[0]} />
              <StatCard icon="📚" label="Courses"     value={statsLoading ? "…" : (stats?.totalCourses     ?? 0)} color={BAR_COLORS[1]} />
              <StatCard icon="🔗" label="Enrollments" value={statsLoading ? "…" : (stats?.totalEnrollments ?? 0)} color={BAR_COLORS[2]} />
            </div>
            <div className="h-[190px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statChartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                  <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 12, fontFamily: "Poppins" }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    contentStyle={{ background: "#0d1b3e", border: "1px solid #2a3a6e", borderRadius: 6 }}
                    labelStyle={{ color: "#fff", fontFamily: "Poppins", fontSize: 13 }}
                    itemStyle={{ color: "#45CBA0" }}
                  />
                  <Bar dataKey="value" radius={[5, 5, 0, 0]} maxBarSize={64}>
                    {statChartData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: graph schema SVG */}
          <div className="flex flex-col justify-center">
            <p className="text-center text-[11px] font-Poppins dark:text-gray-400 text-gray-500 mb-2 uppercase tracking-widest">
              Graph Schema
            </p>
            <div className="h-[230px]"><GraphSchemaDiagram /></div>
            <p className="text-center text-[10px] dark:text-gray-500 text-gray-400 mt-1 font-Poppins leading-relaxed">
              Nodes &amp; relationships powering recommendations and learning paths
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          Section 2 — Live enrollment graph from Neo4j
      ══════════════════════════════════════════════════════════════ */}
      <div className="border-t dark:border-[#2a3a6e] border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`${styles.title} !text-[20px] !text-start`}>
            Enrollment Graph — Live from Neo4j
          </h2>
          <LiveBadge />
        </div>

        {graphLoading ? (
          <p className="text-center font-Poppins dark:text-gray-400 text-gray-500 text-sm py-8">
            Loading enrollment data…
          </p>
        ) : grouped.length === 0 ? (
          <p className="text-center font-Poppins dark:text-gray-400 text-gray-500 text-sm py-8">
            No enrollments in graph yet.
          </p>
        ) : (
          <>
            {/* Bar chart: enrolled users per course */}
            <div className="h-[220px] mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentBarData} margin={{ top: 5, right: 20, left: 0, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#9ca3af", fontSize: 11, fontFamily: "Poppins" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    tickLine={false}
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    contentStyle={{ background: "#0d1b3e", border: "1px solid #2a3a6e", borderRadius: 6 }}
                    labelStyle={{ color: "#fff", fontFamily: "Poppins", fontSize: 13 }}
                    itemStyle={{ color: "#45CBA0" }}
                  />
                  <Bar dataKey="Enrolled" fill="#45CBA0" radius={[5, 5, 0, 0]} maxBarSize={56} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Per-course breakdown: course name + enrolled user emails */}
            <div className="grid grid-cols-1 gap-4">
              {grouped.map((course) => (
                <div
                  key={course.name}
                  className="dark:bg-[#0d1b3e] bg-gray-50 border dark:border-[#2a3a6e] border-gray-200 rounded-md p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-Poppins font-semibold dark:text-white text-black text-sm">
                      {course.name}
                    </p>
                    <span
                      className="text-[11px] font-Poppins px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(69,203,160,0.15)", color: "#45CBA0" }}
                    >
                      {course.count} enrolled
                    </span>
                  </div>
                  <div className="max-h-[80px] overflow-y-auto flex flex-wrap gap-1">
                    {course.emails.map((email) => (
                      <span
                        key={email}
                        className="text-[10px] font-Poppins dark:text-gray-300 text-gray-600 dark:bg-[#1a2a5e] bg-gray-100 px-2 py-0.5 rounded"
                      >
                        {email}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default Neo4jGraphStats;
