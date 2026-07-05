"use client";
/* eslint-disable */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast, Toaster } from "sonner";
import { client } from "@/lib/auth-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  Trash,
  RefreshCw,
  UserCircle,
  Calendar as CalendarIcon,
  Gift,
  ArrowRightLeft,
  FlaskConical,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
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
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useGrantCompAccess } from "@/lib/hooks/useAdminSubscriptions";

type User = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "affiliate";
  banned?: boolean;
  registeredFromSandbox?: boolean;
  migratedToLiveAt?: string | null;
  createdAt: string;
};

type NewUserForm = {
  email: string;
  password: string;
  name: string;
  role: User["role"];
};

const EMPTY_GRANT_FORM = {
  email: "",
  userId: "",
  plan: "starter" as "starter" | "pro" | "church",
  durationInMonths: "3",
  cancelExistingBilling: true,
};

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<NewUserForm>({
    email: "",
    password: "",
    name: "",
    role: "user",
  });
  const [isLoading, setIsLoading] = useState<string | undefined>();
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [banForm, setBanForm] = useState({
    userId: "",
    reason: "",
    expirationDate: undefined as Date | undefined,
  });
  const [deleteConfirmUserId, setDeleteConfirmUserId] = useState<string | null>(null);
  const [deleteConfirmUserName, setDeleteConfirmUserName] = useState<string>("");
  const [grantDialogOpen, setGrantDialogOpen] = useState(false);
  const [grantForm, setGrantForm] = useState(EMPTY_GRANT_FORM);
  const [migrateUserId, setMigrateUserId] = useState<string | null>(null);
  const [migrateUserName, setMigrateUserName] = useState("");
  const [markSandboxUserId, setMarkSandboxUserId] = useState<string | null>(null);
  const [markSandboxUserName, setMarkSandboxUserName] = useState("");

  const grantCompAccess = useGrantCompAccess();

  const { data, isLoading: isUsersLoading } = useQuery({
    queryKey: ["admin-users-clients"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users?page=1&limit=100");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json() as Promise<{ users: User[] }>;
    },
  });
  const users = data?.users ?? [];

	const handleCreateUser = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading("create");
		try {
			const authRole =
				newUser.role === "affiliate" ? "user" : newUser.role;

			await client.admin.createUser({
				email: newUser.email,
				password: newUser.password,
				name: newUser.name,
				role: authRole,
			});

			if (newUser.role === "affiliate") {
				const lookup = await fetch(
					`/api/admin/users?q=${encodeURIComponent(newUser.email)}&limit=1`
				);
				const lookupData = await lookup.json();
				const createdUserId = lookupData?.users?.[0]?.id as string | undefined;

				if (!createdUserId) {
					throw new Error("User created but affiliate role could not be assigned.");
				}

				const roleRes = await fetch(`/api/admin/users/${createdUserId}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ role: "affiliate" }),
				});
				const roleData = roleRes.ok ? null : await roleRes.json().catch(() => ({}));
				if (!roleRes.ok) {
					throw new Error(roleData?.error || "Failed to assign affiliate role");
				}
			}

			toast.success("User created successfully");
			setNewUser({ email: "", password: "", name: "", role: "user" });
			setIsDialogOpen(false);
			queryClient.invalidateQueries({
				queryKey: ["admin-users-clients"],
			});
		} catch (error: any) {
			toast.error(error.message || "Failed to create user");
		} finally {
			setIsLoading(undefined);
		}
	};

	const handleDeleteUser = async (id: string) => {
		if (!id) return;
		setIsLoading(`delete-${id}`);
		try {
			const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
			const data = res.ok ? null : await res.json().catch(() => ({}));
			if (!res.ok) {
				throw new Error(data?.error || "Failed to delete user");
			}
			toast.success("User and all linked data (sites, subscriptions, install requests) deleted successfully");
			setDeleteConfirmUserId(null);
			setDeleteConfirmUserName("");
			queryClient.invalidateQueries({
				queryKey: ["admin-users-clients"],
			});
		} catch (error: any) {
			toast.error(error.message || "Failed to delete user");
		} finally {
			setIsLoading(undefined);
		}
	};

	const handleRevokeSessions = async (id: string) => {
		setIsLoading(`revoke-${id}`);
		try {
			await client.admin.revokeUserSessions({ userId: id });
			toast.success("Sessions revoked for user");
		} catch (error: any) {
			toast.error(error.message || "Failed to revoke sessions");
		} finally {
			setIsLoading(undefined);
		}
	};

	const handleImpersonateUser = async (id: string) => {
		setIsLoading(`impersonate-${id}`);
		try {
			await client.admin.impersonateUser({ userId: id });
			toast.success("Now viewing as this user");
			router.push("/app");
		} catch (error: any) {
			toast.error(error.message || "Failed to impersonate user");
		} finally {
			setIsLoading(undefined);
		}
	};

	const handleBanUser = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(`ban-${banForm.userId}`);
		try {
			if (!banForm.expirationDate) {
				throw new Error("Expiration date is required");
			}
			await client.admin.banUser({
				userId: banForm.userId,
				banReason: banForm.reason,
				banExpiresIn: banForm.expirationDate.getTime() - new Date().getTime(),
			});
			toast.success("User banned successfully");
			setIsBanDialogOpen(false);
			queryClient.invalidateQueries({
				queryKey: ["admin-users-clients"],
			});
		} catch (error: any) {
			toast.error(error.message || "Failed to ban user");
		} finally {
			setIsLoading(undefined);
		}
	};

	const openGrantDialog = (user?: User) => {
		setGrantForm({
			email: user?.email ?? "",
			userId: user?.id ?? "",
			plan: "starter",
			durationInMonths: "3",
			cancelExistingBilling: true,
		});
		setGrantDialogOpen(true);
	};

	const handleGrantComp = () => {
		const duration = parseInt(grantForm.durationInMonths, 10);
		if (!grantForm.email.trim() && !grantForm.userId) {
			toast.error("Enter a user email");
			return;
		}
		if (!Number.isFinite(duration) || duration < 1) {
			toast.error("Enter a valid duration in months");
			return;
		}

		grantCompAccess.mutate(
			{
				userId: grantForm.userId || undefined,
				email: grantForm.email.trim() || undefined,
				plan: grantForm.plan,
				durationInMonths: duration,
				cancelExistingBilling: grantForm.cancelExistingBilling,
			},
			{
				onSuccess: (data) => {
					setGrantDialogOpen(false);
					setGrantForm(EMPTY_GRANT_FORM);
					toast.success(
						`Complimentary ${data.subscription.planLabel} access granted to ${data.user.email} for ${data.subscription.durationInMonths} month(s).`
					);
				},
				onError: (error) => {
					toast.error(
						error instanceof Error
							? error.message
							: "Failed to grant complimentary access"
					);
				},
			}
		);
	};

	const handleMigrateToLive = async (userId: string) => {
		setIsLoading(`migrate-${userId}`);
		try {
			const res = await fetch(`/api/admin/users/${userId}/migrate-to-live`, {
				method: "POST",
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || "Failed to migrate user to live");
			}
			toast.success(
				`${data.email} migrated to live. Test subscriptions were cleared; they can subscribe on production.`
			);
			setMigrateUserId(null);
			setMigrateUserName("");
			queryClient.invalidateQueries({
				queryKey: ["admin-users-clients"],
			});
		} catch (error: any) {
			toast.error(error.message || "Failed to migrate user to live");
		} finally {
			setIsLoading(undefined);
		}
	};

	const handleMarkAsSandbox = async (userId: string) => {
		setIsLoading(`mark-sandbox-${userId}`);
		try {
			const res = await fetch(`/api/admin/users/${userId}/mark-sandbox`, {
				method: "POST",
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || "Failed to mark user as sandbox");
			}
			toast.success(`${data.email} marked as sandbox`);
			setMarkSandboxUserId(null);
			setMarkSandboxUserName("");
			queryClient.invalidateQueries({
				queryKey: ["admin-users-clients"],
			});
		} catch (error: any) {
			toast.error(error.message || "Failed to mark user as sandbox");
		} finally {
			setIsLoading(undefined);
		}
	};

	return (
    <div className="container mx-auto px-4 space-y-4">
      <Toaster richColors />
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
          <CardTitle className="text-2xl">Clients Management</CardTitle>
          <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2"
            onClick={() => openGrantDialog()}
          >
            <Gift className="h-4 w-4" /> Grant complimentary access
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" /> Create New Client or Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Client</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <Label className="mb-4" htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="mb-4" htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="mb-4" htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="mb-4" htmlFor="role">Role</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: User["role"]) =>
                        setNewUser({ ...newUser, role: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="affiliate">Affiliate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading === "create"}
                >
                  {isLoading === "create" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create User"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
          <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
            <DialogContent className="max-w-md sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Ban User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleBanUser} className="space-y-4">
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    value={banForm.reason}
                    onChange={(e) =>
                      setBanForm({ ...banForm, reason: e.target.value })
                    }
                    required
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="expirationDate"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !banForm.expirationDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {banForm.expirationDate ? (
                          format(banForm.expirationDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={banForm.expirationDate}
                        onSelect={(date: any) =>
                          setBanForm({ ...banForm, expirationDate: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading === `ban-${banForm.userId}`}
                >
                  {isLoading === `ban-${banForm.userId}` ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Banning...
                    </>
                  ) : (
                    "Ban User"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isUsersLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap min-w-[150px]">
                      Email
                    </TableHead>
                    <TableHead className="whitespace-nowrap min-w-[120px]">
                      Name
                    </TableHead>
                    <TableHead className="whitespace-nowrap min-w-[100px]">
                      Role
                    </TableHead>
                    <TableHead className="whitespace-nowrap min-w-[100px]">
                      Banned
                    </TableHead>
                    <TableHead className="whitespace-nowrap min-w-[100px]">
                      Environment
                    </TableHead>
                    <TableHead className="whitespace-nowrap min-w-[120px]">
                      Registered
                    </TableHead>
                    <TableHead className="whitespace-nowrap min-w-[180px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="whitespace-nowrap min-w-[150px]">
                        {user.email}
                      </TableCell>
                      <TableCell className="whitespace-nowrap min-w-[120px]">
                        {user.name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap min-w-[100px]">
                        {user.role || "user"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap min-w-[100px]">
                        {user.banned ? (
                          <Badge variant="destructive">Yes</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap min-w-[100px]">
                        {user.registeredFromSandbox ? (
                          <Badge className="bg-amber-600">Sandbox</Badge>
                        ) : user.migratedToLiveAt ? (
                          <Badge className="bg-green-600">Live (migrated)</Badge>
                        ) : (
                          <Badge variant="outline">Live</Badge>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap min-w-[120px] text-muted-foreground">
                        {user.createdAt
                          ? format(new Date(user.createdAt), "MMM d, yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap min-w-[180px]">
                        <div className="flex flex-wrap gap-2">
                          {!user.registeredFromSandbox &&
                            !user.migratedToLiveAt &&
                            user.role !== "admin" && (
                              <AlertDialog
                                open={markSandboxUserId === user.id}
                                onOpenChange={(open) => {
                                  if (!open) {
                                    setMarkSandboxUserId(null);
                                    setMarkSandboxUserName("");
                                  }
                                }}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  title="Mark as sandbox"
                                  onClick={() => {
                                    setMarkSandboxUserId(user.id);
                                    setMarkSandboxUserName(
                                      user.name || user.email
                                    );
                                  }}
                                  disabled={isLoading?.startsWith("mark-sandbox")}
                                >
                                  {isLoading === `mark-sandbox-${user.id}` ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <FlaskConical className="h-4 w-4" />
                                  )}
                                </Button>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Mark as sandbox?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Flag <strong>{markSandboxUserName}</strong>{" "}
                                      as a sandbox-registered user. Use this for
                                      accounts created on staging before auto-flagging
                                      existed. You can migrate them to live later.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={(e) => {
                                        e.preventDefault();
                                        if (markSandboxUserId) {
                                          void handleMarkAsSandbox(markSandboxUserId);
                                        }
                                      }}
                                      disabled={
                                        !!markSandboxUserId &&
                                        isLoading ===
                                          `mark-sandbox-${markSandboxUserId}`
                                      }
                                    >
                                      {markSandboxUserId &&
                                      isLoading ===
                                        `mark-sandbox-${markSandboxUserId}` ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Marking...
                                        </>
                                      ) : (
                                        "Mark as sandbox"
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          {user.registeredFromSandbox && user.role !== "admin" && (
                            <AlertDialog
                              open={migrateUserId === user.id}
                              onOpenChange={(open) => {
                                if (!open) {
                                  setMigrateUserId(null);
                                  setMigrateUserName("");
                                }
                              }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                title="Migrate to live"
                                onClick={() => {
                                  setMigrateUserId(user.id);
                                  setMigrateUserName(user.name || user.email);
                                }}
                                disabled={isLoading?.startsWith("migrate")}
                              >
                                {isLoading === `migrate-${user.id}` ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <ArrowRightLeft className="h-4 w-4" />
                                )}
                              </Button>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Migrate to live?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Move <strong>{migrateUserName}</strong> from sandbox
                                    to live. Their sites and messages are kept. Test
                                    Stripe billing and sandbox subscriptions are
                                    cleared — they will need a live subscription
                                    (or complimentary access) on production.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (migrateUserId) {
                                        void handleMigrateToLive(migrateUserId);
                                      }
                                    }}
                                    disabled={
                                      !!migrateUserId &&
                                      isLoading === `migrate-${migrateUserId}`
                                    }
                                  >
                                    {migrateUserId &&
                                    isLoading === `migrate-${migrateUserId}` ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Migrating...
                                      </>
                                    ) : (
                                      "Migrate to live"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          {user.role !== "admin" && (
                            <Button
                              variant="outline"
                              size="sm"
                              title="Grant complimentary access"
                              onClick={() => openGrantDialog(user)}
                              disabled={grantCompAccess.isPending}
                            >
                              <Gift className="h-4 w-4" />
                            </Button>
                          )}
                          {user.role !== "admin" && user.role !== "affiliate" && (
                          <AlertDialog
                            open={deleteConfirmUserId === user.id}
                            onOpenChange={(open) => {
                              if (!open) {
                                setDeleteConfirmUserId(null);
                                setDeleteConfirmUserName("");
                              }
                            }}
                          >
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setDeleteConfirmUserId(user.id);
                                setDeleteConfirmUserName(user.name || user.email);
                              }}
                              disabled={isLoading?.startsWith("delete")}
                            >
                              {isLoading === `delete-${user.id}` ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash className="h-4 w-4" />
                              )}
                            </Button>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete user?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the account for{" "}
                                  <strong>{deleteConfirmUserName}</strong> and all linked data:
                                  subscriptions, sites, install requests, messages, and phone numbers.
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (deleteConfirmUserId) handleDeleteUser(deleteConfirmUserId);
                                  }}
                                  disabled={!!deleteConfirmUserId && isLoading === `delete-${deleteConfirmUserId}`}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {deleteConfirmUserId && isLoading === `delete-${deleteConfirmUserId}` ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    "Delete"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          )}
                          {user.role !== "admin" && user.role !== "affiliate" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleImpersonateUser(user.id)}
                              disabled={isLoading === `impersonate-${user.id}` || user.banned}
                              title={
                                user.banned
                                  ? "Cannot impersonate a banned user"
                                  : "Login as this user"
                              }
                            >
                              {isLoading === `impersonate-${user.id}` ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span className="sr-only">Logging in…</span>
                                </>
                              ) : (
                                <>
                                  <UserCircle className="h-4 w-4" />
                                  Login as
                                </>
                              )}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              setBanForm({
                                userId: user.id,
                                reason: "",
                                expirationDate: undefined,
                              });
                              if (user.banned) {
                                setIsLoading(`ban-${user.id}`);
                                await client.admin.unbanUser(
                                  {
                                    userId: user.id,
                                  },
                                  {
                                    onError(context) {
                                      toast.error(
                                        context.error.message ||
                                          "Failed to unban user"
                                      );
                                      setIsLoading(undefined);
                                    },
                                    onSuccess() {
                                      queryClient.invalidateQueries({
                                        queryKey: ["admin-users-clients"],
                                      });
                                      toast.success("User unbanned successfully");
                                    },
                                  }
                                );
                                queryClient.invalidateQueries({
                                  queryKey: ["admin-users-clients"],
                                });
                              } else {
                                setIsBanDialogOpen(true);
                              }
                            }}
                            disabled={isLoading?.startsWith("ban")}
                          >
                            {isLoading === `ban-${user.id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : user.banned ? (
                              "Unban"
                            ) : (
                              "Ban"
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={grantDialogOpen} onOpenChange={setGrantDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Grant complimentary access</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <p className="text-sm text-muted-foreground">
              Give an existing user free plan access without Stripe billing. Their
              current subscription can be cancelled automatically.
            </p>
            <div>
              <Label htmlFor="client-grant-email">User email</Label>
              <Input
                id="client-grant-email"
                type="email"
                placeholder="customer@example.com"
                value={grantForm.email}
                onChange={(e) =>
                  setGrantForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                    userId: "",
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="client-grant-plan">Plan</Label>
              <Select
                value={grantForm.plan}
                onValueChange={(value: "starter" | "pro" | "church") =>
                  setGrantForm((prev) => ({ ...prev, plan: value }))
                }
              >
                <SelectTrigger id="client-grant-plan">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="pro">Growth</SelectItem>
                  <SelectItem value="church">Church</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="client-grant-duration">Duration (months)</Label>
              <Input
                id="client-grant-duration"
                type="number"
                min={1}
                max={120}
                value={grantForm.durationInMonths}
                onChange={(e) =>
                  setGrantForm((prev) => ({
                    ...prev,
                    durationInMonths: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex items-start gap-3 rounded-md border p-3">
              <Checkbox
                id="client-grant-cancel-billing"
                checked={grantForm.cancelExistingBilling}
                onCheckedChange={(checked) =>
                  setGrantForm((prev) => ({
                    ...prev,
                    cancelExistingBilling: checked === true,
                  }))
                }
              />
              <div className="space-y-1">
                <Label htmlFor="client-grant-cancel-billing" className="cursor-pointer">
                  Cancel existing billing
                </Label>
                <p className="text-sm text-muted-foreground">
                  Cancels any active Stripe or coupon subscription before
                  applying complimentary access.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setGrantDialogOpen(false);
                setGrantForm(EMPTY_GRANT_FORM);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleGrantComp} disabled={grantCompAccess.isPending}>
              {grantCompAccess.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Grant access"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}