interface PullToUpdateIndicatorProps {
  pullDistance: number;
  armed: boolean;
  offline?: boolean;
}

/**
 * Visual feedback while the user pulls down from the top of the page.
 */
function PullToUpdateIndicator({ pullDistance, armed, offline }: PullToUpdateIndicatorProps) {
  if (pullDistance <= 4) return null;

  const opacity = Math.min(pullDistance / 70, 1);

  let label = 'Pull down to update';
  if (offline) {
    label = 'Online connection needed';
  } else if (armed) {
    label = 'Release to force update';
  }

  return (
    <div
      className={`pull-to-update ${armed ? 'armed' : ''} ${offline ? 'offline' : ''}`}
      style={{
        transform: `translateY(${Math.max(pullDistance - 36, 0)}px)`,
        opacity,
      }}
      aria-hidden="true"
    >
      <span>{label}</span>
    </div>
  );
}

export default PullToUpdateIndicator;
