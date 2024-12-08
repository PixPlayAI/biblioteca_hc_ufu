// src/components/ui/progress.jsx
import * as React from 'react';
import PropTypes from 'prop-types';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '../../lib/utils';

const Progress = React.forwardRef(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn('relative h-4 w-full overflow-hidden rounded-full bg-muted', className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn('h-full w-full flex-1 bg-primary transition-all', indicatorClassName)}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));

Progress.propTypes = {
  className: PropTypes.string,
  value: PropTypes.number,
  indicatorClassName: PropTypes.string,
};

Progress.defaultProps = {
  className: '',
  value: 0,
  indicatorClassName: '',
};

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
