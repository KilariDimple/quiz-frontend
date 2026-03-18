/**
 * Anti-Cheating System
 * Tracks tab switches, fullscreen exits, dev tools, and copy attempts
 */

let cheatingCallbacks = [];

export function initAntiCheat(onCheatDetected) {
  cheatingCallbacks.push(onCheatDetected);

  // Track tab switching / visibility change
  const handleVisibilityChange = () => {
    if (document.hidden) {
      onCheatDetected('tab_switch');
    }
  };

  // Track fullscreen exit
  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      onCheatDetected('fullscreen_exit');
    }
  };

  // Track window blur (alt-tab, etc.)
  const handleBlur = () => {
    onCheatDetected('tab_switch');
  };

  // Track copy attempts
  const handleCopy = (e) => {
    e.preventDefault();
    onCheatDetected('copy_attempt');
  };

  // Track right-click
  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  // Track dev tools (basic detection via resize)
  let devToolsOpen = false;
  const handleResize = () => {
    const threshold = 160;
    if (
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold
    ) {
      if (!devToolsOpen) {
        devToolsOpen = true;
        onCheatDetected('devtools_open');
      }
    } else {
      devToolsOpen = false;
    }
  };

  // Track keyboard shortcuts for dev tools
  const handleKeyDown = (e) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      onCheatDetected('devtools_open');
    }
    // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) {
      e.preventDefault();
      onCheatDetected('devtools_open');
    }
    // Ctrl+U (view source)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
    }
  };

  // Attach listeners
  document.addEventListener('visibilitychange', handleVisibilityChange);
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  window.addEventListener('blur', handleBlur);
  document.addEventListener('copy', handleCopy);
  document.addEventListener('contextmenu', handleContextMenu);
  window.addEventListener('resize', handleResize);
  document.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    window.removeEventListener('blur', handleBlur);
    document.removeEventListener('copy', handleCopy);
    document.removeEventListener('contextmenu', handleContextMenu);
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('keydown', handleKeyDown);
    cheatingCallbacks = cheatingCallbacks.filter((cb) => cb !== onCheatDetected);
  };
}

export function requestFullscreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen().catch(() => {});
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  }
}
