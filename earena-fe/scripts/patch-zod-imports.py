import pathlib

root = pathlib.Path(__file__).resolve().parent.parent / "src"
old1 = "import { zodResolver } from '@hookform/resolvers/zod';"
new1 = "import { rhfZodResolver as zodResolver } from '@/shared/lib/rhf-zod-resolver';"
old2 = 'import { zodResolver } from "@hookform/resolvers/zod";'
new2 = 'import { rhfZodResolver as zodResolver } from "@/shared/lib/rhf-zod-resolver";'

for pattern in ("*.tsx", "*.ts"):
    for p in root.rglob(pattern):
        if p.name == "rhf-zod-resolver.ts":
            continue
        t = p.read_text(encoding="utf-8")
        nt = t.replace(old1, new1).replace(old2, new2)
        if nt != t:
            p.write_text(nt, encoding="utf-8")
            print("patched", p.relative_to(root))
