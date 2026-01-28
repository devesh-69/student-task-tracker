import React from 'react';
import { Github, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border py-2 px-4 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-6">
        {/* Attribution - Muted, reveals on hover */}
        <div className="text-center group">
          <p className="text-xs text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
            Created by <span className="font-medium group-hover:text-foreground transition-colors">Devesh Tatkare</span>
            <span className="mx-1.5">•</span>
            <span className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">MCA Mini Project</span>
          </p>
        </div>

        {/* Subtle divider */}
        <div className="h-4 w-px bg-border" />

        {/* Social Links - Small, muted, hover reveals */}
        <div className="flex items-center gap-3">
          <a
            href="https://www.linkedin.com/in/deveshtatkare/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-muted-foreground/50 hover:text-[#0A66C2] transition-colors"
            aria-label="LinkedIn Profile"
          >
            <Linkedin className="w-3.5 h-3.5" />
            <span className="text-xs hidden sm:inline">LinkedIn</span>
          </a>
          
          <a
            href="https://github.com/devesh-69"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-muted-foreground/50 hover:text-foreground transition-colors"
            aria-label="GitHub Profile"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="text-xs hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
