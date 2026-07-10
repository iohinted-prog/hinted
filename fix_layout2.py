path = 'app/feed/FeedClient.js'
with open(path) as f:
    lines = f.readlines()

# Find the block starting with the inner <div> around line 1141
start = None
for i, line in enumerate(lines):
    if i > 1135 and i < 1150 and '<div className="min-w-0 flex-1">' in line:
        start = i
        break

print(f'Found at line {start+1}: {lines[start].rstrip()}')

# Find end - the matching closing div after actor_name and headline
# Look for the closing </div> that matches, then </div> for the justify-between wrapper
end = None
depth = 0
for i in range(start, start + 60):
    for ch in lines[i]:
        if '<div' in lines[i] and lines[i].index('<div') < lines[i].index(ch) if ch in lines[i] else False:
            pass
    if '<div' in lines[i]:
        depth += lines[i].count('<div')
    if '</div>' in lines[i]:
        depth -= lines[i].count('</div>')
    if depth <= 0 and i > start:
        end = i
        break

print(f'Block ends at line {end+1}')
print(''.join(lines[start:end+1]))
