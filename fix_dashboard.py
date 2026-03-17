import re

# Fix 1: Add rejected filter to products query in dashboard_server.js
with open("/Users/Residentialist/.openclaw/workspace/residentialist/dashboard/dashboard_server.js", "r") as f:
    content = f.read()

old_query = "WHERE overall_score IS NOT NULL ORDER BY overall_score DESC"
new_query = "WHERE overall_score IS NOT NULL AND (status IS NULL OR status != \x27rejected\x27) ORDER BY overall_score DESC"
content = content.replace(old_query, new_query)

with open("/Users/Residentialist/.openclaw/workspace/residentialist/dashboard/dashboard_server.js", "w") as f:
    f.write(content)
print("dashboard_server.js: rejected filter added")

# Fix 2: Update footer in index.html
with open("/Users/Residentialist/.openclaw/workspace/residentialist/dashboard/public/index.html", "r") as f:
    content = f.read()

content = content.replace("Created with Perplexity Computer", "Residentialist \u2014 All Rights Reserved")

with open("/Users/Residentialist/.openclaw/workspace/residentialist/dashboard/public/index.html", "w") as f:
    f.write(content)
print("index.html: footer updated")
