const gradients = [
  'from-[#ff9a3c] to-[#e8412c]',
  'from-[#5ec2ff] to-[#2b5fd9]',
  'from-[#ff7a45] to-[#c2381b]',
  'from-[#ffd23f] to-[#f29f05]',
  'from-[#f08fc0] to-[#a63d8a]',
  'from-[#7be0a5] to-[#1f9d63]',
  'from-[#b69cff] to-[#6a45d8]',
];

export const avatarGradient = (index: number) => gradients[index % gradients.length];

export default function Avatar({ initials, index, size = 40 }: { initials: string; index: number; size?: number }) {
  return (
    <span
      style={{ width: size, height: size }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient(
        index,
      )} font-display text-[12px] text-white ring-2 ring-white/20`}
    >
      {initials}
    </span>
  );
}
