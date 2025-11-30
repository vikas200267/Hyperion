/**
 * PROJECT HYPERION - PHASE 7: FORENSIC REPORTING PAGE
 * ====================================================
 *
 * Demo page for AI-powered forensic reporting using Gemini
 * Shows real-time claim analysis for insurance payouts
 */

'use client';

import React from 'react';
import ForensicTerminal from '@/components/ForensicTerminal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EXAMPLE_ORACLE_PAYLOAD, EXAMPLE_POLICY_METADATA } from '@/lib/types/oracle';
import { Shield, Sparkles } from 'lucide-react';

export default function ForensicsPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Forensic Reporting</h1>
          <Sparkles className="h-6 w-6 text-yellow-500" />
        </div>
        <p className="text-muted-foreground text-lg">
          AI-powered claim analysis using Google Gemini. Generates human-readable explanations
          for parametric insurance triggers in real-time.
        </p>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>
            Phase 7 integrates Google Gemini AI to explain insurance claim triggers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <h3 className="font-semibold">Oracle Data</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Phase 6 Arbiter provides signed oracle payloads (wind speed, location, timestamp)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h3 className="font-semibold">AI Analysis</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Gemini AI analyzes the data and generates a forensic report explaining why the claim triggered
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <h3 className="font-semibold">Real-time Stream</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Report streams in real-time to the terminal, making blockchain transactions understandable
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Demo Data:</strong> This page uses example oracle data for demonstration.
              In production, connect your wallet and trigger a real payout to see live forensic analysis.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Forensic Terminal */}
      <ForensicTerminal
        oraclePayload={EXAMPLE_ORACLE_PAYLOAD}
        policyMetadata={EXAMPLE_POLICY_METADATA}
      />

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Implementation</CardTitle>
          <CardDescription>Phase 7 integration details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Backend (Python/FastAPI)</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Google Gemini 1.5 Flash model</li>
                <li>Server-Sent Events (SSE) streaming</li>
                <li>Rate limiting & validation</li>
                <li>/api/v1/forensics/stream endpoint</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Frontend (Next.js/React)</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Real-time text streaming display</li>
                <li>TypeScript type safety</li>
                <li>Export & copy functionality</li>
                <li>Terminal-style UI with auto-scroll</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
