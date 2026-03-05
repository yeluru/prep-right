# PrepRight
### A ready-to-use prompt that turns any job description and resume into a personalized, publication-quality interview preparation guide — for any role, any industry, any level.

> Paste a job description and a resume. Get a comprehensive Word document that researches the company, scores your fit honestly, tells you bluntly where your gaps are, and hands you a one-page reference card to read five minutes before you walk in.

> **Compatibility note:** This prompt has been built and tested exclusively with Claude (Anthropic). It relies on Claude's computer use capability to run code, generate charts, and conduct live web research. Results with other models such as GPT-4, Gemini, or open-source alternatives are not guaranteed and may vary significantly.

---

## What This Is

Most interview prep advice is generic. PrepRight is not.

It works for any role — engineering, product, finance, marketing, operations, data, design — at any level from mid-career through the C-suite. The entire guide adapts to whatever job description and background you provide. The research phase, fit analysis, gap briefings, story cards, competitive profiling, and reference card are all generated specifically for the role and the person, every time.

It conducts live web research on the company before writing a single word. It tells you honestly where your gaps are and exactly what to do about them. It prepares you for the questions you hope will not come up. And it ends with a one-page reference card designed to be read in five minutes before walking into the building.

Tested across multiple roles and industries including engineering leadership, product management, financial services, and federal government. The output quality is consistent regardless of role type.

---

## What the Guide Produces

Every run generates a richly formatted Word document with the following sections in order:

| Section | What It Contains |
|---|---|
| Cover Page | Role, company, candidate name, date |
| Preface | Plain-English explanation of the role and how to use the guide |
| Job Description | Full JD reproduced verbatim for reference |
| Company Intelligence Brief | Live-researched facts, Glassdoor interview intel, engineering blog insights |
| Competitive Context | Who you are competing against and exactly how you compare |
| Step 1: Decode the Role | What the company is actually trying to solve by hiring this person |
| Step 2: Fit Analysis | Honest scoring table + blunt gap briefings with preparation plans |
| Step 3: 8 Knowledge Domains | Concepts, analogies, data points, and exact opening frames |
| Step 4: Story Arsenal | 8 CERT story cards drawn from the candidate's real background |
| Step 5: Mock Q&A | Tell me about yourself + 12 model answers across 3 interview layers |
| Step 6: 30-60-90 Day Vision | Phase plan with milestone table and timeline visual |
| Step 7: Questions to Ask | 5-8 high-leverage questions per interview layer with reasoning |
| Step 8: The Hard Questions | Why leaving, why this company, failures, weaknesses, objection handling |
| Multi-Round Strategy | Round-by-round guide for 4-6 round interview processes |
| Post-Interview Strategy | Follow-up notes, silence handling, offer negotiation, rejection response |
| Closing | Honest assessment of what the candidate now has |
| Interview Day Reference Card | One-page pre-game card. Read it in 5 minutes. Walk in ready. |

**Visuals included:** Radar chart, compensation benchmark chart, 30-60-90 timeline, fit scoring table with color-coded gaps, CERT story card tables, competitive landscape comparison table, and more. 15 visual elements total.

---

## Requirements

PrepRight requires **Claude with computer use enabled**.

Specifically it needs:
- The ability to run code (to generate charts via Python matplotlib and build the Word document via Node.js)
- Web search access (to research the company, Glassdoor, LinkedIn, and engineering blogs in real time)

**Where it works:**
- [Claude.ai](https://claude.ai) — standard chat interface, Pro tier or above
- Anthropic API — with computer use tool enabled, claude-sonnet recommended

**Where it will not work:**
- Free-tier Claude without computer use
- Other LLMs (GPT-4, Gemini, etc.) — document generation and chart embedding logic is Claude-specific
- Interfaces that strip tool use capabilities

---

## How to Use It

**Step 1.** Open [PROMPT.md](./PROMPT.md) and copy the full contents.

**Step 2.** In Claude, paste the prompt and replace the two placeholders:

```
THE ROLE THEY ARE TARGETING:
[Paste the full job description here]

THE PERSON'S BACKGROUND:
[Paste resume or bullet-point summary of experience here]
```

**Step 3.** Send it. Claude will:
1. Research the company, Glassdoor, LinkedIn, and the engineering blog
2. Generate all required charts as PNG files
3. Build the full Word document and offer it for download

**Step 4.** Download the `.docx` file. Open in Microsoft Word or Google Docs.

**Total run time:** approximately 10 to 20 minutes depending on the complexity of the role and the depth of available research.

---

## What Makes the Gap Analysis Different

Most AI prep guides are encouraging to the point of uselessness. PrepRight is not.

For every requirement scored 7 or below, the guide generates a **Gap Briefing Block** with four mandatory elements:

1. **The Blunt Assessment.** What is missing and why it will hurt. No softening.
2. **The Specific Preparation Plan.** Sequenced, concrete steps to close the gap before the interview. Named resources. Priority order. One-to-two week time constraint.
3. **The Bridge Story.** The closest experience in the candidate's background and the exact framing to use when the gap gets probed.
4. **The Interview Landmine.** The single most dangerous question this gap exposes, written as the interviewer would ask it, with a model answer that is honest without being self-defeating.

---

## Sample Output

> Screenshots coming soon. If you use PrepRight and want to contribute a redacted sample page, open a pull request.

---

## Contributing

PrepRight improves with real-world testing. See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

- **Found a gap?** Open an issue describing what it missed.
- **Tested on a new role type?** Share observations in Discussions.
- **Want to suggest a new section?** Open a pull request with the proposed addition and the reasoning behind it.
- **Have a sample output page to share?** Add a redacted screenshot to the `sample-output/` folder.

---

## License

MIT License. Use it, fork it, build on it. If you make something useful from it, share it back.

---

## About

Built and maintained by [Ravi Yeluru](https://www.linkedin.com/in/raviyeluru).

Contributions, feedback, and pull requests are welcome from anyone. See [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.
