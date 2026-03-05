# Contributing to PrepRight

PrepRight improves with real-world testing across different roles, industries, and candidate backgrounds. Here is how to help.

---

## Ways to Contribute

### Report a Gap or Failure
If you ran the prompt and it produced something missing, incorrect, or significantly weaker than expected, open a GitHub Issue with:
- The role type and seniority level (you do not need to share the full JD)
- What you expected the guide to produce
- What it actually produced
- The specific section where the output fell short

Be specific. "The gap analysis was too soft" is less useful than "the gap analysis for a candidate with no fintech experience failed to identify payment authorization infrastructure as a knowledge gap."

### Suggest a New Section
If you think the guide is missing a meaningful preparation area, open a pull request that adds it to `PROMPT.md`. Your addition should follow the same structure as existing sections: a clear instruction block, specific formatting requirements, and a visual element if applicable.

### Share Test Results
If you tested PrepRight across multiple roles or companies and observed consistent patterns, share them in the Discussions tab. What roles does it perform best on? Where does it require the most manual refinement?

### Contribute a Sample Output Page
Redacted screenshots of real output pages help potential users understand what they are getting before they run the prompt. If you are willing to share a page or two with identifying information removed, open a pull request adding images to the `sample-output/` folder with a brief description.

Most useful pages to share:
- The cover page (shows the visual design)
- A Gap Briefing Block (shows the blunt assessment format)
- A CERT story card table (shows the story arsenal format)
- The Interview Day Reference Card (shows the final one-page design)

---

## What Not to Submit

- Do not submit changes that reduce specificity in exchange for brevity. This prompt is long by design. Every instruction exists because a shorter version produced a worse output.
- Do not submit additions that are not grounded in a real observed gap. The prompt should only grow when a concrete failure case justifies it.
- Do not submit role-specific customizations as changes to the main prompt. If you have built a variant for a specific industry or function, share it in Discussions rather than as a PR against the main file.

---

## Pull Request Guidelines

- Keep the change focused. One section addition or modification per PR.
- Explain the failure case that motivated the change.
- If you added a new visual requirement, verify that the docx generation logic supports it with the existing npm docx library and Python matplotlib toolchain.
- Test your change against at least one real job description before submitting.
