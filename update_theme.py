import os
import re

files = [
    "src/components/BottomNav.tsx",
    "src/screens/HomeScreen.tsx",
    "src/screens/CollectionScreen.tsx",
    "src/screens/InsightsScreen.tsx",
    "src/screens/ProfileScreen.tsx",
    "src/screens/WishlistScreen.tsx",
    "src/screens/SetDetailScreen.tsx",
    "src/App.tsx",
    "src/screens/BrowseScreen.tsx",
    "src/screens/IdeasScreen.tsx",
    "src/screens/QuestsScreen.tsx",
    "src/screens/LeaderboardScreen.tsx",
    "src/screens/FeedScreen.tsx",
    "src/screens/CreatePostScreen.tsx",
    "src/screens/AlertsScreen.tsx"
]

replacements = [
    # Backgrounds
    (r'bg-slate-950', 'bg-[#F5F5F7]'),
    (r'bg-\[\#0D0D0F\]', 'bg-[#F5F5F7]'),
    (r'bg-\[\#111\]', 'bg-[#F5F5F7]'),
    (r'bg-slate-900', 'bg-white'),
    (r'bg-slate-800', 'bg-gray-50'),
    (r'bg-\[\#1C1C1E\]', 'bg-white'),
    (r'bg-zinc-800', 'bg-gray-100'),
    (r'bg-zinc-900', 'bg-white'),
    (r'bg-black', 'bg-white'),
    
    # Text
    (r'text-slate-100', 'text-gray-900'),
    (r'text-white', 'text-gray-900'),
    (r'text-slate-200', 'text-gray-800'),
    (r'text-zinc-200', 'text-gray-800'),
    (r'text-slate-300', 'text-gray-700'),
    (r'text-zinc-300', 'text-gray-700'),
    (r'text-slate-400', 'text-gray-500'),
    (r'text-zinc-400', 'text-gray-500'),
    (r'text-slate-500', 'text-gray-400'),
    (r'text-zinc-500', 'text-gray-400'),
    (r'text-zinc-600', 'text-gray-400'),
    
    # Borders
    (r'border-slate-800', 'border-gray-200'),
    (r'border-slate-700', 'border-gray-300'),
    (r'border-zinc-800', 'border-gray-200'),
    (r'border-white/5', 'border-gray-200'),
    (r'border-white/10', 'border-gray-200'),
    (r'border-white/20', 'border-gray-300'),
    
    # Divide
    (r'divide-slate-800', 'divide-gray-200'),
    (r'divide-white/10', 'divide-gray-200'),
    
    # Accents
    (r'text-blue-400', 'text-emerald-500'),
    (r'text-blue-500', 'text-emerald-600'),
    (r'bg-blue-500/10', 'bg-emerald-500/10'),
    (r'bg-blue-500/20', 'bg-emerald-500/20'),
    (r'bg-blue-400', 'bg-emerald-500'),
    (r'bg-blue-500', 'bg-emerald-500'),
    (r'border-blue-500/30', 'border-emerald-500/30'),
    (r'border-blue-500', 'border-emerald-500'),
    
    # Nav and specific
    (r'bg-slate-950/90', 'bg-white/90'),
    (r'border-t-slate-800', 'border-t-gray-200'),
    (r'from-slate-950/0', 'from-white/0'),
    (r'via-slate-950/80', 'via-white/80'),
    (r'to-slate-950', 'to-white'),
]

base_dir = "/Users/akeemojuko/.gemini/antigravity/scratch/appmain"

for file_path in files:
    full_path = os.path.join(base_dir, file_path)
    if os.path.exists(full_path):
        with open(full_path, 'r') as f:
            content = f.read()
            
        for pattern, replacement in replacements:
            content = re.sub(pattern, replacement, content)
            
        # Add shadows to cards where bg-white is now used, optionally
        # Actually simplest just doing exact class replacement as asked.
            
        with open(full_path, 'w') as f:
            f.write(content)
        print(f"Updated {file_path}")
    else:
        print(f"Missing {file_path}")
