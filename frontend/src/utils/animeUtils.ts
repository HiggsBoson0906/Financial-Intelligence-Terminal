import anime from 'animejs';

/**
 * Animate a numerical counter cleanly with JetBrains Mono tabular digits
 */
export const animateCounter = (
  element: HTMLElement | null,
  startValue: number,
  endValue: number,
  duration = 1000,
  prefix = '',
  suffix = '',
  decimals = 2
) => {
  if (!element) return;

  const obj = { val: startValue };
  anime({
    targets: obj,
    val: endValue,
    duration: duration,
    ease: 'outExpo',
    onUpdate: () => {
      const formatted = obj.val.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      element.innerText = `${prefix}${formatted}${suffix}`;
    },
  });
};

/**
 * Pulse effect for active AI agent nodes
 */
export const pulseElement = (target: string | HTMLElement) => {
  return anime({
    targets: target,
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    borderColor: ['rgba(0, 240, 255, 0.4)', 'rgba(0, 240, 255, 0.9)', 'rgba(0, 240, 255, 0.4)'],
    duration: 1500,
    ease: 'inOutQuad',
    loop: true,
  });
};

/**
 * Animate data flow particles along SVG connections using native SVG path length
 */
export const animateSvgFlow = (pathElement: SVGPathElement | null) => {
  if (!pathElement) return;

  const totalLength = pathElement.getTotalLength ? pathElement.getTotalLength() : 100;
  pathElement.style.strokeDasharray = `${totalLength}`;
  pathElement.style.strokeDashoffset = `${totalLength}`;

  return anime({
    targets: pathElement,
    strokeDashoffset: [totalLength, 0],
    ease: 'inOutSine',
    duration: 2000,
    delay: anime.stagger(250),
    direction: 'alternate',
    loop: true,
  });
};

/**
 * Terminal command stream reveal
 */
export const animateTerminalReveal = (targets: string | HTMLElement[]) => {
  return anime({
    targets,
    translateY: [12, 0],
    opacity: [0, 1],
    delay: anime.stagger(120),
    ease: 'outQuart',
    duration: 600,
  });
};
