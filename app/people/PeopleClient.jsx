"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import AddContactModal from "../components/AddContactModal";
import EditContactModal from "../components/EditContactModal";

function getInitials(name) {
  return String(name || "").trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() || "").join("");
}

function getColors(role) {
  const r = String(role || "").toLowerCase();
  if (r === "partner" || r === "spouse") return "from-[#e8b9a7] to-[#bf755f]";
  if (r === "colleague") return "from-[#b7c8db] to-[#6b88a7]";
  return "from-[#efcdbf] to-[#bb8168]";
}

export default function PeopleClient() {
  const supabase = createClient();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addKey, setAddKey] = useState(0);
  const [editingContact, setEditingContact] = useState(null);
  const [search, setSearch] = useState("");

  async function loadContacts() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("contact_public_state")
      .select("*")
      .eq("owner_user_id", user.id)
      .order("name", { ascending: true });
    setContacts(data || []);
    setLoading(false);
  }

  useEffect(() => { loadContacts(); }, []);

  const filtered = contacts.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#fffaf7]">
      <div className="px-4 pt-6 pb-32">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-slate-900">People</h1>
          <button type="button" onClick={() => { setAddKey(k => k + 1); setIsAddOpen(true); }}
            className="h-10 px-4 rounded-full bg-gradient-to-b from-[#ff966f] to-[#ff7e54] text-sm font-semibold text-white shadow-lg">
            Add
          </button>
        </div>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search contacts..."
          className="w-full h-11 rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e] mb-4" />
        {loading ? (
          <p className="text-sm text-slate-400 text-center py-8">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-sm">No contacts yet</p>
            <button type="button" onClick={() => { setAddKey(k => k + 1); setIsAddOpen(true); }}
              className="mt-4 h-10 px-6 rounded-full bg-gradient-to-b from-[#ff966f] to-[#ff7e54] text-sm font-semibold text-white shadow-lg">
              Add your first contact
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(contact => {
              const initials = getInitials(contact.name);
              const colors = getColors(contact.role);
              return (
                <div key={contact.id} className="flex items-center gap-3 rounded-[18px] border border-[#f0dfd6] bg-white p-3">
                  {contact.avatar_url
                    ? <img src={contact.avatar_url} className="h-12 w-12 rounded-full object-cover shrink-0" alt="" />
                    : <div className={"flex items-center justify-center rounded-full h-12 w-12 bg-gradient-to-b font-bold text-white text-[13px] shrink-0 " + colors}>{initials}</div>}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{contact.name}</p>
                    <p className="text-[12px] text-slate-400">{contact.role || "Contact"}{contact.email ? " · " + contact.email : ""}</p>
                  </div>
                  <button type="button" onClick={() => setEditingContact(contact)}
                    className="h-8 w-8 flex items-center justify-center rounded-full border border-[#ead8ce] text-slate-400 hover:bg-[#fff5f0] shrink-0 text-sm">
                    ✎
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <AddContactModal key={addKey} modalKey={addKey} open={isAddOpen} onClose={() => setIsAddOpen(false)}
        onSave={async () => { await loadContacts(); setIsAddOpen(false); }} supabase={supabase} />
      {editingContact && (
        <EditContactModal contact={editingContact} onClose={() => setEditingContact(null)}
          onSave={async () => { await loadContacts(); setEditingContact(null); }} />
      )}
    </main>
  );
}
