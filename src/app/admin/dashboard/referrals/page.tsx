"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { buildReferralSignupUrl } from "@/lib/referral";

type ReferralCode = {
  id: string;
  code: string;
  type: string;
  label: string | null;
  isActive: boolean;
  createdAt: string;
  _count: {
    users: number;
  };
};

export default function AdminReferralCodesPage() {
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState("sales");
  const [newLabel, setNewLabel] = useState("");

  const loadCodes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/referral-codes");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load referral codes");
      setCodes(data.codes || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load referral codes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCodes();
  }, []);

  const handleCreate = async () => {
    try {
      setCreating(true);
      const res = await fetch("/api/admin/referral-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCode,
          type: newType,
          label: newLabel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create referral code");
      toast.success("Referral code created");
      setNewCode("");
      setNewType("sales");
      setNewLabel("");
      loadCodes();
    } catch (error: any) {
      toast.error(error.message || "Failed to create referral code");
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (code: ReferralCode) => {
    try {
      const res = await fetch(`/api/admin/referral-codes/${code.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !code.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update referral code");
      setCodes((prev) =>
        prev.map((item) =>
          item.id === code.id ? { ...item, isActive: !item.isActive } : item
        )
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to update referral code");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/referral-codes/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete referral code");
      toast.success("Referral code deleted");
      setCodes((prev) => prev.filter((item) => item.id !== id));
    } catch (error: any) {
      toast.error(error.message || "Failed to delete referral code");
    }
  };

  const handleCopyReferralUrl = async (code: string) => {
    const url = buildReferralSignupUrl(code);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Referral URL copied");
    } catch {
      toast.error("Could not copy referral URL");
    }
  };

  return (
    <div className="space-y-6 p-6 bg-muted rounded-2xl">
      <div>
        <h1 className="text-2xl font-bold">Referral Codes</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage referral codes for sales, influencers, and affiliates.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Input
          placeholder="Code e.g. RW01"
          value={newCode}
          onChange={(e) => setNewCode(e.target.value.toUpperCase())}
        />
        <Input
          placeholder="Type e.g. sales"
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
        />
        <Input
          placeholder="Label / owner"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
        />
        <Button onClick={handleCreate} disabled={creating}>
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          <span className="ml-2">Create Code</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Signups</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {codes.map((code) => (
              <TableRow key={code.id}>
                <TableCell className="font-mono">{code.code}</TableCell>
                <TableCell className="capitalize">{code.type}</TableCell>
                <TableCell>{code.label || "-"}</TableCell>
                <TableCell>{code._count?.users ?? 0}</TableCell>
                <TableCell>
                  <Badge variant={code.isActive ? "default" : "secondary"}>
                    {code.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="flex items-center gap-3">
                  <Switch
                    checked={code.isActive}
                    onCheckedChange={() => handleToggle(code)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Copy referral URL"
                    aria-label={`Copy referral URL for ${code.code}`}
                    onClick={() => handleCopyReferralUrl(code.code)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(code.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
