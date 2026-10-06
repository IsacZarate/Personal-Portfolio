# Public résumé maintenance

The website and editable résumé use the approved public data in `src/data/resume.json`. The public DOCX is a fresh document built from that data; the private original is never copied into this repository. The owner approved the Backend Engineer / SDET headline, email-only public contact, and ongoing VivoSense role on October 6, 2026.

The approved content is self-reported résumé material. Do not add metrics, results, individual ClassSeek responsibilities, or employer details without supporting material. ClassSeek is only a short résumé overview; the project publishing requirements still apply before a case study is released.

## Regenerate the documents

On Windows with Microsoft Word installed, use Python with `python-docx` and `pypdf` available:

```powershell
python scripts/build-resume.py
./scripts/export-resume.ps1
python scripts/verify-resume.py
```

The builder produces `docs/resume/isac-zarate-resume.docx`; Word exports `public/resume/isac-zarate-resume.pdf` with document structure tags and heading bookmarks. The export script opens only the generated public source. The site keeps a complete HTML résumé available alongside the PDF.

After changing facts, update `reviewedAt`, regenerate both documents, inspect every rendered PDF page, and check the public source and PDF metadata. The verification script checks source consistency, selectable text, English language, document title, tags, working link destinations, and common phone/address patterns. These checks complement visual and reading-order review; they do not certify PDF/UA conformance.

Keep contact changes explicit. Email is public; phone and postal address are excluded. LinkedIn is omitted until a real URL is provided. Commit the sanitized source data, editable public DOCX, and approved PDF together. Keep rendering intermediates outside the repository.
