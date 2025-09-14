import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  :root {
    --primary-dark: #1a1a2e;
    --primary-medium: #16213e;
    --primary-light: #0f3460;
    --accent-purple: #533483;
    --accent-blue: #4a90e2;
    --accent-pink: #ff6b9d;
    --text-primary: #ffffff;
    --text-secondary: #b8c5d1;
  --primary-color: #7aa2ff;
    --card-bg: rgba(255, 255, 255, 0.05);
    --card-border: rgba(255, 255, 255, 0.1);
    --button-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --button-secondary: rgba(255, 255, 255, 0.1);
    --shadow-small: 0 4px 20px rgba(0, 0, 0, 0.2);
    --shadow-medium: 0 8px 30px rgba(0, 0, 0, 0.3);
    --shadow-large: 0 20px 40px rgba(0, 0, 0, 0.4);
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-medium) 50%, var(--primary-light) 100%);
    min-height: 100vh;
    color: var(--text-primary);
    line-height: 1.6;
    overflow-x: hidden;
  }

  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
      radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
      radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
      radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      radial-gradient(circle at 40% 60%, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 200px 200px, 150px 150px, 300px 300px, 250px 250px, 180px 180px, 220px 220px;
    pointer-events: none;
    z-index: -1;
  }

  /* Accessible focus styles */
  a:focus-visible,
  button:focus-visible,
  [role="button"]:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
    outline: 3px solid #7aa2ff;
    outline-offset: 2px;
  }

  #root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .app {
    width: 100%;
    margin: 0 auto;
  }

  .loading-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: var(--text-primary);
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .fade-enter {
    opacity: 0;
    transform: translateY(20px);
  }

  .fade-enter-active {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  .fade-exit {
    opacity: 1;
    transform: translateY(0);
  }

  .fade-exit-active {
    opacity: 0;
    transform: translateY(-20px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
`;

export default GlobalStyle;
