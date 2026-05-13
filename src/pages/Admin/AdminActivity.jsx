import { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Download, Calendar } from "lucide-react";
import { getApiBaseUrl } from "../../utils/apiBaseUrl";
import { FilterSelect, SearchInput } from "../../components/Controls";
import { DataTable } from "../../components/DataTable";
import {
  useNavbarActions,
  NavbarActionButton,
} from "../../context/NavbarActionsContext";

const PAGE_SIZE = 20;

const ACTION_META = {
  TICKET_CLOSED:          { label: "Closed Ticket",           color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700/30" },
  TICKET_REOPENED:        { label: "Reopened Ticket",         color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/25 dark:text-green-400 dark:border-green-700/40" },
  TICKET_ASSIGNED:        { label: "Assigned Ticket",         color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700/30" },
  KNOWLEDGE_ADDED:        { label: "Added Knowledge",         color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700/30" },
  KNOWLEDGE_EDITED:       { label: "Edited Knowledge",        color: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700/30" },
  KNOWLEDGE_DELETED:      { label: "Deleted Knowledge",       color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700/30" },
  KNOWLEDGE_BULK_DELETED: { label: "Bulk Deleted Knowledge",  color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700/30" },
  ADMIN_CREATED:          { label: "Created Admin",           color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700/30" },
  ADMIN_DELETED:          { label: "Deleted Admin",           color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700/30" },
  ADMIN_DISABLED:         { label: "Disabled Admin",          color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-700/30" },
  ADMIN_ENABLED:          { label: "Enabled Admin",           color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/25 dark:text-green-400 dark:border-green-700/40" },
  ADMIN_LEVEL_CHANGED:    { label: "Changed Admin Level",     color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-700/30" },
};

const FILTER_OPTIONS = ["All", "Ticket Actions", "Knowledge Actions", "Admin Actions"];
const FILTER_MAP = {
  "All": null,
  "Ticket Actions": "ticket",
  "Knowledge Actions": "knowledge",
  "Admin Actions": "admin",
};

function getAuthHeader() {
  return { Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` };
}

function apiUrl(path) {
  return `${getApiBaseUrl()}${path}`;
}

function escapeCsv(value) {
  const s = String(value ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replaceAll('"', '""')}"`;
  }
  return s;
}

export default function AdminActivity() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const decoded = useMemo(() => {
    try { return jwtDecode(localStorage.getItem("authToken") || ""); }
    catch { return null; }
  }, []);

  const isGlobal = Number(decoded?.admin_level) === 0;
  const pageCount = Math.ceil(totalCount / PAGE_SIZE);

  useEffect(() => {
    const type = FILTER_MAP[filter];
    const params = new URLSearchParams({ page });
    if (type) params.set("type", type);
    if (search.trim()) params.set("search", search.trim());
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    fetch(apiUrl(`/api/admin/activity?${params}`), { headers: getAuthHeader() })
      .then((r) => r.json())
      .then((res) => {
        if (!res.success) { setError(res.message || "Failed to load activity"); return; }
        setLogs(res.data || []);
        setTotalCount(res.total ?? 0);
        setError("");
      })
      .catch(() => setError("Network error"));
  }, [page, filter, search, dateFrom, dateTo]);

  const handleFilter = (e) => {
    setFilter(e.target.value);
    setPage(0);
  };

  const handleSearch = (val) => {
    setSearch(val);
    setPage(0);
  };

  const handleDateFrom = (e) => {
    setDateFrom(e.target.value);
    setPage(0);
  };

  const handleDateTo = (e) => {
    setDateTo(e.target.value);
    setPage(0);
  };

  const handleDatePillClick = (e) => {
    const input = e.currentTarget.querySelector('input[type="date"]');
    if (!input) return;
    if (typeof input.showPicker === "function") { input.showPicker(); input.focus(); return; }
    input.focus();
  };

  const formatFilterDate = (ymd) => {
    if (!ymd) return "";
    const [y, m, d] = ymd.split("-");
    if (!y || !m || !d) return "";
    return `${m}/${d}/${y.slice(-2)}`;
  };

  const onExportCsv = async () => {
    try {
      const type = FILTER_MAP[filter];
      const params = new URLSearchParams({ all: "true" });
      if (type) params.set("type", type);
      if (search.trim()) params.set("search", search.trim());
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(apiUrl(`/api/admin/activity?${params}`), { headers: getAuthHeader() });
      const json = await res.json();
      if (!json.success) return;

      const headers = isGlobal
        ? ["date", "admin", "action", "target"]
        : ["date", "action", "target"];

      const rows = (json.data || []).map((log) => {
        const meta = ACTION_META[log.action_type];
        const action = meta?.label || log.action_type;
        const target = log.target_label || log.target_id || "";
        const date = log.created_at;
        if (isGlobal) {
          const admin = log.admin?.full_name || log.admin?.email || "";
          return [date, admin, action, target];
        }
        return [date, action, target];
      });

      const csv = [headers, ...rows]
        .map((row) => row.map(escapeCsv).join(","))
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `activity-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // silently ignore export errors
    }
  };

  useNavbarActions(
    <NavbarActionButton icon={Download} label="Export CSV" onClick={onExportCsv} />,
  );

  const columns = useMemo(() => {
    const cols = [];

    cols.push({
      label: "Date & Time",
      accessor: "created_at",
      variant: "date",
      colWidth: "w-36 md:w-40",
    });

    if (isGlobal) {
      cols.push({
        label: "Admin",
        accessor: (row) => row.admin?.full_name || row.admin?.email || "Unknown",
        variant: "title",
        colWidth: "w-36 md:w-44",
      });
    }

    cols.push({
      label: "Action",
      accessor: "action_type",
      render: (row) => {
        const meta = ACTION_META[row.action_type] || { label: row.action_type, color: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700" };
        return (
          <span className={`h-9 inline-flex items-center justify-center px-3 text-sm font-bold rounded-lg border transition-all whitespace-nowrap ${meta.color}`}>
            {meta.label}
          </span>
        );
      },
      colWidth: "w-44 md:w-52",
    });

    cols.push({
      label: "Target",
      render: (row) => {
        const text = row.target_label || row.target_id || "—";
        return (
          <span
            className="block max-w-xs truncate text-sm text-gray-600 dark:text-zinc-400"
            title={text}
          >
            {text}
          </span>
        );
      },
    });

    return cols;
  }, [isGlobal]);

  return (
    <section className="w-full max-w-330 mx-auto px-6 py-4 md:py-6 font-poppins h-full overflow-hidden flex flex-col dark:text-gray-100">
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="w-full md:w-1/4">
          <FilterSelect
            value={filter}
            onChange={handleFilter}
            options={FILTER_OPTIONS}
          />
        </div>
        <div className="w-full md:w-1/4 flex gap-2">
          <div
            className="relative group flex-1 cursor-pointer select-none bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 h-10 flex items-center justify-between gap-2 text-sm font-medium text-gray-700 dark:text-zinc-300 transition-all hover:border-lpu-maroon dark:hover:border-white/20 focus-within:ring-2 focus-within:ring-lpu-gold focus-within:border-lpu-gold"
            role="button" tabIndex={0}
            onClick={handleDatePillClick}
            onKeyDown={(e) => e.key === "Enter" && handleDatePillClick({ currentTarget: e.currentTarget })}
          >
            <span className="relative z-10 pointer-events-none truncate text-xs">
              {dateFrom ? `From ${formatFilterDate(dateFrom)}` : "From"}
            </span>
            <Calendar className="w-3.5 h-3.5 shrink-0 text-gray-400 group-hover:text-lpu-maroon transition-colors" />
            <input type="date" className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full" value={dateFrom} onChange={handleDateFrom} />
          </div>
          <div
            className="relative group flex-1 cursor-pointer select-none bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 h-10 flex items-center justify-between gap-2 text-sm font-medium text-gray-700 dark:text-zinc-300 transition-all hover:border-lpu-maroon dark:hover:border-white/20 focus-within:ring-2 focus-within:ring-lpu-gold focus-within:border-lpu-gold"
            role="button" tabIndex={0}
            onClick={handleDatePillClick}
            onKeyDown={(e) => e.key === "Enter" && handleDatePillClick({ currentTarget: e.currentTarget })}
          >
            <span className="relative z-10 pointer-events-none truncate text-xs">
              {dateTo ? `To ${formatFilterDate(dateTo)}` : "To"}
            </span>
            <Calendar className="w-3.5 h-3.5 shrink-0 text-gray-400 group-hover:text-lpu-maroon transition-colors" />
            <input type="date" className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full" value={dateTo} onChange={handleDateTo} />
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <SearchInput
            placeholder="Search admin, action, or target..."
            onSearch={handleSearch}
          />
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 dark:bg-red-950/20 text-lpu-red dark:text-red-400 p-4 rounded-xl font-semibold text-center border border-red-100 dark:border-red-900/30">
          {error}
        </div>
      ) : (
        <div className="w-full flex-1 min-h-0 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 flex flex-col">
          <DataTable
            columns={columns}
            data={logs}
            emptyMessage="No activity yet."
            emptySubMessage="Actions will appear here as admins use the system."
            page={page}
            pageCount={pageCount}
            totalCount={totalCount}
            onPrevPage={() => setPage((p) => Math.max(0, p - 1))}
            onNextPage={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          />
        </div>
      )}
    </section>
  );
}
