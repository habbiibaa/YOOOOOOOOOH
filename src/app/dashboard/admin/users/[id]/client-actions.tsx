"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, UserCog } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DeleteUserButton({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/delete-user?id=${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/dashboard/admin/users");
        router.refresh();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || "Failed to delete user"}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("An error occurred while deleting the user");
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1"
      >
        <Trash2 className="w-4 h-4" /> Delete User
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function UpdateRoleButton({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleUpdateRole = async () => {
    if (selectedRole === currentRole) {
      setIsOpen(false);
      return;
    }

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/admin/update-user-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          newRole: selectedRole,
        }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || "Failed to update role"}`);
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("An error occurred while updating the role");
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="p-1 h-6 w-6"
      >
        <UserCog className="w-3 h-3" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">Change User Role</DialogTitle>
            <DialogDescription>
              Select a new role for this user. This will update their
              permissions and access level.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="block text-sm font-medium text-black mb-2">
              Role
            </label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player">Player</SelectItem>
                <SelectItem value="coach">Coach</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={isUpdating || selectedRole === currentRole}
            >
              {isUpdating ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
