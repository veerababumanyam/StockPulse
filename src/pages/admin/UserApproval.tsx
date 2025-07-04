import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import apiClient from "@config/api";
import { PageLayout, Card, Alert } from "../../components/layout/PageLayout";

interface PendingUser {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  status: string;
}

const UserApproval: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingUser, setProcessingUser] = useState<string | null>(null);

  // Fetch pending users
  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/auth/admin/pending-users");
      setPendingUsers(response.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch pending users");
      console.error("Failed to fetch pending users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Approve user
  const approveUser = async (userId: string, email: string) => {
    try {
      setProcessingUser(userId);
      await apiClient.post("/auth/admin/approve-user", {
        user_id: userId,
        action: "approve",
      });

      // Remove from pending list
      setPendingUsers((prev) => prev.filter((user) => user.id !== userId));

      console.log(`✅ User ${email} approved successfully`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to approve user");
      console.error("Failed to approve user:", err);
    } finally {
      setProcessingUser(null);
    }
  };

  // Reject user
  const rejectUser = async (userId: string, email: string, reason: string) => {
    try {
      setProcessingUser(userId);
      await apiClient.post("/auth/admin/approve-user", {
        user_id: userId,
        action: "reject",
        rejection_reason: reason,
      });

      // Remove from pending list
      setPendingUsers((prev) => prev.filter((user) => user.id !== userId));

      console.log(`❌ User ${email} rejected successfully`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to reject user");
      console.error("Failed to reject user:", err);
    } finally {
      setProcessingUser(null);
    }
  };

  // Handle rejection with reason
  const handleReject = (userId: string, email: string) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason && reason.trim()) {
      rejectUser(userId, email, reason.trim());
    }
  };

  // Filter users based on search term
  const filteredUsers = pendingUsers.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return (
    <PageLayout
      title="User Approval"
      subtitle="Manage pending user registrations"
      headerActions={
        <button
          onClick={fetchPendingUsers}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      }
    >
      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Alert variant="error">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
              {error}
            </div>
          </Alert>
        </motion.div>
      )}

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text/40" />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-text placeholder:text-text/60 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center space-x-2 text-sm text-text/60">
            <Clock className="w-4 h-4" />
            <span>
              {filteredUsers.length} pending approval
              {filteredUsers.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </Card>

      {/* Pending Users List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="text-center py-12">
          <Users className="w-12 h-12 text-text/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text mb-2">
            No pending users
          </h3>
          <p className="text-text/60">
            {searchTerm
              ? "No users match your search criteria."
              : "All user registrations have been processed."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card hover>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-text/20 to-text/40 rounded-full flex items-center justify-center">
                        <span className="text-text font-semibold text-sm">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text">
                          {user.email}
                        </h3>
                        {user.name && (
                          <p className="text-sm text-text/60">{user.name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-text/60 space-x-4">
                      <span>
                        Registered:{" "}
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {user.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => approveUser(user.id, user.email)}
                      disabled={processingUser === user.id}
                      className="flex items-center space-x-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>

                    <button
                      onClick={() => handleReject(user.id, user.email)}
                      disabled={processingUser === user.id}
                      className="flex items-center space-x-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/80 disabled:opacity-50 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default UserApproval;
