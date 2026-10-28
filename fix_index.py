import re

src = open("index.html", encoding="utf-8").read()

def patch(name, pattern, repl, flags=re.S):
    global src
    new, n = re.subn(pattern, repl, src, count=1, flags=flags)
    print(("OK    " if n else "SKIP  ") + name)
    src = new

# 1) renderOverview-এর ডুপ্লিকেট const (SyntaxError) মোছা + Neon ফেল করলে localStorage fallback
patch(
    "duplicate declarations in renderOverview",
    r'[ \t]*const gates = await loadGatePasses\(\);[^\n]*\n.*?'
    r'const L=lic\(\),staff=rd\("young_staff_ip_v2",null\),'
    r'gates=rd\("youngLabelsGatePasses",\[\]\),'
    r'pur=rd\("youngPurchaseRecords",\[\]\);[ \t]*\r?\n',
    lambda m: '  let gates = await loadGatePasses();\n'
              '  if(!gates||!gates.length) gates = rd("youngLabelsGatePasses",[]);\n'
)

# 2) API ফেল করলে [] না দিয়ে null দেওয়া (ফাঁকা ডেটা আসল ডেটার মতো না দেখানোর জন্য)
patch(
    "loadGatePasses returns null on error",
    r"(console\.error\('Gate Pass load error:', e\);\s*)return \[\];",
    lambda m: m.group(1) + "return null;"
)

# 3) Gate Pass পেজের ভাঙা supabase লাইন মোছা (লাইব্রেরি লোড করা নেই)
patch(
    "broken supabase client in gate page",
    r'const SUPABASE_URL = .*?SUPABASE_KEY\\n\);',
    lambda m: ''
)

# 4) দুটো রেন্ডার একসাথে চললে ওভারল্যাপ বন্ধ করা
patch(
    "render overlap guard",
    r'async function renderOverview\(\)\{',
    lambda m: 'let ovBusy=false;\n'
              'async function renderOverview(){ if(ovBusy)return; ovBusy=true; '
              'try{ await renderOverviewInner(); }catch(e){ console.error(e); } '
              'finally{ ovBusy=false; } }\n'
              'async function renderOverviewInner(){'
)

# 5) অটো-রিফ্রেশ ৫ সেকেন্ড থেকে ১৫ সেকেন্ড
patch(
    "refresh interval 5s -> 15s",
    r'timer=setInterval\(renderOverview,5000\)',
    lambda m: 'timer=setInterval(renderOverview,15000)'
)

open("index.fixed.html", "w", encoding="utf-8").write(src)
print("\nDone -> index.fixed.html")
