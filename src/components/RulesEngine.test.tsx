import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import RulesEngine from './RulesEngine';

describe('RulesEngine Component', () => {
  it('renders Rules Engine title', () => {
    render(<RulesEngine />);
    expect(screen.getByText(/Rules Engine/i)).toBeInTheDocument();
  });
});
