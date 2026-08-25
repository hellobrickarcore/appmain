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
    (r'bg-\[\#1A1A1A\]', 'bg-white shadow-sm'),
    (r'border-white/6', 'border-gray-100'),
    (r'active:bg-white/5', 'active:bg-gray-50'),
    (r'bg-white/10', 'bg-gray-100'),
    (r'bg-white/5', 'bg-gray-50'),
    (r'text-white/80', 'text-gray-700'),
    (r'text-white/70', 'text-gray-600'),
    (r'text-white/60', 'text-gray-500'),
    (r'text-white/50', 'text-gray-400'),
    (r'text-white/40', 'text-gray-400'),
]

base_dir = "/Users/akeemojuko/.gemini/antigravity/scratch/appmain"

for file_path in files:
    full_path = os.path.join(base_dir, file_path)
    if os.path.exists(full_path):
        with open(full_path, 'r') as f:
            content = f.read()
            
        for pattern, replacement in replacements:
            content = re.sub(pattern, replacement, content)
            
        with open(full_path, 'w') as f:
            f.write(content)
        print(f"Updated {file_path}")
