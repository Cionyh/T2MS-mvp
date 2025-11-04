"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Phone, CheckCircle2, XCircle, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface PhoneNumber {
  id: string;
  phone: string;
  verified: boolean;
  verificationMethod?: string | null;
  createdAt: string;
}

interface PhoneNumberManagementProps {
  clientId: string;
}

export function PhoneNumberManagement({ clientId }: PhoneNumberManagementProps) {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<PhoneNumber | null>(null);
  const [newPhone, setNewPhone] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingPin, setIsSendingPin] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetchPhoneNumbers();
    }
  }, [clientId]);

  const fetchPhoneNumbers = async () => {
    if (!clientId) return;
    
    try {
      setLoading(true);
      const res = await fetch(`/api/client/${clientId}/phone`);
      if (!res.ok) {
        throw new Error("Failed to fetch phone numbers");
      }
      const data = await res.json();
      setPhoneNumbers(data || []);
    } catch (error) {
      console.error("Error fetching phone numbers:", error);
      toast.error("Failed to load phone numbers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhone = async () => {
    if (!newPhone) {
      toast.error("Please enter a phone number");
      return;
    }

    try {
      const res = await fetch(`/api/client/${clientId}/phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: newPhone }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add phone number");
      }

      toast.success("Phone number added. Please verify it.");
      setNewPhone("");
      setAddDialogOpen(false);
      fetchPhoneNumbers();
    } catch (error: any) {
      toast.error(error.message || "Failed to add phone number");
    }
  };

  const handleSendPin = async (phoneNumber: PhoneNumber) => {
    setIsSendingPin(true);
    try {
      const res = await fetch("/api/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          phone: phoneNumber.phone,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to send verification code");
      }

      toast.success("Verification code sent via SMS");
      setSelectedPhoneNumber(phoneNumber);
      setVerifyDialogOpen(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification code");
    } finally {
      setIsSendingPin(false);
    }
  };

  const handleVerifyPin = async () => {
    if (!selectedPhoneNumber || !pinCode) {
      toast.error("Please enter the verification code");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch("/api/phone/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumberId: selectedPhoneNumber.id,
          pinCode,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Invalid verification code");
      }

      toast.success("Phone number verified successfully!");
      setPinCode("");
      setVerifyDialogOpen(false);
      setSelectedPhoneNumber(null);
      fetchPhoneNumbers();
    } catch (error: any) {
      toast.error(error.message || "Invalid verification code");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRemovePhone = async (phoneId: string) => {
    try {
      const res = await fetch(`/api/client/${clientId}/phone/${phoneId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to remove phone number");
      }

      toast.success("Phone number removed");
      fetchPhoneNumbers();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove phone number");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Phone Numbers</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Add verified phone numbers to receive SMS messages for this site.
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Phone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Phone Number</DialogTitle>
              <DialogDescription>
                Add a phone number to receive SMS messages for this site. You'll need to verify it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="phone-input">Phone Number</Label>
                <PhoneInput
                  international
                  defaultCountry="US"
                  value={newPhone}
                  onChange={(value) => setNewPhone(value || "")}
                  placeholder="Enter phone number"
                  className="phone-input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPhone}>
                Add Phone Number
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {phoneNumbers.length === 0 ? (
        <div className="text-center py-6 border border-dashed rounded-lg">
          <Phone className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No phone numbers added yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {phoneNumbers.map((phone) => (
            <div
              key={phone.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{phone.phone}</span>
                {phone.verified ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <XCircle className="h-3 w-3 mr-1" />
                    Unverified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!phone.verified && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSendPin(phone)}
                    disabled={isSendingPin}
                  >
                    {isSendingPin ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Verify"
                    )}
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Phone Number</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove {phone.phone}? This phone number will no longer receive SMS messages.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleRemovePhone(phone.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PIN Verification Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Phone Number</DialogTitle>
            <DialogDescription>
              Enter the 6-digit verification code sent to {selectedPhoneNumber?.phone}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pin-code">Verification Code</Label>
              <Input
                id="pin-code"
                type="text"
                placeholder="123456"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setVerifyDialogOpen(false);
                setPinCode("");
              }}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button onClick={handleVerifyPin} disabled={isVerifying || pinCode.length !== 6}>
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

