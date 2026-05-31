"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getChurchIntroPriceLabel } from "@/lib/church-pricing"

type ChurchVerificationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVerified: () => void
}

export function ChurchVerificationDialog({
  open,
  onOpenChange,
  onVerified,
}: ChurchVerificationDialogProps) {
  const [organizationName, setOrganizationName] = useState("")
  const [attestationConfirmed, setAttestationConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/onboarding/church-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationName, attestationConfirmed }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Unable to submit verification.")
        return
      }

      if (data.canCheckout) {
        toast.success("Church eligibility confirmed. Continuing to checkout…")
        onOpenChange(false)
        onVerified()
        return
      }

      toast.success(
        "Verification submitted. We'll review your request and email you when approved."
      )
      onOpenChange(false)
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Church intro pricing eligibility</DialogTitle>
          <DialogDescription>
            Introductory church pricing ({getChurchIntroPriceLabel()}/month, 14-day
            trial, price locked up to 3 years) is available to verified churches
            and religious organizations during our launch period.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="church-org-name">Church / organization name</Label>
            <Input
              id="church-org-name"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="Grace Community Church"
              required
              minLength={2}
            />
          </div>
          <label className="flex items-start gap-3 text-sm leading-relaxed">
            <Checkbox
              checked={attestationConfirmed}
              onCheckedChange={(checked) =>
                setAttestationConfirmed(checked === true)
              }
              className="mt-0.5"
            />
            <span>
              I confirm that I represent a church or religious organization and
              am eligible for introductory church pricing during the launch period.
            </span>
          </label>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !attestationConfirmed}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Submit & continue"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
