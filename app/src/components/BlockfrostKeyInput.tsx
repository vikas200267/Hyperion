'use client';

import { useState, useEffect } from 'react';
import { Key, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function BlockfrostKeyInput() {
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check if key exists in localStorage
    const stored = localStorage.getItem('hyperion-blockfrost-key');
    if (stored) {
      setSavedKey(stored);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('hyperion-blockfrost-key', apiKey.trim());
      setSavedKey(apiKey.trim());
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsOpen(false);
      }, 2000);
    }
  };

  const handleClear = () => {
    localStorage.removeItem('hyperion-blockfrost-key');
    setSavedKey('');
    setApiKey('');
  };

  const keyStatus = savedKey ? 'connected' : 'not-connected';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={keyStatus === 'connected' ? 'default' : 'outline'}
          className={`gap-2 ${
            keyStatus === 'connected'
              ? 'bg-green-600 hover:bg-green-700 border-green-500'
              : 'border-yellow-500 text-yellow-500 hover:bg-yellow-500/10'
          }`}
        >
          <Key className="h-4 w-4" />
          {keyStatus === 'connected' ? 'Blockfrost Connected' : 'Connect Blockfrost'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Blockfrost API Configuration
          </DialogTitle>
          <DialogDescription>
            Connect to Cardano blockchain using Blockfrost API. Get your free API key from{' '}
            <a
              href="https://blockfrost.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              blockfrost.io
              <ExternalLink className="h-3 w-3" />
            </a>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {savedKey ? (
            <Alert className="bg-green-500/10 border-green-500">
              <Check className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-500">
                API Key configured successfully!
                <div className="mt-2 text-xs font-mono bg-background/50 p-2 rounded">
                  {savedKey.slice(0, 15)}...{savedKey.slice(-10)}
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-yellow-500/10 border-yellow-500">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-500">
                No API key configured. Enter your Blockfrost API key below to enable live blockchain features.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="api-key">Blockfrost Project ID</Label>
            <Input
              id="api-key"
              placeholder="preprodXXXXXXXXXXXXXXXXXXXXXXXX or mainnetXXXXXXXXXXXXXXXXXXXXXX"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              For testnet (preprod): starts with "preprod..."
              <br />
              For mainnet: starts with "mainnet..."
            </p>
          </div>

          {showSuccess && (
            <Alert className="bg-green-500/10 border-green-500">
              <Check className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-500">
                API key saved successfully! Reload the page to connect.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 justify-end">
            {savedKey && (
              <Button variant="outline" onClick={handleClear}>
                Clear Key
              </Button>
            )}
            <Button onClick={handleSave} disabled={!apiKey.trim()}>
              <Check className="h-4 w-4 mr-2" />
              Save Key
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <p>ℹ️ Your API key is stored locally in your browser</p>
            <p>🔒 It's never sent to our servers</p>
            <p>🔄 Reload the page after saving to connect</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
