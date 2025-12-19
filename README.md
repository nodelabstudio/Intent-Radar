# Inbound Lead Signals

This project monitors online discussions to identify **real people expressing real business problems**.

Not trends.  
Not news.  
Not content.

Actual posts where someone is clearly stuck, frustrated, or looking for a better way to do something.

---

## What this is

Inbound Lead Signals is a signal-detection system.

It watches selected public sources, evaluates posts using a set of rules, and surfaces only the ones that show **genuine intent** — the kind that usually precedes a buying decision.

Every record is explainable and nothing is guesswork.

---

## How it works (high level)

- Sources are defined explicitly
- Language is evaluated, not popularity
- Signals are scored conservatively
- Posts are categorized for organization
- Outputs are designed for downstream review and action

The system favors **precision over coverage**.

---

## Intended use

This project is designed to support:

- Lead research
- Market discovery
- Pattern recognition
- Opportunity tracking

It intentionally does **not** handle outreach or engagement.

---

## Basic mental model

| Layer    | Purpose                      | File              |
| -------- | ---------------------------- | ----------------- |
| Feeds    | Where to listen              | feeds.intent.json |
| Keywords | What language signals intent | keywords.json     |
| Scoring  | Should this pass?            | keywordScore.js   |
| Tagging  | How to organize it           | verticals.json    |

## Status

Active development.  
Structure-first.  
No shortcuts.
