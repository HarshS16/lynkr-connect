// // import * as React from "react";
// // import { Moon, Sun } from "lucide-react";
// // import { Button } from "./button";

// // export function ThemeToggle() {
// //   const [theme, setTheme] = React.useState(() =>
// //     document.documentElement.classList.contains("dark") ? "dark" : "light"
// //   );

// //   React.useEffect(() => {
// //     document.documentElement.classList.toggle("dark", theme === "dark");
// //     localStorage.setItem("lynkr-theme", theme);
// //   }, [theme]);

// //   React.useEffect(() => {
// //     const saved = localStorage.getItem("lynkr-theme");
// //     if (saved) setTheme(saved);
// //   }, []);

// //   return (
// //     <Button
// //       variant="ghost"
// //       size="icon"
// //       aria-label="Toggle theme"
// //       onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
// //       className="theme-toggle"
// //     >
// //       {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
// //     </Button>
// //   );
// // }


// import * as React from "react";

// export function ThemeToggle() {
//   const [theme, setTheme] = React.useState(() =>
//     document.documentElement.classList.contains("dark") ? "dark" : "light"
//   );

//   React.useEffect(() => {
//     document.documentElement.classList.toggle("dark", theme === "dark");
//     localStorage.setItem("lynkr-theme", theme);
//   }, [theme]);

//   React.useEffect(() => {
//     const saved = localStorage.getItem("lynkr-theme");
//     if (saved) setTheme(saved);
//   }, []);

//   return (
//     <button 
//       className="theme-toggle" 
//       type="button" 
//       title="Toggle theme" 
//       aria-label="Toggle theme"
//       onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
//     >
//       <svg 
//         xmlns="http://www.w3.org/2000/svg" 
//         aria-hidden="true" 
//         width="1em" 
//         height="1em" 
//         className="theme-toggle__lightbulb" 
//         strokeWidth="0.7" 
//         stroke="currentColor" 
//         fill="currentColor" 
//         strokeLinecap="round" 
//         viewBox="0 0 32 32"
//       >
//         <path 
//           strokeWidth="0" 
//           d="M9.4 9.9c1.8-1.8 4.1-2.7 6.6-2.7 5.1 0 9.3 4.2 9.3 9.3 0 2.3-.8 4.4-2.3 6.1-.7.8-2 2.8-2.5 4.4 0 .2-.2.4-.5.4-.2 0-.4-.2-.4-.5v-.1c.5-1.8 2-3.9 2.7-4.8 1.4-1.5 2.1-3.5 2.1-5.6 0-4.7-3.7-8.5-8.4-8.5-2.3 0-4.4.9-5.9 2.5-1.6 1.6-2.5 3.7-2.5 6 0 2.1.7 4 2.1 5.6.8.9 2.2 2.9 2.7 4.9 0 .2-.1.5-.4.5h-.1c-.2 0-.4-.1-.4-.4-.5-1.7-1.8-3.7-2.5-4.5-1.5-1.7-2.3-3.9-2.3-6.1 0-2.3 1-4.7 2.7-6.5z" 
//         />
//         <path d="M19.8 28.3h-7.6" />
//         <path d="M19.8 29.5h-7.6" />
//         <path d="M19.8 30.7h-7.6" />
//         <path 
//           pathLength="1" 
//           className="theme-toggle__lightbulb__coil" 
//           fill="none" 
//           d="M14.6 27.1c0-3.4 0-6.8-.1-10.2-.2-1-1.1-1.7-2-1.7-1.2-.1-2.3 1-2.2 2.3.1 1 .9 1.9 2.1 2h7.2c1.1-.1 2-1 2.1-2 .1-1.2-1-2.3-2.2-2.3-.9 0-1.7.7-2 1.7 0 3.4 0 6.8-.1 10.2" 
//         />
//         <g className="theme-toggle__lightbulb__rays">
//           <path pathLength="1" d="M16 6.4V1.3" />
//           <path pathLength="1" d="M26.3 15.8h5.1" />
//           <path pathLength="1" d="m22.6 9 3.7-3.6" />
//           <path pathLength="1" d="M9.4 9 5.7 5.4" />
//           <path pathLength="1" d="M5.7 15.8H.6" />
//         </g>
//       </svg>
//     </button>
//   );
// }

// import * as React from "react";

// export function ThemeToggle() {
//   const [theme, setTheme] = React.useState(() =>
//     document.documentElement.classList.contains("dark") ? "dark" : "light"
//   );

//   React.useEffect(() => {
//     document.documentElement.classList.toggle("dark", theme === "dark");
//     localStorage.setItem("lynkr-theme", theme);
//   }, [theme]);

//   React.useEffect(() => {
//     const saved = localStorage.getItem("lynkr-theme");
//     if (saved) setTheme(saved);
//   }, []);

//   return (
//     <button 
//       className="theme-toggle" 
//       type="button" 
//       title="Toggle theme" 
//       aria-label="Toggle theme"
//       onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
//     >
//       <svg 
//         xmlns="http://www.w3.org/2000/svg" 
//         aria-hidden="true" 
//         width="1em" 
//         height="1em" 
//         fill="currentColor" 
//         className="theme-toggle__around" 
//         viewBox="0 0 32 32"
//       >
//         <clipPath id="theme-toggle__around__cutout">
//           <path d="M0 0h42v30a1 1 0 00-16 13H0Z" />
//         </clipPath>
//         <g clipPath="url(#theme-toggle__around__cutout)">
//           <circle cx="16" cy="16" r="8.4" />
//           <g>
//             <circle cx="16" cy="3.3" r="2.3" />
//             <circle cx="27" cy="9.7" r="2.3" />
//             <circle cx="27" cy="22.3" r="2.3" />
//             <circle cx="16" cy="28.7" r="2.3" />
//             <circle cx="5" cy="22.3" r="2.3" />
//             <circle cx="5" cy="9.7" r="2.3" />
//           </g>
//         </g>
//       </svg>
//     </button>
//   );
// }



// import * as React from "react";
// import "@theme-toggles/react/css/Around.css";
// import { Around } from "@theme-toggles/react";

// export function ThemeToggle() {
//   const [theme, setTheme] = React.useState(() =>
//     document.documentElement.classList.contains("dark") ? "dark" : "light"
//   );

//   React.useEffect(() => {
//     document.documentElement.classList.toggle("dark", theme === "dark");
//     localStorage.setItem("lynkr-theme", theme);
//   }, [theme]);

//   React.useEffect(() => {
//     const saved = localStorage.getItem("lynkr-theme");
//     if (saved) setTheme(saved);
//   }, []);

//   const handleToggle = () => {
//     setTheme(theme === "dark" ? "light" : "dark");
//   };

//   return (
//     <Around 
//       duration={750} 
//       toggled={theme === "dark"}
//       toggle={handleToggle}
//       aria-label="Toggle theme"
//       title="Toggle theme"
//     />
//   );
// } 

import * as React from "react";
import "@theme-toggles/react/css/Around.css";
import { Around } from "@theme-toggles/react";

export function ThemeToggle() {
  const [theme, setTheme] = React.useState(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("lynkr-theme", theme);
  }, [theme]);

  React.useEffect(() => {
    const saved = localStorage.getItem("lynkr-theme");
    if (saved) setTheme(saved);
  }, []);

  const handleToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Around 
      duration={750} 
      toggled={theme === "dark"}
      toggle={handleToggle}
      aria-label="Toggle theme"
      title="Toggle theme"
    />
  );
}