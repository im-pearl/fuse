'use client';

import { motion } from 'framer-motion';

interface Props {
  comment: string;
  onDone: () => void;
}

export default function CommentOverlay({ comment, onDone }: Props) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-8 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      onClick={onDone}
    >
      <motion.p
        className="text-white/70 text-sm text-center leading-relaxed italic px-4"
        initial={{ y: 10 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {comment}
      </motion.p>
      <motion.span
        className="text-white/20 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.2, 0.8, 0.2] }}
        transition={{ delay: 2, duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        ▶
      </motion.span>
    </motion.div>
  );
}
