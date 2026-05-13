#!/usr/bin/env python3
import json, os, time, sys
from pathlib import Path

try:
    import anthropic
except ImportError:
    print("ERROR: pip install anthropic")
    sys.exit(1)

OUTPUT_DIR = Path(__file__).parent / "content" / "generated"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

FORMULAS_CARDS = [
    {"keyword": "quadratic formula", "definition": "x = (−b ± √(b²−4ac)) / 2a — given on the Edexcel formula sheet. Used to solve any quadratic equation ax² + bx + c = 0", "display_order": 1},
    {"keyword": "area of a trapezium", "definition": "A = ½(a + b)h — given on the Edexcel formula sheet. a and b are the parallel sides, h is the perpendicular height", "display_order": 2},
    {"keyword": "volume of a prism", "definition": "V = area of cross-section × length — given on the Edexcel formula sheet", "display_order": 3},
    {"keyword": "volume of a sphere", "definition": "V = (4/3)πr³ — given on the Edexcel formula sheet", "display_order": 4},
    {"keyword": "volume of a cone", "definition": "V = (1/3)πr²h — given on the Edexcel formula sheet", "display_order": 5},
    {"keyword": "curved surface area of a cone", "definition": "A = πrl — given on the Edexcel formula sheet. l is the slant height", "display_order": 6},
    {"keyword": "surface area of a sphere", "definition": "A = 4πr² — given on the Edexcel formula sheet", "display_order": 7},
    {"keyword": "the sine rule", "definition": "a/sinA = b/sinB = c/sinC — given on the Edexcel formula sheet. Used in non-right-angled triangles", "display_order": 8},
    {"keyword": "the cosine rule", "definition": "a² = b² + c² − 2bc cosA — given on the Edexcel formula sheet. Used in non-right-angled triangles", "display_order": 9},
    {"keyword": "area of a triangle", "definition": "Area = ½ab sinC — given on the Edexcel formula sheet. Used when two sides and the included angle are known", "display_order": 10},
]

HIGHER_CARDS = [
    {"keyword": "iteration", "definition": "a method of solving equations by repeatedly substituting values into a formula to get closer to the solution", "display_order": 1},
    {"keyword": "function notation f(x)", "definition": "a way of writing a rule: f(x) = 2x + 1 means the function f applied to x gives 2x + 1", "display_order": 2},
    {"keyword": "composite function fg(x)", "definition": "applying one function then another: fg(x) means apply g first, then f to the result", "display_order": 3},
    {"keyword": "inverse function f⁻¹(x)", "definition": "the function that reverses f — if f(3) = 7 then f⁻¹(7) = 3", "display_order": 4},
    {"keyword": "proof", "definition": "a logical argument showing a statement must always be true — used in Edexcel Higher. Must use algebra, not just examples", "display_order": 5},
    {"keyword": "algebraic fraction", "definition": "a fraction with algebraic expressions in the numerator and/or denominator — can be simplified, added, subtracted, multiplied", "display_order": 6},
    {"keyword": "completing the square", "definition": "rewriting a quadratic in the form (x + p)² + q — used to find the vertex of a parabola or solve quadratics", "display_order": 7},
    {"keyword": "vectors", "definition": "quantities with both magnitude and direction — represented as column vectors or with letters. Used to describe translations and geometric proofs", "display_order": 8},
    {"keyword": "conditional probability", "definition": "the probability of an event given that another event has already occurred — used with tree diagrams and two-way tables", "display_order": 9},
    {"keyword": "Venn diagrams", "definition": "diagrams using overlapping circles to show relationships between sets — used in probability questions on the Edexcel paper", "display_order": 10},
]

FORMULAS_PROMPT = """You are generating GCSE Maths revision questions for Edexcel.
Topic: Edexcel-Specific Topics & Formula Sheet
Block: Key Formulas & Edexcel Differences

TARGET AUDIENCE: Students aged 14-16. Many find Maths difficult. Write in plain, friendly English.

Here are the 10 flashcards for this block:
1. KEYWORD: quadratic formula
   DEFINITION: Given on the Edexcel formula sheet. Used to solve any quadratic equation.
2. KEYWORD: area of a trapezium
   DEFINITION: Given on the Edexcel formula sheet. Uses the two parallel sides and the perpendicular height.
3. KEYWORD: volume of a prism
   DEFINITION: Given on the Edexcel formula sheet. Uses the area of the cross-section multiplied by the length.
4. KEYWORD: volume of a sphere
   DEFINITION: Given on the Edexcel formula sheet. Uses the radius.
5. KEYWORD: volume of a cone
   DEFINITION: Given on the Edexcel formula sheet. Uses the radius and the height.
6. KEYWORD: curved surface area of a cone
   DEFINITION: Given on the Edexcel formula sheet. Uses the radius and the slant height.
7. KEYWORD: surface area of a sphere
   DEFINITION: Given on the Edexcel formula sheet. Uses the radius.
8. KEYWORD: the sine rule
   DEFINITION: Given on the Edexcel formula sheet. Used in non-right-angled triangles when you know an angle and its opposite side.
9. KEYWORD: the cosine rule
   DEFINITION: Given on the Edexcel formula sheet. Used in non-right-angled triangles when you know all three sides or two sides and the included angle.
10. KEYWORD: area of a triangle
    DEFINITION: Given on the Edexcel formula sheet. Used when you know two sides and the angle between them.

CRITICAL RULES:
1. Do NOT include any mathematical symbols, formulas, or notation in question text or answer options (no √, π, ², ³, fractions, equals signs, or algebraic expressions). Write everything in plain words only.
2. Questions must test what each formula is USED FOR and what the PARTS mean — not the formula itself.
3. All answer options must be plain English sentences only.
4. Wrong answer options should be other formulas from the list — e.g. confusing volume of a cone with volume of a sphere.
5. Fill in the blank answers must be plain words only — never a formula or symbol.
6. True/false statements should be plain English facts about when/why each formula is used.

Generate exactly 31 questions. Return ONLY valid JSON — no preamble, no markdown. Start with [ and end with ].

Rules:
- Questions 1-10: type "multiple_choice" — 4 options as plain text strings (NO letter prefixes). correct_answer must be the EXACT TEXT of the correct option. Spread correct answers across all 4 positions.
- Questions 11-20: type "true_false" — correct_answer must be exactly "True" or "False". Mix roughly half true, half false.
- Questions 21-30: type "fill_blank" — question has a blank shown as "________". correct_answer is a plain word or short phrase only — no symbols or formulas.
- Question 31: type "match_up" — question field is "Match each formula to what it is used for.", options is a JSON array of 5 objects with "term" and "match" keys using plain words only. correct_answer is null.

Each object needs: type, question, options, correct_answer, explanation (1-2 plain sentences, null for match_up), display_order (1-31).

Return the raw JSON array only."""

def build_higher_prompt(cards):
    cards_text = "\n".join(
        f"{i+1}. KEYWORD: {c['keyword']}\n   DEFINITION: {c['definition']}"
        for i, c in enumerate(cards)
    )
    return f"""You are generating GCSE Maths revision questions for Edexcel Higher tier.
Topic: Edexcel-Specific Topics & Formula Sheet
Block: Higher Tier — Edexcel Topics

TARGET AUDIENCE: Students aged 14-16 taking Higher tier Maths. Write in plain, clear English.

Here are the 10 flashcards for this block:
{cards_text}

CRITICAL RULES:
1. Questions test what terms MEAN — not whether students can calculate.
2. Keep language plain and accessible. One idea per sentence.
3. Wrong answer options should be plausible confusions from within this list of terms.
4. Fill in the blank answers should be single words or short phrases.
5. Avoid algebraic notation in question text unless the keyword itself is the notation.

Generate exactly 31 questions. Return ONLY valid JSON — no preamble, no markdown. Start with [ and end with ].

Rules:
- Questions 1-10: type "multiple_choice" — 4 options as plain text strings (NO letter prefixes). correct_answer must be the EXACT TEXT of the correct option. Spread correct answers across all 4 positions.
- Questions 11-20: type "true_false" — correct_answer must be exactly "True" or "False". Mix roughly half true, half false.
- Questions 21-30: type "fill_blank" — question has a blank shown as "________". correct_answer is a plain word or short phrase only.
- Question 31: type "match_up" — question field is "Match each term to its correct description.", options is a JSON array of 5 objects with "term" and "match" keys. correct_answer is null.

Each object needs: type, question, options, correct_answer, explanation (1-2 plain sentences, null for match_up), display_order (1-31).

Return the raw JSON array only."""

def generate(client, prompt, block_name, retries=4):
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
            assert len(questions) == 31, f"Expected 31, got {len(questions)}"
            types = [q["type"] for q in questions]
            assert types.count("multiple_choice") == 10
            assert types.count("true_false") == 10
            assert types.count("fill_blank") == 10
            assert types.count("match_up") == 1
            for q in questions:
                if q["type"] == "multiple_choice":
                    assert q["correct_answer"] in q["options"], f"Answer not in options: {q['correct_answer']}"
            print(f"  Done on attempt {attempt+1}.")
            return questions
        except Exception as e:
            print(f"  Attempt {attempt+1} failed: {e}")
            if attempt < retries - 1:
                time.sleep(4)
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
            "exam_board": "Edexcel",
            "category": "Maths",
            "colour": "#1d4ed8",
            "emoji": "📐",
            "slug": "maths-edexcel"
        },
        "topics": [
            {
                "name": "Edexcel-Specific Topics & Formula Sheet",
                "display_order": 1,
                "blocks": []
            }
        ]
    }

    print("Generating: Key Formulas & Edexcel Differences")
    formulas_qs = generate(client, FORMULAS_PROMPT, "Key Formulas & Edexcel Differences")
    if formulas_qs:
        output["topics"][0]["blocks"].append({
            "block_number": 1,
            "block_name": "Key Formulas & Edexcel Differences",
            "cards": FORMULAS_CARDS,
            "questions": formulas_qs
        })
    else:
        print("  FAILED — skipping Key Formulas block")

    time.sleep(1)

    print("Generating: Higher Tier — Edexcel Topics")
    higher_prompt = build_higher_prompt(HIGHER_CARDS)
    higher_qs = generate(client, higher_prompt, "Higher Tier — Edexcel Topics")
    if higher_qs:
        output["topics"][0]["blocks"].append({
            "block_number": 2,
            "block_name": "Higher Tier — Edexcel Topics",
            "cards": HIGHER_CARDS,
            "questions": higher_qs
        })
    else:
        print("  FAILED — skipping Higher Tier block")

    out_path = OUTPUT_DIR / "maths-edexcel-regenerated.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    total_blocks = len(output["topics"][0]["blocks"])
    print()
    print("=" * 50)
    print(f"Saved to: {out_path}")
    print(f"Blocks generated: {total_blocks}/2")

if __name__ == "__main__":
    main()
