"use client";

import { useState, useEffect } from "react";
import {
  useAdminClients,
  useDeleteClient,
  useUpdateClient,
  Client,
} from "@/lib/hooks/useAdminClients";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

export default function AdminClientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editingClient, setEditingClient] = useState<null | Client>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useAdminClients({
    page,
    limit: 10,
    search,
    enabled: true,
  });

  const deleteClient = useDeleteClient();
  const updateClient = useUpdateClient();

  const isUpdating = updateClient.isPending;
  const isDeleting = deleteClient.isPending;

  useEffect(() => {
    setPage(1);
    refetch();
  }, [search, refetch]);

  const handleSave = () => {
    if (!editingClient) return;
    updateClient.mutate(
      {
        id: editingClient.id,
        name: editingClient.name,
        domain: editingClient.domain,
        phone: editingClient.phone,
      },
      {
        onSuccess: () => {
          setEditingClient(null);
          refetch();
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deletingClientId) return;
    deleteClient.mutate(deletingClientId, {
      onSuccess: () => {
        setDeletingClientId(null);
        refetch();
      },
    });
  };

  return (
    <div className="space-y-6 p-6 bg-muted rounded-2xl">
      <h1 className="text-2xl font-bold">Sites Management</h1>

      {/* Search */}
      <Input
        placeholder="Search Sites by name, domain, or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      {/* Table */}
      <div className="overflow-x-auto">
        {(() => {
          if (isLoading) {
            return (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin h-6 w-6 text-muted" />
              </div>
            );
          }
          if (isError) {
            return <p className="text-red-500">Failed to load clients.</p>;
          }
          return (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>User Email</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{client.domain}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>{client.user.email}</TableCell>
                    <TableCell>{client._count.messages}</TableCell>
                    <TableCell>
                      {new Date(client.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="space-x-2">
                      {/* Edit Dialog */}
                      <Dialog
                        open={!!editingClient && editingClient.id === client.id}
                        onOpenChange={(open) => !open && setEditingClient(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingClient(client)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Edit Client</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <Input
                              placeholder="Name"
                              value={editingClient?.name ?? ""}
                              onChange={(e) =>
                                setEditingClient((prev) =>
                                  prev ? { ...prev, name: e.target.value } : null
                                )
                              }
                            />
                            <Input
                              placeholder="Domain"
                              value={editingClient?.domain ?? ""}
                              onChange={(e) =>
                                setEditingClient((prev) =>
                                  prev ? { ...prev, domain: e.target.value } : null
                                )
                              }
                            />
                            <Input
                              placeholder="Phone"
                              value={editingClient?.phone ?? ""}
                              onChange={(e) =>
                                setEditingClient((prev) =>
                                  prev ? { ...prev, phone: e.target.value } : null
                                )
                              }
                            />
                          </div>
                          <DialogFooter>
                            <Button onClick={handleSave} disabled={isUpdating}>
                              {isUpdating ? (
                                <Loader2 className="animate-spin h-4 w-4" />
                              ) : (
                                "Save"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {/* Delete AlertDialog */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeletingClientId(client.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete client "{client.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="space-x-2">
                            <AlertDialogCancel
                              onClick={() => setDeletingClientId(null)}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <Loader2 className="animate-spin h-4 w-4" />
                              ) : (
                                "Delete"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          );
        })()}
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            variant="outline"
          >
            Previous
          </Button>
          <span>
            Page {page} of {data.pagination.totalPages}
          </span>
          <Button
            disabled={page === data.pagination.totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
