// src/components/ui/card.jsx
import * as React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
    {...props}
  />
));

Card.propTypes = {
  className: PropTypes.string,
};

Card.defaultProps = {
  className: '',
};

Card.displayName = 'Card';

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
));

CardHeader.propTypes = {
  className: PropTypes.string,
};

CardHeader.defaultProps = {
  className: '',
};

CardHeader.displayName = 'CardHeader';

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0 text-foreground', className)} {...props} />
));

CardContent.propTypes = {
  className: PropTypes.string,
};

CardContent.defaultProps = {
  className: '',
};

CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardContent };
