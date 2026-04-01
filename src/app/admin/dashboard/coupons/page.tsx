"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatCouponPlan } from "@/lib/coupons";

type CouponCode = {
  id: string;
  code: string;
  plan: "starter" | "pro";
  durationInMonths: number;
  usageLimit: number;
  isActive: boolean;
  expiresAt: string | null;
  notes: string | null;
  _count: {
    redemptions: number;
  };
};

const EMPTY_FORM = {
  code: "",
  plan: "starter" as "starter" | "pro",
  durationInMonths: "1",
  usageLimit: "1",
  expiresAt: "",
  notes: "",
};

export default function AdminCouponCodesPage() {
  const [coupons, setCoupons] = useState<CouponCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const submitLabel = useMemo(
    () => (editingId ? "Save Coupon" : "Create Coupon"),
    [editingId]
  );

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/coupon-codes");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load coupon codes");
      setCoupons(data.coupons || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load coupon codes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const payload = {
        code: form.code,
        plan: form.plan,
        durationInMonths: Number(form.durationInMonths),
        usageLimit: Number(form.usageLimit),
        expiresAt: form.expiresAt || null,
        notes: form.notes,
      };

      const res = await fetch(
        editingId ? `/api/admin/coupon-codes/${editingId}` : "/api/admin/coupon-codes",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save coupon code");

      toast.success(editingId ? "Coupon updated" : "Coupon created");
      resetForm();
      loadCoupons();
    } catch (error: any) {
      toast.error(error.message || "Failed to save coupon code");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (coupon: CouponCode) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      plan: coupon.plan,
      durationInMonths: String(coupon.durationInMonths),
      usageLimit: String(coupon.usageLimit),
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "",
      notes: coupon.notes || "",
    });
  };

  const handleToggle = async (coupon: CouponCode) => {
    try {
      const res = await fetch(`/api/admin/coupon-codes/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update coupon code");
      setCoupons((prev) =>
        prev.map((item) =>
          item.id === coupon.id ? { ...item, isActive: !item.isActive } : item
        )
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to update coupon code");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/coupon-codes/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete coupon code");
      toast.success("Coupon deleted");
      setCoupons((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete coupon code");
    }
  };

  return (
    <div className="space-y-6 p-6 bg-muted rounded-2xl">
      <div>
        <h1 className="text-2xl font-bold">Coupon Codes</h1>
        <p className="text-sm text-muted-foreground">
          Create free subscription coupons tied to Starter or Growth plans with usage limits and durations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="coupon-code">Code</Label>
          <Input
            id="coupon-code"
            placeholder="FREESTARTER"
            value={form.code}
            onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="coupon-plan">Plan</Label>
          <select
            id="coupon-plan"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.plan}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, plan: e.target.value as "starter" | "pro" }))
            }
          >
            <option value="starter">Starter</option>
            <option value="pro">Growth</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="coupon-duration">Duration (months)</Label>
          <Input
            id="coupon-duration"
            type="number"
            min={1}
            value={form.durationInMonths}
            onChange={(e) => setForm((prev) => ({ ...prev, durationInMonths: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="coupon-usage">Usage limit</Label>
          <Input
            id="coupon-usage"
            type="number"
            min={1}
            value={form.usageLimit}
            onChange={(e) => setForm((prev) => ({ ...prev, usageLimit: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="coupon-expiry">Code expiry</Label>
          <Input
            id="coupon-expiry"
            type="date"
            value={form.expiresAt}
            onChange={(e) => setForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
          />
        </div>

        <div className="space-y-2 md:col-span-2 xl:col-span-3">
          <Label htmlFor="coupon-notes">Notes</Label>
          <Textarea
            id="coupon-notes"
            placeholder="Optional internal notes"
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          <span className="ml-2">{submitLabel}</span>
        </Button>
        {editingId ? (
          <Button variant="outline" onClick={resetForm} disabled={saving}>
            Cancel Edit
          </Button>
        ) : null}
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
              <TableHead>Plan</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Code Expiry</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="font-mono">{coupon.code}</TableCell>
                <TableCell>{formatCouponPlan(coupon.plan)}</TableCell>
                <TableCell>{coupon.durationInMonths} month(s)</TableCell>
                <TableCell>
                  {coupon._count.redemptions}/{coupon.usageLimit}
                </TableCell>
                <TableCell>
                  <Badge variant={coupon.isActive ? "default" : "secondary"}>
                    {coupon.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "No expiry"}
                </TableCell>
                <TableCell className="flex items-center gap-3">
                  <Switch
                    checked={coupon.isActive}
                    onCheckedChange={() => handleToggle(coupon)}
                  />
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(coupon)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)}>
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
