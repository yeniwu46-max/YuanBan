import greeting from '@/assets/mascot-3d/greeting.webp'
import listening from '@/assets/mascot-3d/listening.webp'
import thinking from '@/assets/mascot-3d/thinking.webp'
import encouraging from '@/assets/mascot-3d/encouraging.webp'
import reminder from '@/assets/mascot-3d/reminder.webp'
import caring from '@/assets/mascot-3d/caring.webp'
import avatar from '@/assets/mascot-3d/avatar.webp'
import type { MascotState } from '@/types/presentation'

/** One character, six real poses. Keep state artwork and accessible descriptions together. */
export const mascotArtwork: Record<MascotState, { src: string; label: string; title: string }> = {
  greeting: { src: greeting, label: '小鼋挥手向您问好', title: '挥手问候' },
  listening: { src: listening, label: '小鼋侧耳认真倾听', title: '认真倾听' },
  thinking: { src: thinking, label: '小鼋托腮思考', title: '托腮思考' },
  encouraging: { src: encouraging, label: '小鼋竖起大拇指为您鼓劲', title: '点赞鼓励' },
  reminder: { src: reminder, label: '小鼋举手温柔提醒', title: '温柔提醒' },
  caring: { src: caring, label: '小鼋抱着爱心陪伴您', title: '抱心陪伴' },
}

export const mascotPortrait = avatar
export const mascotStates = Object.keys(mascotArtwork) as MascotState[]
