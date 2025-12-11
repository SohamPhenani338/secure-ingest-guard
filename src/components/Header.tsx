import { Shield, Activity, Database, Settings, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  isConnected: boolean;
  onConnect: () => void;
}

export function Header({ isConnected, onConnect }: HeaderProps) {
  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <div className="relative bg-gradient-to-br from-primary to-accent p-2 rounded-lg">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-tight">
                Safe<span className="text-gradient">Check</span>
              </h1>
              <p className="text-xs text-muted-foreground">BEC & Phishing Detection</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Dashboard
            </a>
            <a href="#triage" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Triage Log
            </a>
            <a href="#dataset" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Dataset
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-safe animate-pulse' : 'bg-muted-foreground'}`} />
              <span className="text-xs font-medium">
                {isConnected ? 'Gmail Connected' : 'Disconnected'}
              </span>
            </div>
            
            <Button 
              variant={isConnected ? 'outline' : 'glow'} 
              size="sm"
              onClick={onConnect}
            >
              <Mail className="h-4 w-4 mr-2" />
              {isConnected ? 'Connected' : 'Connect Gmail'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
