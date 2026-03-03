'use client';

import { useState, useCallback } from 'react';
import { Box, Button, Card, CardContent, Chip, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
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
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  return (
    <Box
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      sx={{
        px: 1.5,
        py: 0.75,
        borderRadius: 2,
        bgcolor: color,
        color: '#fff',
        fontSize: '0.8rem',
        fontWeight: 600,
        cursor: 'grab',
        opacity: isDragging ? 0.4 : 1,
        userSelect: 'none',
        touchAction: 'none',
        textAlign: 'center',
        minWidth: 80,
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
}: {
  config: PlannerConfig;
  onComplete: () => void;
}) {
  const pushEvent = useGameStore((s) => s.pushEvent);
  const [schedule, setSchedule] = useState<Record<string, string | null>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

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

    setSchedule((prev) => ({ ...prev, [slotId]: activityId }));

    pushEvent({
      game: 'planner',
      event_type: 'slot_assign',
      payload: { slot: slotId, activity: activityId },
      timestamp: Date.now(),
    });
  };

  const filledSlots = Object.values(schedule).filter(Boolean).length;
  const totalSlots = config.days.length * config.time_slots.length;

  const handleSubmit = useCallback(() => {
    pushEvent({
      game: 'planner',
      event_type: 'schedule_submit',
      payload: { schedule },
      timestamp: Date.now(),
    });
    onComplete();
  }, [pushEvent, schedule, onComplete]);

  const activeActivity = config.activities.find((a) => a.id === activeId);

  return (
    <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Plan Your Ideal Week
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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

            {/* Weekly grid */}
            <Box
              sx={{
                width: '100%',
                overflowX: 'auto',
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: `80px repeat(${config.days.length}, 1fr)`,
                  gap: 0.5,
                  minWidth: 600,
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

            <DragOverlay>
              {activeActivity ? (
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 2,
                    bgcolor: activeActivity.color,
                    color: '#fff',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    boxShadow: 3,
                  }}
                >
                  {activeActivity.label}
                </Box>
              ) : null}
            </DragOverlay>
          </DndContext>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip
            label={`${filledSlots} / ${totalSlots} slots filled`}
            size="small"
            variant="outlined"
          />
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={filledSlots < 5}
            >
              Submit Schedule
            </Button>
          </motion.div>
        </Box>
      </CardContent>
    </Card>
  );
}
