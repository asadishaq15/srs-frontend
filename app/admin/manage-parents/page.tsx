"use client"
import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "react-toastify"

export default function ManageParentsPage() {
  const [parents, setParents] = useState<any[]>([])
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [selectedParent, setSelectedParent] = useState<any>(null)
  const [newPassword, setNewPassword] = useState("")

  useEffect(() => {
    fetchParents()
  }, [])

  const fetchParents = async () => {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_SRS_SERVER}/parent`)
    setParents(res.data)
  }

  const openResetDialog = (parent: any) => {
    setSelectedParent(parent)
    setResetDialogOpen(true)
    setNewPassword("")
  }

  const handleResetPassword = async () => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_SRS_SERVER}/parent/${selectedParent._id}/reset-password`, {
        password: newPassword,
      })
      toast.success("Password reset successfully!")
      setResetDialogOpen(false)
    } catch (e) {
      toast.error("Failed to reset password.")
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Manage Parents</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="px-3 py-2 border">Name</th>
              <th className="px-3 py-2 border">Email</th>
              <th className="px-3 py-2 border">Phone</th>
              <th className="px-3 py-2 border">Children</th>
              <th className="px-3 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {parents.map((parent) => (
              <tr key={parent._id}>
                <td className="border px-3 py-2">{parent.firstName} {parent.lastName}</td>
                <td className="border px-3 py-2">{parent.email}</td>
                <td className="border px-3 py-2">{parent.phone}</td>
                <td className="border px-3 py-2">
                {(parent.children || []).length > 0
                    ? (parent.children.length === 1 
                        ? '1 child' 
                        : `${parent.children.length} children`)
                    : "None"}
                </td>
                <td className="border px-3 py-2">
                  <Button variant="outline" onClick={() => openResetDialog(parent)}>
                    Reset Password
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Parent Password</DialogTitle>
          </DialogHeader>
          <div>
            <div>
              <b>Parent:</b> {selectedParent?.firstName} {selectedParent?.lastName} ({selectedParent?.email})
            </div>
            <div className="my-4">
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleResetPassword} disabled={newPassword.length < 6}>
              Confirm Reset
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}