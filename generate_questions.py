#!/usr/bin/env python3
import json
import os
import time
import sys
from pathlib import Path

try:
    import anthropic
except ImportError:
    print("ERROR: anthropic package not installed.")
    sys.exit(1)

CONTENT_DIR = Path(__file__).parent / "content"
OUTPUT_DIR  = Path(__file__).parent / "content" / "generated"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

FILE_META = {
    "business-studies.json":          ("Business Studies",            "AQA",    "Business & Technology", "#b45309", "💼", "business-studies-aqa"),
    "computer-science.json":          ("Computer Science",            "AQA",    "Business & Technology", "#1d4ed8", "💻", "computer-science-aqa"),
    "design-technology.json":         ("Design & Technology",         "AQA",    "Technology & Applied",  "#92400e", "🔧", "design-technology-aqa"),
    "design-technology-ocr.json":     ("Design & Technology",         "OCR",    "Technology & Applied",  "#92400e", "🔧", "design-technology-ocr"),
    "design-technology-eduqas.json":  ("Design & Technology",         "Eduqas", "Technology & Applied",  "#92400e", "🔧", "design-technology-eduqas"),
    "drama.json":                     ("Drama",                       "AQA",    "Arts & Creative",       "#7c3aed", "🎭", "drama-aqa"),
    "english-literature-edexcel.json":("English Literature",          "Edexcel","English",               "#dc2626", "📚", "english-literature-edexcel"),
    "film-studies-eduqas.json":       ("Film Studies",                "Eduqas", "Arts & Creative",       "#7c3aed", "🎬", "film-studies-eduqas"),
    "food-preparation-nutrition.json":("Food Preparation & Nutrition","AQA",    "Technology & Applied",  "#16a34a", "🍽️",  "food-nutrition-aqa"),
    "french.json":                    ("French",                      "AQA",    "Languages",             "#b91c1c", "🇫🇷", "french-aqa"),
    "geography-edexcel.json":         ("Geography",                   "Edexcel","Humanities",            "#15803d", "🌍", "geography-edexcel"),
    "german.json":                    ("German",                      "AQA",    "Languages",             "#b91c1c", "🇩🇪", "german-aqa"),
    "health-social-care-ocr.json":    ("Health & Social Care",        "OCR",    "Technology & Applied",  "#0891b2", "🏥", "health-social-care-ocr"),
    "history-edexcel.json":           ("History",                     "Edexcel","Humanities",            "#92400e", "📜", "history-edexcel"),
    "maths-edexcel.json":             ("Maths",                       "Edexcel","Maths",                 "#1d4ed8", "📐", "maths-edexcel"),
    "media-studies-eduqas.json":      ("Media Studies",               "Eduqas", "Arts & Creative",       "#7c3aed", "📺", "media-studies-eduqas"),
    "physical-education.json":        ("Physical Education",          "AQA",    "Technology & Applied",  "#16a34a", "⚽", "pe-aqa"),
    "psychology.json":                ("Psychology",                  "AQA",    "Humanities",            "#7c3aed", "🧠", "psychology-aqa"),
    "religious-studies.json":         ("Religious Studies",           "AQA",    "Humanities",            "#92400e", "✝️",  "religious-studies-aqa"),
    "sociology.json":                 ("Sociology",                   "AQA",    "Humanities",            "#0891b2", "👥", "sociology-aqa"),
    "spanish.json":                   ("Spanish",                     "AQA",    "Languages",             "#b91c1c", "🇪🇸", "spanish-aqa"),
    "child-development.json":         ("Child Development",           "AQA",    "Technology & Applied",  "#16a34a", "👶", "child-development-aqa"),
}

ALREADY_COVERED = {
    ("Health & Social Care", "OCR", "Life Stages & Development"),
}

def build_prompt(subject, board, topic, block_name, cards):
    cards_text = "\n".join(
        f"{i+1}. KEYWORD: {c['keyword']}\n   DEFINITION: {c['definition']}"
        for i, c in enumerate(cards)
    )
    return f"""You are generating GCSE revision questions for {subject} ({board} exam board).
Topic: {topic}
Block: {block_name}

Here are the 10 flashcards for this block:
{cards_text}

Generate exactly 31 questions based ONLY on these flashcards. Use simple, clear language suitable for 14-16 year old students. Avoid complex academic language.

Return ONLY valid JSON — no preamble, no markdown, no explanation. The JSON must be an array of exactly 31 question objects.

Rules:
- Questions 1-10: type "multiple_choice" — 4 options stored as plain text strings (NO letter prefixes like "A)" — just the text). The correct_answer field must contain the EXACT TEXT of the correct option (not a letter). Randomise which position the correct answer appears — do not always put it second or third. Each option must be plausible but only one correct.
- Questions 11-20: type "true_false" — correct_answer must be exactly "True" or "False" (capital first letter). Mix true and false answers roughly evenly — do not make them all true or all false.
- Questions 21-30: type "fill_blank" — question has a blank represented as "________". correct_answer is the missing word or short phrase.
- Question 31: type "match_up" — stored differently: question field contains the instruction text "Match each term to its correct description.", options field contains a JSON array of 5 objects each with "term" and "match" keys. correct_answer is null.

Each question object must have these fields:
- type (string)
- question (string) — for match_up this is the instruction
- options (array of strings for mcq, null for true_false and fill_blank, array of objects for match_up)
- correct_answer (string or null)
- explanation (string — 1-2 sentences explaining the answer, null for match_up)
- display_order (integer 1-31)

Return the raw JSON array only. Start your response with [ and end with ]."""

def generate_questions(client, subject, board, topic, block_name, cards, retries=3):
    prompt = build_prompt(subject, board, topic, block_name, cards)
    for attempt in range(retries):
        try:
            response = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=4000,
                messages=[{"role": "user", "content": prompt}]
            )
            raw = response.content[0].text.strip()
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1]
                raw = raw.rsplit("```", 1)[0]
            questions = json.loads(raw)
            assert len(questions) == 31, f"Expected 31 questions, got {len(questions)}"
            types = [q["type"] for q in questions]
            assert types.count("multiple_choice") == 10
            assert types.count("true_false") == 10
            assert types.count("fill_blank") == 10
            assert types.count("match_up") == 1
            return questions
        except Exception as e:
            print(f"    Attempt {attempt+1} failed: {e}")
            if attempt < retries - 1:
                time.sleep(3)
    return None

def main():
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY environment variable not set.")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)
    total_blocks = 0
    success_blocks = 0
    failed_blocks = []

    for fname, (name, board, category, colour, emoji, slug) in sorted(FILE_META.items()):
        plain_path = CONTENT_DIR / fname
        if not plain_path.exists():
            print(f"SKIP (not found): {fname}")
            continue

        with open(plain_path, encoding="utf-8") as f:
            source = json.load(f)

        output = {
            "subject": {
                "name": name,
                "exam_board": board,
                "category": category,
                "colour": colour,
                "emoji": emoji,
                "slug": slug,
            },
            "topics": []
        }

        subject_had_new = False

        for topic in source["topics"]:
            out_topic = {
                "name": topic["name"],
                "display_order": topic["display_order"],
                "blocks": []
            }
            for block in topic["blocks"]:
                total_blocks += 1
                if (name, board, topic["name"]) in ALREADY_COVERED:
                    print(f"  SKIP (already covered): {block['block_name']}")
                    continue
                print(f"  Generating: {name} ({board}) / {topic['name']} / {block['block_name']}")
                questions = generate_questions(
                    client, name, board,
                    topic["name"], block["block_name"],
                    block["cards"]
                )
                if questions is None:
                    print(f"    FAILED after retries — skipping")
                    failed_blocks.append(f"{name} ({board}) / {block['block_name']}")
                    continue
                out_topic["blocks"].append({
                    "block_number": block["block_number"],
                    "block_name": block["block_name"],
                    "cards": block["cards"],
                    "questions": questions
                })
                success_blocks += 1
                subject_had_new = True
                time.sleep(0.5)
            if out_topic["blocks"]:
                output["topics"].append(out_topic)

        if subject_had_new:
            out_fname = fname.replace(".json", "-generated-full.json")
            out_path = OUTPUT_DIR / out_fname
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(output, f, indent=2, ensure_ascii=False)
            print(f"  Saved: {out_fname}")
        print()

    print("=" * 60)
    print(f"Complete: {success_blocks}/{total_blocks} blocks generated")
    if failed_blocks:
        print(f"Failed ({len(failed_blocks)}):")
        for b in failed_blocks:
            print(f"  - {b}")
    else:
        print("No failures.")

if __name__ == "__main__":
    main()
