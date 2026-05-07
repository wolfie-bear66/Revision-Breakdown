'use client';

import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Block {
  id: string;
  block_name: string;
  completed: boolean;
}

export interface Topic {
  id: string;
  name: string;
  blocks: Block[];
}

interface TopicAccordionProps {
  topics: Topic[];
}

const MODES = [
  { label: 'Flashcards',        slug: 'flashcards',     className: 'bg-blue-500   hover:bg-blue-600   text-white' },
  { label: 'MCQ',               slug: 'mcq',            className: 'bg-purple-500 hover:bg-purple-600 text-white' },
  { label: 'True / False',      slug: 'truefalse',      className: 'bg-green-500  hover:bg-green-600  text-white' },
  { label: 'Fill in the Blank', slug: 'fillintheblank', className: 'bg-orange-500 hover:bg-orange-600 text-white' },
  { label: 'Match-Up',          slug: 'matchup',        className: 'bg-pink-500   hover:bg-pink-600   text-white' },
] as const;

export function TopicAccordion({ topics }: TopicAccordionProps) {
  if (topics.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No topics enrolled for this subject.
      </p>
    );
  }

  return (
    <Accordion
      defaultValue={[topics[0].id]}
      className="divide-y divide-border rounded-xl border border-border"
    >
      {topics.map((topic) => (
        <AccordionItem key={topic.id} value={topic.id} className="px-4">
          <AccordionTrigger className="py-4 text-base font-semibold hover:no-underline">
            {topic.name}
          </AccordionTrigger>

          <AccordionContent>
            <ul className="flex flex-col gap-4 pb-4">
              {topic.blocks.length === 0 ? (
                <li className="text-sm text-muted-foreground">No blocks in this topic.</li>
              ) : (
                topic.blocks.map((block) => (
                  <li key={block.id} className="flex flex-col gap-2">
                    {/* Block header */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{block.block_name}</span>
                      {block.completed && (
                        <CheckCircle2
                          className="h-4 w-4 shrink-0 text-green-500"
                          aria-label="Completed"
                        />
                      )}
                    </div>

                    {/* Mode buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      {MODES.map((mode) => (
                        <Link
                          key={mode.slug}
                          href={`/block/${block.id}/${mode.slug}`}
                          className={cn(
                            'inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium',
                            'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            mode.className
                          )}
                        >
                          {mode.label}
                        </Link>
                      ))}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
