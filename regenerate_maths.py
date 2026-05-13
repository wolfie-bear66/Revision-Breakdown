#!/usr/bin/env python3
import json, os, time, sys
from pathlib import Path

try:
    import anthropic
except ImportError:
    print("ERROR: pip install anthropic")
    sys.exit(1)

CONTENT_DIR = Path(__file__).parent / "content"
OUTPUT_DIR  = Path(__file__).parent / "content" / "generated"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

BLOCKS = [
    {
        "topic": "Number",
        "topic_display_order": 1,
        "block_number": 1,
        "block_name": "Number Basics & Fractions",
    },
    {
        "topic": "Number",
        "topic_display_order": 1,
        "block_number": 2,
        "block_name": "Percentages & Proportional Reasoning",
    },
    {
        "topic": "Algebra",
        "topic_display_order": 2,
        "block_number": 1,
        "block_name": "Algebra Fundamentals",
    },
    {
        "topic": "Geometry & Measures",
        "topic_display_order": 3,
        "block_number": 1,
        "block_name": "Angles, Shapes & Trigonometry",
    },
    {
        "topic": "Statistics & Probability",
        "topic_display_order": 4,
        "block_number": 1,
        "block_name": "Statistics",
    },
    {
        "topic": "Statistics & Probability",
        "topic_display_order": 4,
        "block_number": 2,
        "block_name": "Probability",
    },
]

def load_cards(block_name, topic_name):
    with open(CONTENT_DIR / "maths-aqa-full.json", encoding="utf-8") as f:
        data = json.load(f)
    for t in data["topics"]:
        if t["name"] == topic_name:
            for b in t["blocks"]:
                if b["block_name"] == block_name:
                    return b["cards"]
    raise ValueError(f"Block not found: {block_name}")

def build_prompt(topic, block_name, cards):
    cards_text = "\n".join(
        f"{i+1}. KEYWORD: {c['keyword']}\n   DEFINITION: {c['definition']}"
        for i, c in enumerate(cards)
    )
    return f"""You are generating GCSE Maths revision questions for AQA.
Topic: {topic}
Block: {block_name}

TARGET AUDIENCE: Students aged 14-16 who find Maths difficult or are working at grades 1-5. Many are anxious about Maths. Write everything in plain, encouraging, everyday English.

Here are the 10 flashcards for this block:
{cards_text}

CRITICAL RULES FOR MATHS QUESTIONS:
1. This app tests whether students know what words and terms MEAN — not whether they can calculate. Do NOT ask students to work out answers to sums.
2. Use real-world examples wherever possible (money, sport, cooking, shopping, distances).
3. Never use algebraic notation in question text unless the keyword itself IS the notation (e.g. if the card is about "mean" do not write P(A) in a question).
4. Keep sentences short. One idea per sentence.
5. Wrong answer options should be common misconceptions, not random — e.g. confusing mean/median/mode, confusing factor/multiple.
6. True/false statements should be things students genuinely mix up — not trick questions.
7. Fill in the blank answers should be single words or short phrases — never a formula or calculation.

Generate exactly 31 questions. Return ONLY valid JSON — no preamble, no markdown. Start with [ and end with ].

Rules:
- Questions 1-10: type "multiple_choice" — 4 options as plain text strings (NO letter prefixes). correct_answer must be the EXACT TEXT of the correct option. Randomise which position the correct answer appears — spread it across all 4 positions, not always 2nd or 3rd.
- Questions 11-20: type "true_false" — correct_answer must be exactly "True" or "False". Mix roughly half true, half false.
- Questions 21-30: type "fill_blank" — question has a blank shown as "________". correct_answer is the missing word or short phrase only (not a formula).
- Question 31: type "match_up" — question field is "Match each term to its correct description.", options is a JSON array of 5 objects with "term" and "match" keys. correct_answer is null.

Each object needs: type, question, options, correct_answer, explanation (1-2 plain sentences, null for match_up), display_order (1-31).

Return the raw JSON array only."""

def generate(client, topic, block_name, cards, retries=3):
    prompt = build_prompt(topic, block_name, cards)
    for attempt in range(retries):
        try:
            response = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=4000,
                messages=[{"role": "user", "content": prompt}]
            )
            raw = response.content[0].text.strip()
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1].rsplit("```", 1)[0]
            questions = json.loads(raw)
            assert len(questions) == 31
            types = [q["type"] for q in questions]
            assert types.count("multiple_choice") == 10
            assert types.count("true_false") == 10
            assert types.count("fill_blank") == 10
            assert types.count("match_up") == 1
            # Verify MCQ correct answers are in options
            for q in questions:
                if q["type"] == "multiple_choice":
                    assert q["correct_answer"] in q["options"], f"correct_answer not in options: {q['correct_answer']}"
            return questions
        except Exception as e:
            print(f"    Attempt {attempt+1} failed: {e}")
            if attempt < retries - 1:
                time.sleep(3)
    return None

def main():
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY not set")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    output = {
        "subject": {
            "name": "Maths",
            "exam_board": "AQA",
            "category": "Maths",
            "colour": "#1d4ed8",
            "emoji": "📐",
            "slug": "maths-aqa"
        },
        "topics": {}
    }

    for block_meta in BLOCKS:
        topic    = block_meta["topic"]
        bname    = block_meta["block_name"]
        bnum     = block_meta["block_number"]
        t_order  = block_meta["topic_display_order"]

        print(f"Generating: {topic} / {bname}")
        cards = load_cards(bname, topic)
        questions = generate(client, topic, bname, cards)

        if questions is None:
            print(f"  FAILED — skipping {bname}")
            continue

        if topic not in output["topics"]:
            output["topics"][topic] = {
                "name": topic,
                "display_order": t_order,
                "blocks": []
            }

        output["topics"][topic]["blocks"].append({
            "block_number": bnum,
            "block_name": bname,
            "cards": cards,
            "questions": questions
        })
        print(f"  Done.")
        time.sleep(0.5)

    # Convert topics dict to list
    topics_list = list(output["topics"].values())
    output["topics"] = topics_list

    out_path = OUTPUT_DIR / "maths-aqa-regenerated.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print()
    print("=" * 50)
    print(f"Saved to: {out_path}")
    total_blocks = sum(len(t["blocks"]) for t in topics_list)
    print(f"Topics: {len(topics_list)}, Blocks: {total_blocks}")

if __name__ == "__main__":
    main()
