import React from 'react';

export const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M6 8a1 1 0 012 0v5a1 1 0 11-2 0V8zm4 0a1 1 0 112 0v5a1 1 0 11-2 0V8z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M4 6a1 1 0 011-1h10a1 1 0 011 1v1H4V6zm2 2v7a2 2 0 002 2h4a2 2 0 002-2V8H6z" clipRule="evenodd" />
  </svg>
);

export const DeactivateIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm3.54 10.46a1 1 0 01-1.42 1.42L10 11.41l-2.12 2.13a1 1 0 01-1.42-1.42L8.59 10 6.46 7.88a1 1 0 011.42-1.42L10 8.59l2.12-2.13a1 1 0 011.42 1.42L11.41 10l2.13 2.12z" />
  </svg>
);

export const EditIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path d="M17.414 2.586a2 2 0 010 2.828l-10 10A2 2 0 016 16H4a1 1 0 01-1-1v-2a2 2 0 01.586-1.414l10-10a2 2 0 012.828 0zM15 4l1 1-2 2-1-1 2-2z" />
  </svg>
);
