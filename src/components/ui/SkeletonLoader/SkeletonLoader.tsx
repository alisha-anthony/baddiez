import React from 'react';

export interface SkeletonLoaderProps {
  height?: number | string;
  width?: number | string;
  borderRadius?: string;
  style?: React.CSSProperties;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  height = '20px',
  width = '100%',
  borderRadius = 'var(--radius-md)',
  style,
}) => {
  return (
    <div
      className="skeleton-shimmer"
      style={{
        height,
        width,
        borderRadius,
        ...style,
      }}
    />
  );
};
