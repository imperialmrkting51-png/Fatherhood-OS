import React from "react";
import Svg, { Rect } from "react-native-svg";

export function PixelLogo({ size = 80 }: { size?: number }) {
  const scale = size / 48;
  const s = (n: number) => Math.round(n * scale);

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {/* Shield body */}
      <Rect x={s(8)} y={s(4)} width={s(32)} height={s(4)} fill="#e8a045" />
      <Rect x={s(4)} y={s(8)} width={s(40)} height={s(4)} fill="#e8a045" />
      <Rect x={s(4)} y={s(12)} width={s(40)} height={s(20)} fill="#162035" />
      <Rect x={s(4)} y={s(12)} width={s(4)} height={s(20)} fill="#e8a045" />
      <Rect x={s(40)} y={s(12)} width={s(4)} height={s(20)} fill="#e8a045" />
      <Rect x={s(8)} y={s(32)} width={s(32)} height={s(4)} fill="#e8a045" />
      <Rect x={s(12)} y={s(36)} width={s(24)} height={s(4)} fill="#e8a045" />
      <Rect x={s(16)} y={s(40)} width={s(16)} height={s(4)} fill="#e8a045" />
      <Rect x={s(20)} y={s(44)} width={s(8)} height={s(2)} fill="#e8a045" />
      {/* Flame top */}
      <Rect x={s(22)} y={s(14)} width={s(4)} height={s(4)} fill="#f5c06b" />
      <Rect x={s(20)} y={s(16)} width={s(8)} height={s(4)} fill="#f5c06b" />
      {/* Flame middle */}
      <Rect x={s(18)} y={s(20)} width={s(12)} height={s(4)} fill="#e8a045" />
      <Rect x={s(16)} y={s(22)} width={s(16)} height={s(4)} fill="#e8a045" />
      {/* Logs */}
      <Rect x={s(12)} y={s(26)} width={s(24)} height={s(4)} fill="#8b6343" />
      <Rect x={s(14)} y={s(24)} width={s(4)} height={s(6)} fill="#6b4a2a" />
      <Rect x={s(30)} y={s(24)} width={s(4)} height={s(6)} fill="#6b4a2a" />
    </Svg>
  );
}
