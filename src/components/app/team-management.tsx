"use client";

import { useState, useEffect } from "react";
import { client } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, UserPlus, Trash2, Mail, Shield, Crown, User } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Member {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  createdAt: string;
}

export function TeamManagementTab() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [isInviting, setIsInviting] = useState(false);
  const [activeOrganization, setActiveOrganization] = useState<any>(null);

  // Ensure members is always an array
  const safeMembers = Array.isArray(members) ? members : [];

  // Fetch active organization and members
  useEffect(() => {
    ensureOrganizationAndFetch();
  }, []);

  const ensureOrganizationAndFetch = async () => {
    try {
      // First, ensure organization exists by calling our API
      // This will create one if it doesn't exist
      const ensureRes = await fetch("/api/auth/organization/ensure", {
        method: "POST",
      });

      if (ensureRes.ok) {
        const { organizationId } = await ensureRes.json();
        
        // Set as active organization in Better Auth
        try {
          await client.organization.setActiveOrganization({
            organizationId,
          });
        } catch (setError) {
          console.warn("Could not set active organization via Better Auth client:", setError);
          // Continue anyway - the session should already have it set
        }

        // Now fetch the organization
        const { data } = await client.organization.getFullOrganization({});
        setActiveOrganization(data);
        fetchMembers();
      } else {
        // Fallback: try to fetch directly
        fetchActiveOrganization();
        fetchMembers();
      }
    } catch (error) {
      console.error("Error ensuring organization:", error);
      // Fallback: try to fetch directly
      fetchActiveOrganization();
      fetchMembers();
    }
  };

  const fetchActiveOrganization = async () => {
    try {
      const { data } = await client.organization.getFullOrganization({});
      setActiveOrganization(data);
    } catch (error) {
      console.error("Error fetching active organization:", error);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await client.organization.listMembers({});
      if (error) {
        console.error("Error fetching members:", error);
        toast.error("Failed to load team members");
        setMembers([]); // Ensure it's always an array
        return;
      }
      // Ensure data is always an array
      const membersArray = Array.isArray(data) ? data : (data?.members || []);
      setMembers(membersArray);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to load team members");
      setMembers([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail || !inviteEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsInviting(true);
    try {
      const { data, error } = await client.organization.inviteMember({
        email: inviteEmail,
        role: inviteRole,
      });

      if (error) {
        toast.error(error.message || "Failed to invite member");
        return;
      }

      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setInviteRole("member");
      setInviteDialogOpen(false);
      fetchMembers(); // Refresh list to show pending invitations
    } catch (error: any) {
      toast.error(error.message || "Failed to invite member");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberIdOrEmail: string) => {
    try {
      const { error } = await client.organization.removeMember({
        memberIdOrEmail,
      });

      if (error) {
        toast.error(error.message || "Failed to remove member");
        return;
      }

      toast.success("Member removed successfully");
      fetchMembers();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove member");
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await client.organization.updateMemberRole({
        memberId,
        role: newRole,
      });

      if (error) {
        toast.error(error.message || "Failed to update role");
        return;
      }

      toast.success("Role updated successfully");
      fetchMembers();
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
    }
  };

  const getRoleIcon = (role: string) => {
    if (role.includes("owner")) return <Crown className="h-4 w-4" />;
    if (role.includes("admin")) return <Shield className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  const getRoleBadgeVariant = (role: string) => {
    if (role.includes("owner")) return "default";
    if (role.includes("admin")) return "secondary";
    return "outline";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activeOrganization) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Management
          </CardTitle>
          <CardDescription>
            No active organization. Please create or select an organization first.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                Manage your organization members and their roles.
              </CardDescription>
            </div>
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join your organization. They will receive an email with instructions.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email Address</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="colleague@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-role">Role</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Member
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Admin
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Members can manage sites and messages. Admins can also manage team members.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setInviteDialogOpen(false)}
                    disabled={isInviting}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleInviteMember} disabled={isInviting}>
                    {isInviting ? (
                      <>
                        <UserPlus className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {safeMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No team members yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Invite members to collaborate on your sites.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {safeMembers.map((member) => (
                <div key={member.id}>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.user?.image} />
                        <AvatarFallback>
                          {member.user?.name?.charAt(0).toUpperCase() || 
                           member.user?.email?.charAt(0).toUpperCase() || 
                           "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {member.user?.name || "Unknown User"}
                          </p>
                          <Badge variant={getRoleBadgeVariant(member.role)}>
                            <div className="flex items-center gap-1">
                              {getRoleIcon(member.role)}
                              <span className="capitalize">
                                {member.role.split(",")[0]}
                              </span>
                            </div>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {member.user?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={member.role.split(",")[0]}
                        onValueChange={(newRole) =>
                          handleUpdateRole(member.id, newRole)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="owner" disabled>
                            Owner
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {!member.role.includes("owner") && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {member.user?.name || member.user?.email} from your organization?
                                They will lose access to all organization sites and data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveMember(member.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

