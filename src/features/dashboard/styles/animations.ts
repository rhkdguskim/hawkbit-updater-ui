import { css, keyframes } from 'styled-components';

/**
 * Dashboard Animation System
 * Provides smooth, performant animations for dashboard widgets
 */

// Fade in animation
export const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Slide in from left
export const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// Slide in from right
export const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// Scale in animation
export const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// Pulse animation for live indicators
export const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
`;

// Shimmer effect for loading states
export const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

// Bounce animation
export const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
`;

// Spin animation
export const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

/**
 * Animation Mixins
 */

// Smooth fade in with delay support
export const animatedFadeIn = (delay = 0) => css`
  animation: ${fadeIn} 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms both;
`;

// Stagger children animation
export const staggerChildren = (itemCount: number, baseDelay = 0, increment = 50) => {
  let animations = '';
  for (let i = 0; i < itemCount; i++) {
    animations += `
      &:nth-child(${i + 1}) {
        animation-delay: ${baseDelay + i * increment}ms;
      }
    `;
  }
  return css`
    ${animations}
  `;
};

// Hover lift effect
export const hoverLift = css`
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Smooth transitions
export const smoothTransition = (properties = 'all', duration = '0.2s') => css`
  transition: ${properties} ${duration} cubic-bezier(0.4, 0, 0.2, 1);
`;

// Loading shimmer effect
export const loadingShimmer = css`
  background: linear-gradient(
    90deg,
    var(--ant-color-bg-container) 0%,
    var(--ant-color-fill-quaternary) 50%,
    var(--ant-color-bg-container) 100%
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite linear;
`;

/**
 * Performance Optimizations
 */

// GPU accelerated animations
export const gpuAccelerated = css`
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
`;

// Reduce motion for accessibility
export const respectMotionPreference = (animation: string) => css`
  @media (prefers-reduced-motion: no-preference) {
    ${animation}
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transition: opacity 0.1s;
  }
`;
