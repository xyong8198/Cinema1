"use client";

// This script prevents flashing by immediately applying the dark mode class before rendering
export default function DarkModeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            // Check localStorage first
            const savedTheme = localStorage.getItem('theme');
            
            // If there's a saved preference, use that
            if (savedTheme) {
              if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
              }
            }
            // Otherwise, check system preference
            else {
              const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (systemPrefersDark) {
                document.documentElement.classList.add('dark');
              }
            }
          })();
        `,
      }}
    />
  );
}
