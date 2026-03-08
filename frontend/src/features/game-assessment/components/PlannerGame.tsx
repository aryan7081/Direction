'use client';

import { useState, useCallback } from 'react';
import { Box, Button, Chip, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useGameStore } from '../store';
import type { PlannerConfig } from '../types';

function DraggableActivity({
  id,
  label,
  color,
}: {
  id: string;
  label: string;
  color: string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style: React.CSSProperties = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: isDragging ? 999 : 'auto' }
    : {};

  return (
    <Box
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      sx={{
        px: { xs: 1.5, sm: 1.5 },
        py: { xs: 1, sm: 0.75 },
        minHeight: 40,
        borderRadius: 2,
        bgcolor: color,
        color: '#fff',
        fontSize: { xs: '0.75rem', sm: '0.8rem' },
        fontWeight: 600,
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.85 : 1,
        boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.2)' : 'none',
        userSelect: 'none',
        touchAction: 'none',
        textAlign: 'center',
        minWidth: 80,
        transition: isDragging ? 'none' : 'box-shadow 0.2s, opacity 0.2s',
      }}
    >
      {label}
    </Box>
  );
}

function DroppableSlot({
  id,
  value,
  activities,
}: {
  id: string;
  value: string | null;
  activities: PlannerConfig['activities'];
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const activity = activities.find((a) => a.id === value);

  return (
    <Box
      ref={setNodeRef}
      sx={{
        height: 36,
        borderRadius: 1,
        border: '1px dashed',
        borderColor: isOver ? 'primary.main' : 'divider',
        bgcolor: activity ? activity.color + '22' : isOver ? 'action.hover' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s',
      }}
    >
      {activity && (
        <Typography
          variant="caption"
          fontWeight={600}
          sx={{ color: activity.color }}
        >
          {activity.label}
        </Typography>
      )}
    </Box>
  );
}

export function PlannerGame({
  config,
  onComplete,
  onProgress,
}: {
  config: PlannerConfig;
  onComplete: () => void;
  onProgress?: (fraction: number) => void;
}) {
  const pushEvent = useGameStore((s) => s.pushEvent);
  const [schedule, setSchedule] = useState<Record<string, string | null>>({});
  const [, setActiveId] = useState<string | null>(null);

  const totalSlots = config.days.length * config.time_slots.length;
  const filledSlots = Object.values(schedule).filter(Boolean).length;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const slotId = over.id as string;
    const activityId = active.id as string;

    setSchedule((prev) => {
      const next = { ...prev, [slotId]: activityId };
      const filled = Object.values(next).filter(Boolean).length;
      onProgress?.(Math.min(filled / totalSlots, 1));
      return next;
    });

    pushEvent({
      game: 'planner',
      event_type: 'slot_assign',
      payload: { slot: slotId, activity: activityId },
      timestamp: Date.now(),
    });
  };

  const handleSubmit = useCallback(() => {
    pushEvent({
      game: 'planner',
      event_type: 'schedule_submit',
      payload: { schedule },
      timestamp: Date.now(),
    });
    onComplete();
  }, [pushEvent, schedule, onComplete]);

  return (
    <Box sx={{ bgcolor: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(16px)', borderRadius: 3, border: '1px solid rgba(0,0,0,0.08)', p: { xs: 2.5, sm: 3.5 }, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827', mb: 0.5 }}>
          Plan Your Ideal Week
        </Typography>
        <Typography sx={{ color: '#6b7280', mb: 2, fontSize: '0.9rem' }}>
          {config.instructions}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* Activity palette */}
            <Box sx={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {config.activities.map((a) => (
                <DraggableActivity
                  key={a.id}
                  id={a.id}
                  label={a.label}
                  color={a.color}
                />
              ))}
            </Box>

            {/* Weekly grid — horizontal scroll on mobile */}
            <Box
              sx={{
                width: '100%',
                overflowX: 'auto',
                overflowY: 'hidden',
                WebkitOverflowScrolling: 'touch',
                mx: { xs: -1, sm: 0 },
                px: { xs: 1, sm: 0 },
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: `70px repeat(${config.days.length}, minmax(72px, 1fr))`,
                  gap: 0.5,
                  minWidth: { xs: 380, sm: 560 },
                }}
              >
                {/* Header row */}
                <Box />
                {config.days.map((day) => (
                  <Typography
                    key={day}
                    variant="caption"
                    fontWeight={600}
                    sx={{ textAlign: 'center', pb: 0.5 }}
                  >
                    {day.slice(0, 3)}
                  </Typography>
                ))}

                {/* Slot rows */}
                {config.time_slots.map((slot) => (
                  <>
                    <Typography
                      key={`label-${slot}`}
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      {slot}
                    </Typography>
                    {config.days.map((day) => {
                      const slotId = `${day}_${slot}`;
                      return (
                        <DroppableSlot
                          key={slotId}
                          id={slotId}
                          value={schedule[slotId] ?? null}
                          activities={config.activities}
                        />
                      );
                    })}
                  </>
                ))}
              </Box>
            </Box>

          </DndContext>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}>
          <Chip
            label={`${filledSlots} / ${totalSlots} slots filled`}
            size="small"
            sx={{ fontWeight: 600, bgcolor: 'rgba(22,163,74,0.08)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.2)' }}
          />
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={filledSlots < 5}
              sx={{
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)' },
              }}
            >
              Submit Schedule
            </Button>
          </motion.div>
        </Box>
    </Box>
  );
}
