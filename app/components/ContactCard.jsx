"use client";

export function getStarSign(birthday) {
  if (!birthday) return null;
  const d = new Date(birthday);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return "♈ Aries";
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return "♉ Taurus";
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return "♊ Gemini";
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return "♋ Cancer";
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return "♌ Leo";
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return "♍ Virgo";
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return "♎ Libra";
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return "♏ Scorpio";
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return "♐ Sagittarius";
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return "♑ Capricorn";
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return "♒ Aquarius";
  return "♓ Pisces";
}

function getInitials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "C";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ContactCard({ contact, onOpenProfile }) {
  const profileId = contact.profileId || contact.matchedProfileId || null;
  const isClickable = Boolean(profileId && !contact.isDemo && onOpenProfile);

  function handleClick() {
    if (isClickable) onOpenProfile({
      userId: profileId,
      name: contact.name,
      avatarUrl: contact.avatarUrl,
      initials: contact.initials || getInitials(contact.name),
    });
  }

  return (
    <article
      className={`rounded-[22px] border border-[#f0dfd6] bg-white p-4 shadow-sm transition-all duration-200 ${isClickable ? "hover:-translate-y-0.5 hover:shadow-md hover:border-[#e8c9bc] cursor-pointer" : "hover:-translate-y-0.5 hover:shadow-md"}`}
      onClick={isClickable ? handleClick : undefined}
    >
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 shrink-0 rounded-full overflow-hidden flex items-center justify-center">
          {contact.avatarUrl ? (
            <img src={contact.avatarUrl} alt={contact.name || "Contact"} className="h-11 w-11 rounded-full object-cover" />
          ) : (
            <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b ${contact.colors || "from-[#efcdbf] to-[#bb8168]"} text-[12px] font-bold text-white`}>
              {contact.initials || getInitials(contact.name)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 truncate">{contact.name}</p>
          <p className="text-xs text-slate-500 truncate">
            {contact.role || "Friend"}{contact.note ? ` · ${contact.note}` : ""}
          </p>
          {contact.birthday && (
            <p className="text-[11px] text-[#df7b59] mt-0.5 truncate">
              🎂 {new Date(contact.birthday).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · {getStarSign(contact.birthday)}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
