import React from 'react';
import { describe, it, expect } from 'vitest';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';

describe('Frontend UI Components Unit Tests', () => {
  it('should render Button component correctly', () => {
    expect(Button).toBeDefined();
    const element = React.createElement(Button, { variant: 'primary', children: 'Click Me' });
    expect(element.props.children).toBe('Click Me');
    expect(element.props.variant).toBe('primary');
  });

  it('should render Badge component with variants', () => {
    expect(Badge).toBeDefined();
    const badgeElement = React.createElement(Badge, { variant: 'success', children: 'PASSED' });
    expect(badgeElement.props.children).toBe('PASSED');
    expect(badgeElement.props.variant).toBe('success');
  });

  it('should render Card component correctly', () => {
    expect(Card).toBeDefined();
    const cardElement = React.createElement(Card, { className: 'p-4', children: 'All systems operational' });
    expect(cardElement.props.children).toBe('All systems operational');
  });
});

