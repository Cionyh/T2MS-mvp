"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type InboundNumber = {
  id: string;
  phone: string;
  normalizedPhone: string;
  label: string | null;
  purpose: "MAIN" | "AFFILIATE";
  isActive: boolean;
  createdAt: string;
};

export default function AdminInboundNumbersPage() {
  const [rows, setRows] = useState<InboundNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [label, setLabel] = useState("");
  const [purpose, setPurpose] = useState<"MAIN" | "AFFILIATE">("MAIN");
  const [adding, setAdding] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/inbound-numbers");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Failed to load inbound numbers");
      setRows(body.data ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    try {
      setAdding(true);
      const res = await fetch("/api/admin/inbound-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, label, purpose, isActive: true }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Failed to add inbound number");
      toast.success("Inbound number added");
      setPhone("");
      setLabel("");
      setPurpose("MAIN");
      setOpen(false);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add");
    } finally {
      setAdding(false);
    }
  }

  async function patchRow(id: string, payload: Partial<InboundNumber>) {
    try {
      setSavingId(id);
      const res = await fetch(`/api/admin/inbound-numbers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Failed to update");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteRow(id: string) {
    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/inbound-numbers/${id}`, { method: "DELETE" });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Failed to delete");
      toast.success("Inbound number removed");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card className="mt-6 shadow-md rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Inbound Numbers</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Manage Twilio destination numbers. MAIN routes to customer-site posting; AFFILIATE
            logs to affiliate inbox only.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Number
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add inbound number</DialogTitle>
              <DialogDescription>
                Use E.164 format when possible, for example +14244848267.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="inbound-phone">Phone</Label>
                <Input
                  id="inbound-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+14244848267"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inbound-label">Label (optional)</Label>
                <Input
                  id="inbound-label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Main US line"
                />
              </div>
              <div className="space-y-2">
                <Label>Purpose</Label>
                <Select value={purpose} onValueChange={(v: "MAIN" | "AFFILIATE") => setPurpose(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MAIN">MAIN (post to sites)</SelectItem>
                    <SelectItem value="AFFILIATE">AFFILIATE (log only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={adding}>
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={adding}>
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No inbound numbers configured yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phone</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-sm">{row.phone}</TableCell>
                  <TableCell>{row.label || "—"}</TableCell>
                  <TableCell>
                    <Select
                      value={row.purpose}
                      onValueChange={(value: "MAIN" | "AFFILIATE") =>
                        patchRow(row.id, { purpose: value })
                      }
                    >
                      <SelectTrigger className="w-[190px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MAIN">MAIN</SelectItem>
                        <SelectItem value="AFFILIATE">AFFILIATE</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant={row.isActive ? "default" : "outline"}
                      disabled={savingId === row.id}
                      onClick={() => patchRow(row.id, { isActive: !row.isActive })}
                    >
                      {savingId === row.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : row.isActive ? (
                        <Badge className="bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-sm">{new Date(row.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      disabled={deletingId === row.id}
                      onClick={() => deleteRow(row.id)}
                    >
                      {deletingId === row.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
