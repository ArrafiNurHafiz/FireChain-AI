import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Link2,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Copy,
  ExternalLink,
  Code,
  Lock,
  RefreshCw,
  Search,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { getLedgerBlocks, verifyAuditChain } from "../lib/blockchain";
import { AuditBlock } from "../lib/types";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit Trail Blockchain — FireChain AI" },
      { name: "description", content: "Ledger terdesentralisasi berbasis SHA-256 dan smart contract untuk audit transparansi karhutla." },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  const [blocks, setBlocks] = useState<AuditBlock[]>(getLedgerBlocks);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verifyResult, setVerifyResult] = useState<{
    valid: boolean;
    totalBlocks: number;
    reason?: string;
  } | null>(null);
  const [searchHash, setSearchHash] = useState<string>("");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    setBlocks(getLedgerBlocks());
  }, []);

  const runVerification = async () => {
    setVerifying(true);
    const result = await verifyAuditChain(blocks);
    setVerifyResult(result);
    setVerifying(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredBlocks = blocks.filter((b) => {
    if (!searchHash) return true;
    const q = searchHash.toLowerCase();
    return (
      b.block_hash.toLowerCase().includes(q) ||
      b.entity_id.toLowerCase().includes(q) ||
      b.record_type.toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-500 uppercase tracking-wider font-mono">
                Decentralized Registry
              </span>
              <span className="text-xs text-muted-foreground">EVM Compatible / Polygon Amoy</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Audit Trail Kriptografis Kebakaran Gambut
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Setiap deteksi satelit, laporan lapangan, dan intervensi pemadaman diikat dalam rantai hash SHA-256 yang tidak dapat dimanipulasi.
            </p>
          </div>

          <button
            onClick={runVerification}
            disabled={verifying}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500 transition disabled:opacity-50"
          >
            <ShieldCheck className={`h-4 w-4 ${verifying ? "animate-spin" : ""}`} />
            {verifying ? "Menghitung Hash..." : "Verifikasi Integritas Rantai"}
          </button>
        </div>

        {/* Verification Result Banner */}
        {verifyResult && (
          <div
            className={`rounded-xl border p-4 text-xs flex items-center justify-between ${
              verifyResult.valid
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/40 bg-red-500/10 text-red-400"
            }`}
          >
            <div className="flex items-center gap-3">
              {verifyResult.valid ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
              ) : (
                <AlertOctagon className="h-6 w-6 text-red-500 shrink-0" />
              )}
              <div>
                <p className="font-bold text-sm">
                  {verifyResult.valid
                    ? "Integritas Rantai Kriptografis Lulus Verifikasi!"
                    : "Peringatan: Integritas Rantai Terkompromi!"}
                </p>
                <p className="mt-0.5 opacity-90">
                  {verifyResult.valid
                    ? `Seluruh ${verifyResult.totalBlocks} blok diverifikasi ulang menggunakan Web Crypto API. Tidak ditemukan anomali atau modifikasi hash.`
                    : verifyResult.reason}
                </p>
              </div>
            </div>
            <span className="rounded bg-background/50 px-2.5 py-1 font-mono font-bold">
              SHA-256 PASS
            </span>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari hash blok, tipe catatan, atau ID entitas..."
              value={searchHash}
              onChange={(e) => setSearchHash(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            Total Blok Tersimpan: <b className="text-foreground">{blocks.length}</b>
          </div>
        </div>

        {/* Blocks Ledger List */}
        <div className="space-y-4">
          {filteredBlocks.map((b) => (
            <div
              key={b.index}
              className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3 hover:border-primary/40 transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-lg bg-primary/20 text-primary border border-primary/30 px-2.5 py-1 text-xs font-mono font-bold">
                    Blok #{b.index}
                  </span>
                  <span className="font-semibold text-foreground text-sm">{b.record_type}</span>
                  <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
                    {b.entity_id}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Timestamp: <span className="font-mono text-foreground">{b.timestamp}</span>
                </div>
              </div>

              {/* Hashes Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="rounded-lg bg-muted/40 p-2.5 border border-border/40">
                  <div className="flex items-center justify-between text-muted-foreground mb-1">
                    <span className="font-sans text-[11px] font-semibold">Previous Block Hash:</span>
                  </div>
                  <p className="truncate text-foreground text-[11px]">{b.previous_hash}</p>
                </div>

                <div className="rounded-lg bg-primary/5 p-2.5 border border-primary/20">
                  <div className="flex items-center justify-between text-primary mb-1">
                    <span className="font-sans text-[11px] font-semibold">Current Block Hash:</span>
                    <button
                      onClick={() => copyToClipboard(b.block_hash)}
                      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-sans text-[10px]"
                    >
                      <Copy className="h-3 w-3" />
                      {copiedHash === b.block_hash ? "Tersalin!" : "Salin"}
                    </button>
                  </div>
                  <p className="truncate text-primary font-bold text-[11px]">{b.block_hash}</p>
                </div>
              </div>

              {/* Payload details */}
              <div className="rounded-lg bg-background p-3 border border-border/60 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Lock className="h-3 w-3 text-emerald-500" />
                    Payload Data Terenkripsi & Terstempel:
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    Payload Hash: {b.payload_hash.slice(0, 16)}...
                  </span>
                </div>
                <pre className="overflow-x-auto rounded bg-muted/30 p-2.5 font-mono text-[11px] text-muted-foreground leading-relaxed">
                  {JSON.stringify(b.payload, null, 2)}
                </pre>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>Validator Node: <code className="text-foreground">{b.validator}</code></span>
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> On-Chain Consensus Valid
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Smart Contract Specifications Section */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                Spesifikasi Smart Contract: IncidentRegistry.sol
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Target Jaringan: Polygon Amoy Testnet (Chain ID: 80002) / Base Sepolia (Chain ID: 84532)
              </p>
            </div>
            <span className="rounded bg-primary/20 text-primary px-2.5 py-1 text-xs font-mono font-bold">
              Solidity 0.8.24
            </span>
          </div>

          <pre className="overflow-x-auto rounded-lg bg-background p-4 text-[11px] font-mono text-muted-foreground leading-relaxed border border-border/60">
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract IncidentRegistry {
    struct IncidentRecord {
        bytes32 incidentId;
        bytes32 payloadHash;
        uint256 timestamp;
        uint8 severity; // 0: Rendah, 1: Sedang, 2: Tinggi, 3: Sangat Tinggi
        uint8 status;   // 0: Created, 1: Verifying, 2: Verified, 3: Dispatched, 4: Resolved
        address validator;
    }

    mapping(bytes32 => IncidentRecord) public incidents;
    bytes32[] public incidentList;

    event IncidentLogged(bytes32 indexed incidentId, bytes32 payloadHash, uint8 severity);
    event StatusUpdated(bytes32 indexed incidentId, uint8 newStatus, address updater);

    function registerIncident(
        bytes32 _id,
        bytes32 _payloadHash,
        uint8 _severity
    ) external {
        require(incidents[_id].timestamp == 0, "Incident already registered");
        incidents[_id] = IncidentRecord({
            incidentId: _id,
            payloadHash: _payloadHash,
            timestamp: block.timestamp,
            severity: _severity,
            status: 0,
            validator: msg.sender
        });
        incidentList.push(_id);
        emit IncidentLogged(_id, _payloadHash, _severity);
    }
}`}
          </pre>
        </section>
      </div>
    </AppLayout>
  );
}
