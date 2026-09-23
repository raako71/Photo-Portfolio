interface PullToUpdateIndicatorProps {
  pullDistance: number;
  armed: boolean;
}

/**
 * Visual feedback while the user pulls down from the top of the page.
 */
function PullToUpdateIndicator({ pullDistance, armed }: PullToUpdateIndicatorProps) {
  if (pullDistance <= 4) return null;

  const opacity = Math.min(pullDistance / 70, 1);

  return (
    <div
      className={`pull-to-update ${armed ? 'armed' : ''}`}
      style={{
        transform: `translateY(${Math.max(pullDistance - 36, 0)}px)`,
        opacity,
      }}
      aria-hidden="true"
    >
      <span>{armed ? 'Release to force update' : 'Pull down to update'}</span>
    </div>
  );
}

export default PullToUpdateIndicator;
