'use client';

import { Box, Skeleton, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';

/* ─── Full-page centered spinner with pulsing ring ─── */
export function PageLoader({ message }: { message?: string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2.5,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress size={52} thickness={3} sx={{ color: 'primary.main' }} />
          <motion.div
            style={{
              position: 'absolute',
              inset: -6,
              borderRadius: '50%',
              border: '2px solid',
              borderColor: 'transparent',
            }}
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.15, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '2px solid',
                borderColor: 'primary.light',
                opacity: 0.4,
              }}
            />
          </motion.div>
        </Box>
      </motion.div>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Typography color="text.secondary" fontWeight={500} fontSize="0.95rem">
            {message}
          </Typography>
        </motion.div>
      )}
    </Box>
  );
}

/* ─── Inline button spinner (replaces text while loading) ─── */
export function ButtonSpinner({ size = 20 }: { size?: number }) {
  return (
    <CircularProgress
      size={size}
      thickness={4}
      sx={{ color: 'inherit', mr: 1 }}
    />
  );
}

/* ─── Skeleton card: mimics a content card while loading ─── */
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <Card variant="outlined">
        <CardContent>
          <Skeleton variant="text" width="40%" height={32} sx={{ mb: 1.5 }} />
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              variant="text"
              width={i === lines - 1 ? '60%' : '100%'}
              height={20}
              sx={{ mb: 0.5 }}
            />
          ))}
          <Skeleton
            variant="rectangular"
            width="100%"
            height={42}
            sx={{ mt: 2, borderRadius: 1 }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Dashboard skeleton: multiple card placeholders ─── */
export function DashboardSkeleton() {
  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Skeleton variant="text" width={160} height={36} />
          <Skeleton variant="text" width={200} height={22} />
        </Box>
        <Skeleton variant="rectangular" width={70} height={36} sx={{ borderRadius: 1 }} />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <CardSkeleton lines={2} />
        <CardSkeleton lines={3} />
        <CardSkeleton lines={2} />
      </Box>
    </Box>
  );
}

/* ─── List skeleton: repeating rows ─── */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <Card variant="outlined">
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="55%" height={26} />
                <Skeleton variant="text" width="30%" height={18} />
              </Box>
              <Skeleton variant="text" width={24} height={24} />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </Box>
  );
}

/* ─── Detail skeleton: single item detail page ─── */
export function DetailSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <Box sx={{ maxWidth: 640, mx: 'auto', p: 2 }}>
        <Skeleton variant="rectangular" width={130} height={32} sx={{ mb: 2, borderRadius: 1 }} />
        <Card>
          <CardContent>
            <Skeleton variant="text" width="60%" height={38} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" width={80} height={24} sx={{ mb: 2, borderRadius: 12 }} />
            <Skeleton variant="text" width="100%" height={18} />
            <Skeleton variant="text" width="100%" height={18} />
            <Skeleton variant="text" width="75%" height={18} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="40%" height={18} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="35%" height={18} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="45%" height={18} sx={{ mb: 3 }} />
            <Skeleton variant="rectangular" width="100%" height={42} sx={{ borderRadius: 1 }} />
          </CardContent>
        </Card>
      </Box>
    </motion.div>
  );
}

/* ─── Result skeleton: results page placeholder ─── */
export function ResultSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <Box sx={{ maxWidth: 640, mx: 'auto', p: 2 }}>
        <Card>
          <CardContent>
            <Skeleton variant="text" width="50%" height={36} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={20} sx={{ mb: 3 }} />
            <Box sx={{ mb: 3 }}>
              <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Skeleton variant="rectangular" width={80} height={28} sx={{ borderRadius: 12 }} />
                <Skeleton variant="rectangular" width={70} height={28} sx={{ borderRadius: 12 }} />
              </Box>
            </Box>
            <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1.5 }} />
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width="100%"
                height={72}
                sx={{ mb: 1.5, borderRadius: 1 }}
              />
            ))}
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Skeleton variant="rectangular" width="50%" height={42} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="50%" height={42} sx={{ borderRadius: 1 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </motion.div>
  );
}
