import { ArrowLeft, Bot, UserRound } from "lucide-react";

export default function ChatHeader({
  adminView,
  creatorName,
  creatorEmail,
  headerInitial,
  adminParticipants,
  isBotTicket,
  onBack,
  onTalkToHuman,
}) {
  const participants = Array.isArray(adminParticipants)
    ? adminParticipants
    : [];

  return (
    <div className="flex items-center p-3 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 transition-colors duration-300">
      <button
        className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
        onClick={onBack}
      >
        <ArrowLeft size={18} className="text-gray-600 dark:text-zinc-400" />
      </button>

      {/* scrollable carousel for identities */}
      <div className="flex-1 flex flex-nowrap items-center gap-4 overflow-x-auto scrollbar-hide py-1">
        {adminView ? (
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-lpu-maroon text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
              {headerInitial || "s"}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 dark:text-zinc-100 truncate text-xs">
                {creatorName}
              </div>
              <div className="text-[10px] text-gray-500 dark:text-zinc-400 truncate">
                {creatorEmail?.toLowerCase()}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {isBotTicket && (
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 bg-lpu-maroon text-white rounded-full flex items-center justify-center shrink-0 shadow-inner">
                  <Bot size={18} />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-zinc-100 text-xs">
                    Stella
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-zinc-500 truncate">
                    MISD Support Bot
                  </div>
                </div>
              </div>
            )}

            {participants.map((p) => (
              <div key={p.id} className="flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 bg-lpu-maroon/10 text-lpu-maroon dark:bg-lpu-maroon/20 dark:text-lpu-gold rounded-full flex items-center justify-center font-bold border border-lpu-maroon/20 dark:border-lpu-maroon/30 shrink-0 text-sm">
                  {(p.name || "A").trim().charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-xs text-gray-800 dark:text-zinc-200 truncate">
                    {p.name}
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-zinc-500 truncate">
                    {p.email?.toLowerCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {onTalkToHuman && (
        <button
          type="button"
          onClick={onTalkToHuman}
          className="ml-2 bg-lpu-maroon text-white p-2.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-2 hover:bg-lpu-gold hover:text-lpu-maroon transition-all shadow-lg shadow-lpu-maroon/20 active:scale-95 shrink-0"
        >
          <UserRound size={16} />
          <span className="hidden sm:inline font-bold uppercase text-xs tracking-tight">Talk to a human</span>
        </button>
      )}
    </div>
  );
}
