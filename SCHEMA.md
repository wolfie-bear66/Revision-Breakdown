# Revision Breakdown — Schema Reference

## card_attempts
| column | type |
|---|---|
| id | uuid |
| session_id | uuid (FK → sessions) |
| card_id | uuid (FK → cards, nullable) |
| question_id | uuid (FK → questions, nullable) |
| correct | boolean |
| score | integer |
| answered_at | timestamptz |

⚠️ No user_id — get the user via session join.

## sessions
| column | type |
|---|---|
| id | uuid |
| user_id | uuid (FK → auth.users) |
| block_id | uuid (FK → blocks) |
| mode | text |
| started_at | timestamptz |
| completed_at | timestamptz (null = incomplete) |
| score | integer |
| total | integer |

## user_subjects
| column | type |
|---|---|
| id | uuid |
| user_id | uuid (FK → auth.users) |
| subject_id | uuid (FK → subjects) |
| created_at | timestamptz |

## user_topics
| column | type |
|---|---|
| id | uuid |
| user_subject_id | uuid (FK → user_subjects) |
| topic_id | uuid (FK → topics) |
| created_at | timestamptz |

⚠️ No user_id — get the user via user_subjects join.

## Views

### user_subject_progress

```sql
CREATE OR REPLACE VIEW user_subject_progress AS
SELECT
  us.user_id,
  us.subject_id,
  s.name AS subject_name,
  s.exam_board,
  COUNT(DISTINCT b.id) AS total_blocks,
  COUNT(DISTINCT CASE WHEN sess.completed_at IS NOT NULL THEN sess.block_id END) AS completed_blocks
FROM user_subjects us
JOIN subjects s ON s.id = us.subject_id
JOIN topics t ON t.subject_id = s.id
JOIN blocks b ON b.topic_id = t.id
LEFT JOIN sessions sess ON sess.block_id = b.id AND sess.user_id = us.user_id
GROUP BY us.user_id, us.subject_id, s.name, s.exam_board;
```

| column | type | notes |
|---|---|---|
| user_id | uuid | |
| subject_id | uuid | |
| subject_name | text | |
| exam_board | text | |
| total_blocks | bigint | all blocks across enrolled topics |
| completed_blocks | bigint | blocks with at least one completed session |

⚠️ Filter by `user_id` on every query — this view is not row-level secured.
