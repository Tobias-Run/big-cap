import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

/**
 * Shared modal accessibility behaviour for the app's dialogs.
 *
 * The modals previously had none of this: no dialog semantics, no focus
 * management, and the page behind them stayed scrollable and tabbable, so a
 * keyboard or screen-reader user could tab straight out of an "open" dialog
 * into the content it was covering.
 *
 * Handles, for as long as `isOpen` is true:
 *  - Escape to close.
 *  - Moving focus into the dialog on open, and restoring it to whatever was
 *    focused before (usually the button that opened it) on close.
 *  - Trapping Tab / Shift+Tab inside the dialog.
 *  - Locking body scroll, restoring the previous overflow value afterwards.
 *
 * Returns a ref to attach to the dialog container element.
 */
export function useModalA11y(isOpen, onClose) {
  const containerRef = useRef(null);
  // Held in a ref rather than a dependency so that a parent re-rendering with
  // a fresh onClose identity doesn't tear down and re-run the whole effect,
  // which would steal focus back to the top of the dialog mid-interaction.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement;
    const container = containerRef.current;

    // Move focus into the dialog. Prefer the first focusable control; fall
    // back to the container itself (which carries tabIndex={-1}) so focus
    // never stays behind on the page underneath.
    const focusables = () =>
      container ? Array.from(container.querySelectorAll(FOCUSABLE)).filter(el => el.offsetParent !== null) : [];
    const first = focusables()[0];
    (first || container)?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCloseRef.current?.();
        return;
      }
      if (e.key !== 'Tab' || !container) return;

      const items = focusables();
      if (items.length === 0) {
        // Nothing to cycle through — keep focus on the container.
        e.preventDefault();
        container.focus();
        return;
      }
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      } else if (!container.contains(document.activeElement)) {
        // Focus escaped the dialog some other way (e.g. browser chrome).
        e.preventDefault();
        firstItem.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      // Only restore focus if it's still somewhere inside the closing dialog;
      // if the user has already clicked elsewhere, don't yank it back.
      if (!container || container.contains(document.activeElement) || document.activeElement === document.body) {
        previouslyFocused instanceof HTMLElement && previouslyFocused.focus();
      }
    };
  }, [isOpen]);

  return containerRef;
}
