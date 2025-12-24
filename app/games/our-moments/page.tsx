'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { getFriends } from '@/lib/db/friends';
import {
  createMoment,
  getMoments,
  addPartnerComment,
  deleteMoment,
  uploadMomentImage,
  MomentWithProfiles,
} from '@/lib/db/moments';
import { getSupabaseClient } from '@/lib/supabase/client';

const AVATAR_EMOJIS: Record<string, string> = {
  avatar1: '👤',
  avatar2: '😊',
  avatar3: '😎',
  avatar4: '🤩',
  avatar5: '😍',
  avatar6: '🥰',
  avatar7: '😇',
  avatar8: '🤗',
  avatar9: '😋',
  avatar10: '🤓',
  avatar11: '🧐',
  avatar12: '😌',
};

export default function OurMomentsPage() {
  const { user, profile } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [moments, setMoments] = useState<MomentWithProfiles[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  
  // Add moment form state
  const [newMomentImage, setNewMomentImage] = useState<File | null>(null);
  const [newMomentImagePreview, setNewMomentImagePreview] = useState<string | null>(null);
  const [newMomentCaption, setNewMomentCaption] = useState('');
  const [newMomentDate, setNewMomentDate] = useState(new Date().toISOString().split('T')[0]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = getSupabaseClient();

  // Load friends on mount
  useEffect(() => {
    if (!user) return;
    loadFriends();
  }, [user]);

  // Load moments when partner is selected
  useEffect(() => {
    if (selectedPartner) {
      loadMoments();
      subscribeToMoments();
    }
    return () => {
      if (supabase && selectedPartner) {
        supabase.removeAllChannels();
      }
    };
  }, [selectedPartner]);

  const loadFriends = async () => {
    if (!user) return;
    try {
      const friendsList = await getFriends();
      setFriends(friendsList);
      // Auto-select first friend if available
      if (friendsList.length > 0 && !selectedPartner) {
        setSelectedPartner(friendsList[0].friend_id);
      }
    } catch (err: any) {
      console.error('Failed to load friends:', err);
      setError('Failed to load friends');
    }
  };

  const loadMoments = async () => {
    if (!selectedPartner) return;
    setLoading(true);
    setError(null);
    try {
      const momentsList = await getMoments(selectedPartner);
      setMoments(momentsList);
    } catch (err: any) {
      console.error('Failed to load moments:', err);
      setError(err.message || 'Failed to load moments');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMoments = () => {
    if (!supabase || !selectedPartner || !user) return;

    const channel = supabase
      .channel(`moments-${selectedPartner}-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'moments',
          filter: `or(user_id.eq.${user.id},partner_id.eq.${user.id})`,
        },
        () => {
          loadMoments();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setNewMomentImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewMomentImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddMoment = async () => {
    if (!selectedPartner || !newMomentImage || !newMomentCaption.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Upload image
      const imageUrl = await uploadMomentImage(newMomentImage);
      
      // Create moment
      await createMoment(selectedPartner, imageUrl, newMomentCaption.trim(), newMomentDate);
      
      // Reset form
      setNewMomentImage(null);
      setNewMomentImagePreview(null);
      setNewMomentCaption('');
      setNewMomentDate(new Date().toISOString().split('T')[0]);
      setShowAddModal(false);
      
      // Reload moments
      await loadMoments();
    } catch (err: any) {
      console.error('Failed to add moment:', err);
      setError(err.message || 'Failed to add moment');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (momentId: string) => {
    if (!commentText.trim()) {
      setError('Please enter a comment');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await addPartnerComment(momentId, commentText.trim());
      setCommentText('');
      setShowCommentModal(null);
      await loadMoments();
    } catch (err: any) {
      console.error('Failed to add comment:', err);
      setError(err.message || 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMoment = async (momentId: string) => {
    if (!confirm('Are you sure you want to delete this moment?')) return;

    setLoading(true);
    setError(null);
    try {
      await deleteMoment(momentId);
      await loadMoments();
    } catch (err: any) {
      console.error('Failed to delete moment:', err);
      setError(err.message || 'Failed to delete moment');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const selectedPartnerProfile = friends.find(f => f.friend_id === selectedPartner);
  const isMyMoment = (moment: MomentWithProfiles) => moment.user_id === user?.id;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/games" className="text-gray-700 hover:text-purple-600 transition">
              ← Back to Games
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Our Moments 💕
            </h1>
            <div className="w-24"></div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Partner Selection */}
          {friends.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <p className="text-gray-600 mb-4">You need to add a friend first to create moments together.</p>
              <Link href="/profile" className="text-purple-600 hover:text-purple-700 font-semibold">
                Go to Profile →
              </Link>
            </div>
          ) : (
            <>
              {/* Partner Selector */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Partner
                </label>
                <select
                  value={selectedPartner || ''}
                  onChange={(e) => setSelectedPartner(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Choose a partner...</option>
                  {friends.map((friend) => (
                    <option key={friend.friend_id} value={friend.friend_id}>
                      {AVATAR_EMOJIS[friend.avatar_selection || 'avatar1']} {friend.name || friend.username || 'Unknown'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPartner && (
                <>
                  {/* Add Moment Button */}
                  <div className="mb-6">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition shadow-lg hover:shadow-xl"
                    >
                      + Add a Moment 📸
                    </button>
                  </div>

                  {/* Timeline */}
                  {loading && moments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                      <p className="mt-4 text-gray-600">Loading moments...</p>
                    </div>
                  ) : moments.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                      <div className="text-6xl mb-4">📸</div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">No moments yet</h3>
                      <p className="text-gray-600 mb-6">
                        Start building your timeline by adding your first moment together!
                      </p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition"
                      >
                        Add First Moment
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {moments.map((moment) => (
                        <div
                          key={moment.id}
                          className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
                        >
                          {/* Image */}
                          <div className="relative w-full h-64 md:h-96 bg-gray-100">
                            <Image
                              src={moment.image_url}
                              alt={moment.caption}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>

                          {/* Content */}
                          <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">
                                  {AVATAR_EMOJIS[moment.user_profile?.avatar_selection || 'avatar1']}
                                </span>
                                <div>
                                  <p className="font-bold text-gray-800">
                                    {moment.user_profile?.name || moment.user_profile?.username || 'Unknown'}
                                  </p>
                                  <p className="text-sm text-gray-500">{formatDate(moment.moment_date)}</p>
                                </div>
                              </div>
                              {isMyMoment(moment) && (
                                <button
                                  onClick={() => handleDeleteMoment(moment.id)}
                                  className="text-red-500 hover:text-red-700 transition"
                                  title="Delete moment"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>

                            {/* Caption */}
                            <p className="text-gray-700 mb-4 whitespace-pre-wrap">{moment.caption}</p>

                            {/* Partner Comment */}
                            {moment.partner_comment ? (
                              <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-2xl">
                                    {AVATAR_EMOJIS[moment.partner_profile?.avatar_selection || 'avatar1']}
                                  </span>
                                  <p className="font-semibold text-purple-800">
                                    {moment.partner_profile?.name || moment.partner_profile?.username || 'Partner'}
                                  </p>
                                </div>
                                <p className="text-purple-700 whitespace-pre-wrap">{moment.partner_comment}</p>
                              </div>
                            ) : !isMyMoment(moment) && user?.id === moment.partner_id ? (
                              <button
                                onClick={() => setShowCommentModal(moment.id)}
                                className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold py-2 px-4 rounded-lg transition"
                              >
                                💬 Add Your Comment
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Add Moment Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Add a Moment 📸</h3>

                {/* Image Upload */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Photo
                  </label>
                  {newMomentImagePreview ? (
                    <div className="relative">
                      <Image
                        src={newMomentImagePreview}
                        alt="Preview"
                        width={400}
                        height={300}
                        className="rounded-lg object-cover w-full h-64"
                      />
                      <button
                        onClick={() => {
                          setNewMomentImage(null);
                          setNewMomentImagePreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition"
                    >
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-gray-600">Click to upload photo</p>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>

                {/* Date */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newMomentDate}
                    onChange={(e) => setNewMomentDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Caption */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Caption
                  </label>
                  <textarea
                    value={newMomentCaption}
                    onChange={(e) => setNewMomentCaption(e.target.value)}
                    placeholder="Why was this moment special? What do you remember most?"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddMoment}
                    disabled={loading || !newMomentImage || !newMomentCaption.trim()}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Adding...' : 'Add Moment'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setNewMomentImage(null);
                      setNewMomentImagePreview(null);
                      setNewMomentCaption('');
                      setNewMomentDate(new Date().toISOString().split('T')[0]);
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Comment Modal */}
          {showCommentModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-md w-full">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Add Your Comment 💬</h3>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="What did you feel? What do you remember?"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAddComment(showCommentModal)}
                    disabled={loading || !commentText.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Adding...' : 'Add Comment'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCommentModal(null);
                      setCommentText('');
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

