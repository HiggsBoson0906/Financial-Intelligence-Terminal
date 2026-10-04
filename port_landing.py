import re
import os

html_path = r"c:\Users\tmtec\Desktop\CU 2026\Financial-Intelligence-Terminal\landing.html"
with open(html_path, "r", encoding="utf-8") as f:
    content = f.read()

# Extract CSS
css_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
css_content = css_match.group(1) if css_match else ""

# Scope CSS
css_content = css_content.replace(":root", ".landing-page-root")
css_content = css_content.replace("html,body", ".landing-page-root")
css_content = css_content.replace("body {", ".landing-page-root {")

# Extract Body content (excluding script)
body_match = re.search(r'<body>(.*?)<script', content, re.DOTALL)
body_content = body_match.group(1) if body_match else ""

# Fix Branding
body_content = body_content.replace("FIT", "PillerStreet")
body_content = body_content.replace("FINANCIAL INTELLIGENCE TERMINAL", "MARKET INTELLIGENCE PLATFORM") # or just leave as is since we're replacing FIT
body_content = body_content.replace("LAUNCH PillerStreet TERMINAL", "LAUNCH PILLERSTREET")
body_content = body_content.replace("LAUNCH TERMINAL", "LAUNCH PILLERSTREET")

body_content = body_content.replace("Gemini synthesis", "Groq synthesis")
body_content = body_content.replace("Gemini", "Groq")

body_content = body_content.replace("History", "Context")
body_content = body_content.replace("Historical RAG", "Contextual RAG")
body_content = body_content.replace("0.82 similarity", "strong similarity")

# Escape backticks for JSX template string
body_content = body_content.replace("`", "\\`")

# Extract JS
js_match = re.search(r'<script>\s*const \$=s=>document.querySelector\(s\)(.*?)</script>', content, re.DOTALL)
js_content = js_match.group(1) if js_match else ""

# We need to expose window.THREE for the scene logic because it assumes it.
# We will import * as THREE from 'three' in the file and put it on window in useEffect.
# Modify JS for React cleanup
js_content_modified = """
    const root = containerRef.current;
    if (!root) return;
    const $ = s => root.querySelector(s);
    const $$ = s => root.querySelectorAll(s);
    
    // Store cleanup items
    const observers = [];
    const rafIds = [];
    const eventListeners = [];
    
    // Override globals safely within this effect scope by declaring local variables
    const addEventListener = (event, handler, options) => {
      window.addEventListener(event, handler, options);
      eventListeners.push({ event, handler, options, target: window });
    };
    
    const requestAnimationFrame = (cb) => {
      const id = window.requestAnimationFrame(cb);
      rafIds.push(id);
      return id;
    };
    
    const OriginalIntersectionObserver = window.IntersectionObserver;
    class IntersectionObserver extends OriginalIntersectionObserver {
      constructor(cb, options) {
        super(cb, options);
        observers.push(this);
      }
    }
""" + js_content

# We need to replace document.querySelectorAll with root.querySelectorAll
js_content_modified = js_content_modified.replace("document.querySelectorAll", "root.querySelectorAll")

react_component = f"""
import React, {{ useEffect, useRef }} from 'react';
import './LandingPage.css';
import * as THREE from 'three';
import Lenis from 'lenis';

export const LandingPage = ({{ onLaunch }}) => {{
  const containerRef = useRef(null);

  useEffect(() => {{
    window.THREE = THREE;
    window.Lenis = Lenis;

    {js_content_modified}

    // Intercept navigation
    const root = containerRef.current;
    if(root) {{
      const navLinks = root.querySelectorAll('a[href^="#"]');
      navLinks.forEach(l => {{
        l.addEventListener('click', (e) => {{
          const id = l.getAttribute('href');
          const target = root.querySelector(id);
          if(target) {{
            e.preventDefault();
            target.scrollIntoView({{ behavior: 'smooth' }});
          }}
        }});
      }});
      
      const launchLinks = root.querySelectorAll('a[href="/terminal"]');
      launchLinks.forEach(l => {{
        l.addEventListener('click', (e) => {{
          e.preventDefault();
          if (onLaunch) onLaunch();
        }});
      }});
    }}

    return () => {{
      observers.forEach(obs => obs.disconnect());
      rafIds.forEach(id => window.cancelAnimationFrame(id));
      eventListeners.forEach(({{ event, handler, options, target }}) => {{
        target.removeEventListener(event, handler, options);
      }});
    }};
  }}, [onLaunch]);

  return (
    <div className="landing-page-root" ref={{containerRef}} dangerouslySetInnerHTML={{{{ __html: `{body_content}` }}}} />
  );
}};
"""

os.makedirs(r"c:\Users\tmtec\Desktop\CU 2026\Financial-Intelligence-Terminal\frontend\src\pages", exist_ok=True)

with open(r"c:\Users\tmtec\Desktop\CU 2026\Financial-Intelligence-Terminal\frontend\src\pages\LandingPage.css", "w", encoding="utf-8") as f:
    f.write(css_content)

with open(r"c:\Users\tmtec\Desktop\CU 2026\Financial-Intelligence-Terminal\frontend\src\pages\LandingPage.tsx", "w", encoding="utf-8") as f:
    f.write(react_component)

print("Created LandingPage.tsx and LandingPage.css")
