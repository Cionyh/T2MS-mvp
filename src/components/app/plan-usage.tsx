"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Globe, MessageSquare, HardDrive, Crown } from "lucide-react";
import { formatLimit } from "@/lib/plan-limits";

// Note: Prisma removed - using API route instead

interface PlanUsageProps {
  userId: string;
}

interface UsageStats {
  websites: { current: number; limit: number };
  messages: { current: number; limit: number };
  plan: string;
}

export function PlanUsage({ userId }: PlanUsageProps) {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsageStats();
  }, [userId]);

  const fetchUsageStats = async () => {
    try {
      // Fetch usage stats from API
      const res = await fetch("/api/plan/usage");
      if (!res.ok) {
        throw new Error("Failed to fetch usage stats");
      }
      
      const data = await res.json();
      const limits = data.limits;
      const websitesCount = data.websitesCount;
      const messagesCount = data.messagesCount;
      
      setUsage({
        websites: { current: websitesCount, limit: limits.websites },
        messages: { current: messagesCount, limit: limits.messages },
        plan: limits.websites === 1 ? "free" : 
              limits.websites === 3 ? "starter" : 
              limits.websites === 10 ? "pro" : "enterprise"
      });
    } catch (error) {
      console.error("Error fetching usage stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Plan Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usage) return null;

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Plan Usage
          <Badge variant="outline" className="ml-auto capitalize">
            {usage.plan}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Websites Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Websites</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {usage.websites.current} / {formatLimit(usage.websites.limit)}
            </span>
          </div>
          <Progress 
            value={getUsagePercentage(usage.websites.current, usage.websites.limit)} 
            className="h-2"
          />
        </div>

        {/* Messages Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Messages (This Month)</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {usage.messages.current} / {formatLimit(usage.messages.limit)}
            </span>
          </div>
          <Progress 
            value={getUsagePercentage(usage.messages.current, usage.messages.limit)} 
            className="h-2"
          />
        </div>

        {/* Upgrade Button for non-enterprise plans */}
        {usage.plan !== "enterprise" && (
          <Button 
            onClick={() => window.location.href = "/pricing"}
            className="w-full"
            variant="outline"
          >
            Upgrade Plan
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
