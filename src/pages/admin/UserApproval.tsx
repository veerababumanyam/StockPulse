import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Search,
  Filter,
  RefreshCw 
} from 'lucide-react';
import apiClient from '@config/api';

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
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingUser, setProcessingUser] = useState<string | null>(null);

  // Fetch pending users
  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/auth/admin/pending-users');
      setPendingUsers(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch pending users');
      console.error('Failed to fetch pending users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Approve user
  const approveUser = async (userId: string, email: string) => {
    try {
      setProcessingUser(userId);
      await apiClient.post('/auth/admin/approve-user', {
        user_id: userId,
        action: 'approve'
      });
      
      // Remove from pending list
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      
      console.log(`✅ User ${email} approved successfully`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to approve user');
      console.error('Failed to approve user:', err);
    } finally {
      setProcessingUser(null);
    }
  };

  // Reject user
  const rejectUser = async (userId: string, email: string, reason: string) => {
    try {
      setProcessingUser(userId);
      await apiClient.post('/auth/admin/approve-user', {
        user_id: userId,
        action: 'reject',
        rejection_reason: reason
      });
      
      // Remove from pending list
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      
      console.log(`❌ User ${email} rejected successfully`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reject user');
      console.error('Failed to reject user:', err);
    } finally {
      setProcessingUser(null);
    }
  };

  // Handle rejection with reason
  const handleReject = (userId: string, email: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason && reason.trim()) {
      rejectUser(userId, email, reason.trim());
    }
  };

  // Filter users based on search term
  const filteredUsers = pendingUsers.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text">User Approval</h1>
                <p className="text-text/60">Manage pending user registrations</p>
              </div>
            </div>
            
            <button
              onClick={fetchPendingUsers}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg"
          >
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
              {error}
            </div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text/40" />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-text placeholder:text-text/60 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-text/60">
            <Clock className="w-4 h-4" />
            <span>{filteredUsers.length} pending approval{filteredUsers.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Pending Users List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-text/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text mb-2">No pending users</h3>
            <p className="text-text/60">
              {searchTerm ? 'No users match your search criteria.' : 'All user registrations have been processed.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text">{user.email}</h3>
                        {user.name && (
                          <p className="text-sm text-text/60">{user.name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-text/60">
                      <span>Registered: {new Date(user.created_at).toLocaleDateString()}</span>
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
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    
                    <button
                      onClick={() => handleReject(user.id, user.email)}
                      disabled={processingUser === user.id}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserApproval; 