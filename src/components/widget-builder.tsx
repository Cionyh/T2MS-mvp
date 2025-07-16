"use client";

import { useState, useMemo } from "react";
import { useSession } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Copy, Plus } from "lucide-react";

export default function ClientWidgetBuilder() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [clientCreated, setClientCreated] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  // Client info form
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [phone, setPhone] = useState("");

  // Widget config
  const [type, setType] = useState("banner");
  const [bgColor, setBgColor] = useState("#222");
  const [textColor, setTextColor] = useState("#fff");
  const [font, setFont] = useState("sans-serif");

  const embedCode = useMemo(() => {
    if (!clientId) return "";
    return `<script 
  src="https://yourdomain.com/widget.js"
  data-client-id="${clientId}"
  data-type="${type}"
  data-bg="${bgColor}"
  data-color="${textColor}"
  data-font="${font}"
  defer
></script>`;
  }, [clientId, type, bgColor, textColor, font]);

  const handleCreateClient = async () => {
    if (!userId) {
      toast.error("You must be logged in to register a client.");
      return;
    }

    try {
      const res = await fetch("/api/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, domain, phone, userId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create client");

      setClientCreated(true);
      setClientId(data.id);
      toast.success("Client created successfully!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  const handleCopy = async () => {
    if (!embedCode) return;
    await navigator.clipboard.writeText(embedCode);
    toast.success("Embed script copied!");
  };

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Plus className="w-5 h-5" /> Register Your Site
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Business Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Domain (e.g. example.com)</Label>
            <Input value={domain} onChange={(e) => setDomain(e.target.value)} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button onClick={handleCreateClient}>Register Client</Button>
        </CardContent>
      </Card>

      {clientCreated && clientId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Configure Your Widget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Widget Type</Label>
                <select
                  className="w-full border rounded p-2"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="banner">Banner</option>
                  <option value="popup">Popup</option>
                  <option value="fullscreen">Fullscreen</option>
                </select>
              </div>
              <div>
                <Label>Font</Label>
                <Input value={font} onChange={(e) => setFont(e.target.value)} />
              </div>
              <div>
                <Label>Background Color</Label>
                <Input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
              </div>
              <div>
                <Label>Text Color</Label>
                <Input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
              </div>
            </div>

            <div className="mt-6">
              <Label>Embed Script</Label>
              <Textarea value={embedCode} rows={8} readOnly className="font-mono" />
              <Button onClick={handleCopy} className="mt-3">
                <Copy className="w-4 h-4 mr-2" /> Copy Script
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
