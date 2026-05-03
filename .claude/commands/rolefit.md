Run a full job fit analysis and generate a personalized interview prep guide.

**Input:** $ARGUMENTS  
(Pass a job posting URL, or paste job description text. Attach your resume file to this message.)

---

## Step 1 — Extract the job description

If `$ARGUMENTS` starts with `http`, fetch the job posting page using the web_fetch tool. Strip navigation, footers, and cookie banners. Keep role title, responsibilities, qualifications, and company description.

If the URL hits a login wall, tell the user and ask them to paste the JD text instead.

If `$ARGUMENTS` is plain text (not a URL), use it directly as the job description.

If no argument was given, ask: "Please provide a job posting URL or paste the job description text."

## Step 2 — Extract the resume

If a file is attached to this message, read it. Claude reads PDFs natively. For DOCX:

```bash
pip install python-docx --break-system-packages -q 2>/dev/null
python3 -c "
import docx, sys
doc = docx.Document(sys.argv[1])
print('\n'.join(p.text for p in doc.paragraphs if p.text.strip()))
" /path/to/resume.docx
```

If no file is attached, ask: "Please attach your resume as a PDF or Word doc."

## Step 3 — Confirm and begin

Once you have both inputs:

> "Got it — analysing your fit for [Role Title] at [Company]. I'll research the company live and build your full prep guide. This takes 15-20 minutes. I'll update you as I move through each phase."

Then begin immediately. Do not ask any further clarifying questions.

## Step 4 — Execute the master prompt

Read the full master prompt and follow it exactly:

```bash
cat ~/.claude/commands/rolefit-prompt.md
```

Replace the two placeholders in the master prompt with the content from Steps 1-2:

```
THE ROLE THEY ARE TARGETING:
[job description text from Step 1]

THE PERSON'S BACKGROUND:
[resume text from Step 2]
```

Follow every section in the master prompt in sequence. Do not skip or abbreviate any section.

## Step 5 — Deliver

Save the final .docx to the outputs folder and share it with the user via a file link.
