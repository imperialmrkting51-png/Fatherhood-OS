import { getInitials } from "@/lib/utils";

interface ChildAvatarProps {
  name: string;
  color: string;
  className?: string;
}

export function ChildAvatar({ name, color, className = "w-10 h-10 text-sm" }: ChildAvatarProps) {
  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-medium ${className}`}
      style={{ backgroundColor: color || '#888' }}
    >
      {getInitials(name)}
    </div>
  );
}
