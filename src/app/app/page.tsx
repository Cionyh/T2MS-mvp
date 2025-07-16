// app/dashboard/page.tsx

"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  // Mock data for now — replace with fetched data later
  const client = {
    name: "Taco Fiesta",
    phoneNumber: "+1 (555) 123-4567",
    websiteUrl: "https://tacofiesta.com",
    defaultMessageType: "popup",
  };

  const messages = [
    {
      id: "msg1",
      content: "🚨 We're closed today due to weather.",
      createdAt: "2025-07-14 08:32",
      type: "banner",
    },
    {
      id: "msg2",
      content: "🌮 20% off tacos until 5 PM!",
      createdAt: "2025-07-13 14:17",
      type: "popup",
    },
  ];

  return (
    <div className="min-h-screen px-6 py-10 sm:py-16 sm:px-10 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-4">Widget Builder</h1>
      <p className="text-muted-foreground text-sm mb-10">
        Manage your website messages and settings.
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Name:</strong> {client.name}</p>
          <p><strong>Phone:</strong> {client.phoneNumber}</p>
          <p><strong>Website:</strong> <a href={client.websiteUrl} className="underline text-blue-600" target="_blank">{client.websiteUrl}</a></p>
          <p><strong>Default Type:</strong> <Badge variant="outline">{client.defaultMessageType}</Badge></p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Latest Messages</CardTitle>
          <Button size="sm">Add Message</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="text-sm">
              <p className="mb-1">{msg.content}</p>
              <div className="flex items-center justify-between text-muted-foreground text-xs">
                <span>{msg.createdAt}</span>
                <Badge variant="secondary">{msg.type}</Badge>
              </div>
              <Separator className="my-3" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
