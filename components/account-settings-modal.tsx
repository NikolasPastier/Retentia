"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { updateUserProfile } from "@/lib/firebase/firestore"
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Loader2 } from "lucide-react"
import { useEffect } from "react"

interface AccountSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AccountSettingsModal({ isOpen, onClose }: AccountSettingsModalProps) {
  const { user, userProfile, refreshProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Profile form
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")

  // Password form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Delete account confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")

  useEffect(() => {
    if (isOpen && userProfile) {
      setDisplayName(userProfile.displayName || "")
      setEmail(userProfile.email || "")
    }
  }, [isOpen, userProfile])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen || !user || !userProfile) return null

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      await updateUserProfile(user.uid, { displayName })
      await refreshProfile()
      setSuccess("Profile updated successfully!")
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      setIsLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      // Re-authenticate user before password change
      const credential = EmailAuthProvider.credential(user.email!, currentPassword)
      await reauthenticateWithCredential(user, credential)

      // Update password
      await updatePassword(user, newPassword)
      setSuccess("Password updated successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      if (err.code === "auth/wrong-password") {
        setError("Current password is incorrect")
      } else {
        setError(err.message || "Failed to update password")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      setError('Please type "DELETE" to confirm')
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await deleteUser(user)
      // User will be automatically signed out
    } catch (err: any) {
      if (err.code === "auth/requires-recent-login") {
        setError("Please sign out and sign in again before deleting your account")
      } else {
        setError(err.message || "Failed to delete account")
      }
      setIsLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-[90vw] max-w-2xl max-h-[85vh] bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          aria-label="Close modal"
        >
          <X className="h-5 w-5 text-white" />
        </button>

        <div className="h-full overflow-y-auto p-8">
          <h2 className="text-3xl font-bold text-white mb-6">Account Settings</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Profile Information */}
          <section className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Profile Information</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <Label htmlFor="displayName" className="text-gray-300">
                  Username
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-white/5 border-white/10 text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Profile
              </Button>
            </form>
          </section>

          {/* Change Password */}
          <section className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Change Password</h3>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="text-gray-300">
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <Label htmlFor="newPassword" className="text-gray-300">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-gray-300">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Confirm new password"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Password
              </Button>
            </form>
          </section>

          {/* Delete Account */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-4">Delete Account</h3>
            {!showDeleteConfirm ? (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Account
              </Button>
            ) : (
              <div className="space-y-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
                <div>
                  <Label htmlFor="deleteConfirm" className="text-gray-300">
                    Type "DELETE" to confirm
                  </Label>
                  <Input
                    id="deleteConfirm"
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="DELETE"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={isLoading || deleteConfirmText !== "DELETE"}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Confirm Delete
                  </Button>
                  <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="border-white/10">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
