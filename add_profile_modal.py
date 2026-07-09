path = 'app/feed/FeedClient.js'
with open(path) as f:
    content = f.read()

# 1. Add UserProfileModal component before FeedItem function
profile_modal = '''
function UserProfileModal({ userId, name, avatarUrl, initials, onClose }) {
  const [hints, setHints] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;
    async function load() {
      setLoading(true);
      const [{ data: profileData }, { data: hintsData }] = await Promise.all([
        supabase.from("profiles").select("full_name, avatar_url, interests").eq("id", userId).maybeSingle(),
        supabase.from("hints").select("id, title, image_url, numeric_price, currency, retailer, url, starred").eq("user_id", userId).eq("is_private", false).order("position", { ascending: true }).limit(40),
      ]);
      setProfile(profileData);
      setHints(hintsData || []);
      setLoading(false);
    }
    load();
  }, [userId]);

  const displayName = profile?.full_name || name || "User";
  const displayAvatar = profile?.avatar_url || avatarUrl;
  const interests = Array.isArray(profile?.interests) ? profile.interests : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(33,24,20,0.42)] backdrop-blur-sm sm:items-center sm:px-4" onClick={onClose}>
      <div
        className="flex w-full max-w-[640px] flex-col overflow-hidden rounded-t-[32px] border border-[#efdcd2] bg-white shadow-[0_28px_80px_rgba(75,45,30,0.18)] sm:rounded-[32px]"
        style={{ maxHeight: "90dvh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 border-b border-[#f2e5de] px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {displayAvatar ? (
                <img src={displayAvatar} alt={displayName} className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-[#efcdbf] to-[#bb8168] text-[14px] font-bold text-white">
                  {initials || getInitials(displayName)}
                </div>
              )}
              <div>
                <p className="text-[18px] font-semibold text-slate-900">{displayName}</p>
                {interests.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {interests.slice(0, 5).map((interest) => (
                      <span key={interest} className="rounded-full bg-[#fff4ee] px-2.5 py-0.5 text-[11px] font-semibold text-[#df7b59]">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#efe0d7] text-slate-500 hover:bg-[#faf6f3]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Hints */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">Loading hints...</div>
          ) : hints.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">No public hints yet.</div>
          ) : (
            <div className="columns-2 gap-3">
              {hints.map((hint) => (
                <div key={hint.id} className="mb-3 break-inside-avoid">
                  
                    href={hint.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block overflow-hidden rounded-[20px] border border-[#f0dfd6] bg-[#fffaf7] hover:border-[#e8c9bc] transition-colors"
                  >
                    {hint.image_url ? (
                      <img src={hint.image_url} alt={hint.title} className="w-full object-cover" style={{ aspectRatio: "1/1" }} />
                    ) : (
                      <div className="flex items-center justify-center bg-gradient-to-br from-[#f3d5cc] to-[#d98c76]" style={{ aspectRatio: "1/1" }}>
                        <span className="text-2xl">🎁</span>
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-[13px] font-semibold text-slate-900 line-clamp-2">{hint.title}</p>
                      {hint.numeric_price != null && (
                        <p className="mt-1 text-[12px] text-[#df7b59] font-medium">
                          {new Intl.NumberFormat("en-GB", { style: "currency", currency: hint.currency || "GBP" }).format(hint.numeric_price)}
                        </p>
                      )}
                      <p className="mt-0.5 text-[11px] text-slate-400 truncate">{hint.retailer}</p>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'''

# Insert before FeedItem function
insert_before = 'function FeedItem({'
if insert_before in content:
    content = content.replace(insert_before, profile_modal + insert_before, 1)
    print('Added UserProfileModal')
else:
    print('ERROR: could not find FeedItem function')

# 2. Add profileModal state to the main component
old_state = '  const [feedItems, setFeedItems] = useState([]);'
new_state = '''  const [feedItems, setFeedItems] = useState([]);
  const [profileModal, setProfileModal] = useState(null); // { userId, name, avatarUrl, initials }'''
content = content.replace(old_state, new_state, 1)
print('Added profileModal state')

# 3. Replace the avatar Link in FeedItem with a button that opens the modal
# We need to pass onOpenProfile down to FeedItem and use it
# First update FeedItem signature to accept onOpenProfile
old_feeditem_props = '''  demoReactionsState,
  onToggleDemoReaction,
}) {'''
new_feeditem_props = '''  demoReactionsState,
  onToggleDemoReaction,
  onOpenProfile,
}) {'''
content = content.replace(old_feeditem_props, new_feeditem_props, 1)
print('Added onOpenProfile to FeedItem props')

# 4. Add isRealUser check and replace Link avatar with button
old_actor = '''  const actorHref = metadata.actor_profile_href || item.cta_href || "#";
  const actorInitials = metadata.actor_avatar_initials || getInitials(metadata.actor_name || item.headline || "H");'''
new_actor = '''  const actorHref = metadata.actor_profile_href || item.cta_href || "#";
  const actorInitials = metadata.actor_avatar_initials || getInitials(metadata.actor_name || item.headline || "H");
  const actorUserId = item.actor_user_id && item.actor_user_id !== "hinted-demo" ? item.actor_user_id : null;
  const actorAvatarUrl = metadata.actor_avatar_url || null;'''
content = content.replace(old_actor, new_actor, 1)
print('Added actorUserId check')

# 5. Replace the avatar Link with a smart button/link
old_avatar_link = '''        <Link
          href={actorHref}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#efcdbf] to-[#bb8168] text-[12px] font-bold text-white transition hover:scale-[1.03]"
        >
          {actorInitials}
        </Link>'''
new_avatar_link = '''        {actorUserId ? (
          <button
            type="button"
            onClick={() => onOpenProfile && onOpenProfile({ userId: actorUserId, name: metadata.actor_name, avatarUrl: actorAvatarUrl, initials: actorInitials })}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#efcdbf] to-[#bb8168] text-[12px] font-bold text-white transition hover:scale-[1.03] overflow-hidden"
          >
            {actorAvatarUrl ? <img src={actorAvatarUrl} alt={metadata.actor_name || ""} className="h-full w-full object-cover" /> : actorInitials}
          </button>
        ) : (
          <Link
            href={actorHref}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#efcdbf] to-[#bb8168] text-[12px] font-bold text-white transition hover:scale-[1.03]"
          >
            {actorInitials}
          </Link>
        )}'''
if old_avatar_link in content:
    content = content.replace(old_avatar_link, new_avatar_link, 1)
    print('Updated avatar to button/link')
else:
    print('ERROR: avatar link not found')

# 6. Replace the actor name Link with a smart button/link
old_name_link = '''                <Link href={actorHref} className="mt-3 inline-block text-[13px] font-semibold text-slate-900 hover:text-[#d96d4f]">
                  {metadata.actor_name}
                </Link>'''
new_name_link = '''                {actorUserId ? (
                  <button
                    type="button"
                    onClick={() => onOpenProfile && onOpenProfile({ userId: actorUserId, name: metadata.actor_name, avatarUrl: actorAvatarUrl, initials: actorInitials })}
                    className="mt-3 inline-block text-[13px] font-semibold text-slate-900 hover:text-[#d96d4f]"
                  >
                    {metadata.actor_name}
                  </button>
                ) : (
                  <Link href={actorHref} className="mt-3 inline-block text-[13px] font-semibold text-slate-900 hover:text-[#d96d4f]">
                    {metadata.actor_name}
                  </Link>
                )}'''
if old_name_link in content:
    content = content.replace(old_name_link, new_name_link, 1)
    print('Updated name to button/link')
else:
    print('ERROR: name link not found')

# 7. Pass onOpenProfile to FeedItem in the render
old_feeditem_render = '''                        <FeedItem
                          key={item.id}
                          item={item}
                          comments={mergedComments}
                          activeComposerId={activeComposerId}
                          setActiveComposerId={setActiveComposerId}
                          draftComment={draftComment}
                          setDraftComment={setDraftComment}
                          onSubmitComment={handleSubmitComment}
                          demoReactionsState={demoReactionsByFeedId[item.id]}
                          onToggleDemoReaction={handleToggleDemoReaction}
                        />'''
new_feeditem_render = '''                        <FeedItem
                          key={item.id}
                          item={item}
                          comments={mergedComments}
                          activeComposerId={activeComposerId}
                          setActiveComposerId={setActiveComposerId}
                          draftComment={draftComment}
                          setDraftComment={setDraftComment}
                          onSubmitComment={handleSubmitComment}
                          demoReactionsState={demoReactionsByFeedId[item.id]}
                          onToggleDemoReaction={handleToggleDemoReaction}
                          onOpenProfile={setProfileModal}
                        />'''
if old_feeditem_render in content:
    content = content.replace(old_feeditem_render, new_feeditem_render, 1)
    print('Passed onOpenProfile to FeedItem render')
else:
    print('ERROR: FeedItem render not found')

# 8. Add UserProfileModal to the JSX return at the end (before closing </main>)
old_end = '      <BusyOverlay open={busyState.open} title={busyState.title} message={busyState.message} />\n    </main>'
new_end = '''      <BusyOverlay open={busyState.open} title={busyState.title} message={busyState.message} />
      {profileModal && (
        <UserProfileModal
          userId={profileModal.userId}
          name={profileModal.name}
          avatarUrl={profileModal.avatarUrl}
          initials={profileModal.initials}
          onClose={() => setProfileModal(null)}
        />
      )}
    </main>'''

# FeedClient might not have BusyOverlay - find the closing main tag
if old_end in content:
    content = content.replace(old_end, new_end, 1)
    print('Added UserProfileModal to JSX')
else:
    # Try finding just the end of the main component
    old_end2 = '    </main>\n  );\n}'
    new_end2 = '''      {profileModal && (
        <UserProfileModal
          userId={profileModal.userId}
          name={profileModal.name}
          avatarUrl={profileModal.avatarUrl}
          initials={profileModal.initials}
          onClose={() => setProfileModal(null)}
        />
      )}
    </main>
  );
}'''
    if old_end2 in content:
        content = content.replace(old_end2, new_end2, 1)
        print('Added UserProfileModal to JSX (alt)')
    else:
        print('ERROR: could not find closing main tag')

with open(path, 'w') as f:
    f.write(content)
print('Done')
