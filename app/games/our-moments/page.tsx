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

// Add keyframe animations
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
  }
  
  .animate-slide-in {
    animation: slideIn 0.5s ease-out forwards;
  }
  
  .timeline-item {
    opacity: 0;
    animation: fadeInUp 0.6s ease-out forwards;
  }
  
  .timeline-item:nth-child(1) { animation-delay: 0.1s; }
  .timeline-item:nth-child(2) { animation-delay: 0.2s; }
  .timeline-item:nth-child(3) { animation-delay: 0.3s; }
  .timeline-item:nth-child(4) { animation-delay: 0.4s; }
  .timeline-item:nth-child(5) { animation-delay: 0.5s; }
`;

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

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const getMonthYear = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  const selectedPartnerProfile = friends.find(f => f.friend_id === selectedPartner);
  const isMyMoment = (moment: MomentWithProfiles) => moment.user_id === user?.id;

  return (
    <ProtectedRoute>
      <style>{styles}</style>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-100 py-4 md:py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <Link 
              href="/games" 
              className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent">
                Our Moments
              </h1>
              <p className="text-sm text-gray-600 mt-1">Building memories together 💕</p>
            </div>
            <div className="w-20"></div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-lg mb-6 shadow-sm animate-slide-in">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Partner Selection */}
          {friends.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center animate-fade-in-up">
              <div className="text-7xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No Friends Yet</h3>
              <p className="text-gray-600 mb-6">Add a friend to start creating beautiful moments together!</p>
              <Link 
                href="/profile" 
                className="inline-block bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                Add Friends →
              </Link>
            </div>
          ) : (
            <>
              {/* Stats Bar */}
              {selectedPartner && moments.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm animate-slide-in">
                    <p className="text-2xl font-bold text-purple-600">{moments.length}</p>
                    <p className="text-sm text-gray-600">Moments</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm animate-slide-in" style={{animationDelay: '0.1s'}}>
                    <p className="text-2xl font-bold text-pink-600">{moments.filter(m => m.partner_comment).length}</p>
                    <p className="text-sm text-gray-600">Shared</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm animate-slide-in" style={{animationDelay: '0.2s'}}>
                    <p className="text-2xl font-bold text-rose-600">💕</p>
                    <p className="text-sm text-gray-600">Together</p>
                  </div>
                </div>
              )}

              {/* Partner Selector Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 animate-fade-in-up">
                <div className="flex items-center gap-4">
                  {selectedPartner && selectedPartnerProfile && (
                    <div className="text-5xl">
                      {AVATAR_EMOJIS[selectedPartnerProfile.avatar_selection || 'avatar1']}
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Your Timeline With
                    </label>
                    <select
                      value={selectedPartner || ''}
                      onChange={(e) => setSelectedPartner(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg font-medium bg-white"
                    >
                      <option value="">Choose a partner...</option>
                      {friends.map((friend) => (
                        <option key={friend.friend_id} value={friend.friend_id}>
                          {friend.name || friend.username || 'Unknown'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {selectedPartner && (
                <>
                  {/* Floating Add Button */}
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="fixed bottom-8 right-8 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 z-40 group"
                    title="Add a moment"
                  >
                    <svg className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>

                  {/* Timeline */}
                  {loading && moments.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="inline-block">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
                      </div>
                      <p className="mt-6 text-gray-600 font-medium">Loading your moments...</p>
                    </div>
                  ) : moments.length === 0 ? (
                    <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl p-16 text-center animate-fade-in-up">
                      <div className="text-8xl mb-6">📸</div>
                      <h3 className="text-3xl font-bold text-gray-800 mb-4">Your Story Starts Here</h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                        Capture your favorite moments and build a beautiful timeline together!
                      </p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                      >
                        Create First Moment ✨
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Timeline Line */}
                      <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-300 via-purple-300 to-indigo-300"></div>
                      
                      <div className="space-y-12">
                        {moments.map((moment, index) => {
                          const isLeft = index % 2 === 0;
                          const monthYear = getMonthYear(moment.moment_date);
                          const showMonthDivider = index === 0 || monthYear !== getMonthYear(moments[index - 1].moment_date);
                          
                          return (
                            <div key={moment.id}>
                              {/* Month Divider */}
                              {showMonthDivider && (
                                <div className="flex items-center justify-center mb-8">
                                  <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full shadow-lg font-bold text-sm md:text-base">
                                    {monthYear}
                                  </div>
                                </div>
                              )}
                              
                              {/* Timeline Item */}
                              <div className={`timeline-item relative md:flex md:items-center ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                                {/* Center Dot */}
                                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2 z-10">
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg border-4 border-white"></div>
                                </div>

                                {/* Spacer */}
                                <div className="hidden md:block md:w-1/2"></div>

                                {/* Content Card */}
                                <div className={`md:w-1/2 ${isLeft ? 'md:pr-12' : 'md:pl-12'}`}>
                                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                    {/* Image */}
                                    <div className="relative w-full h-72 md:h-80 bg-gradient-to-br from-pink-100 to-purple-100 group overflow-hidden">
                                      <Image
                                        src={moment.image_url}
                                        alt={moment.caption}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        unoptimized
                                      />
                                      {/* Date Badge */}
                                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                                        <p className="text-xs font-bold text-purple-600">{getRelativeTime(moment.moment_date)}</p>
                                      </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                      {/* Header */}
                                      <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                          <div className="text-4xl">{AVATAR_EMOJIS[moment.user_profile?.avatar_selection || 'avatar1']}</div>
                                          <div>
                                            <p className="font-bold text-gray-900 text-lg">
                                              {moment.user_profile?.name || moment.user_profile?.username || 'Unknown'}
                                            </p>
                                            <p className="text-sm text-gray-500">{formatDate(moment.moment_date)}</p>
                                          </div>
                                        </div>
                                        {isMyMoment(moment) && (
                                          <button
                                            onClick={() => handleDeleteMoment(moment.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                            title="Delete moment"
                                          >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                          </button>
                                        )}
                                      </div>

                                      {/* Caption */}
                                      <p className="text-gray-700 mb-6 leading-relaxed text-base whitespace-pre-wrap">{moment.caption}</p>

                                      {/* Partner Comment */}
                                      {moment.partner_comment ? (
                                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border-l-4 border-purple-500 shadow-sm">
                                          <div className="flex items-center gap-3 mb-3">
                                            <span className="text-3xl">{AVATAR_EMOJIS[moment.partner_profile?.avatar_selection || 'avatar1']}</span>
                                            <div>
                                              <p className="font-bold text-purple-900">
                                                {moment.partner_profile?.name || moment.partner_profile?.username || 'Partner'}
                                              </p>
                                              <p className="text-xs text-purple-600">Replied</p>
                                            </div>
                                          </div>
                                          <p className="text-purple-800 whitespace-pre-wrap leading-relaxed">{moment.partner_comment}</p>
                                        </div>
                                      ) : !isMyMoment(moment) && user?.id === moment.partner_id ? (
                                        <button
                                          onClick={() => setShowCommentModal(moment.id)}
                                          className="w-full bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
                                        >
                                          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                          </svg>
                                          Share Your Thoughts
                                        </button>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* End of Timeline */}
                      <div className="flex items-center justify-center mt-16 mb-8">
                        <div className="bg-gradient-to-r from-pink-200 to-purple-200 px-6 py-3 rounded-full shadow-md">
                          <p className="text-gray-700 font-medium">✨ More moments to come ✨</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Add Moment Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
              <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Create a Moment ✨
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setNewMomentImage(null);
                      setNewMomentImagePreview(null);
                      setNewMomentCaption('');
                      setNewMomentDate(new Date().toISOString().split('T')[0]);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Image Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    📸 Photo
                  </label>
                  {newMomentImagePreview ? (
                    <div className="relative group">
                      <Image
                        src={newMomentImagePreview}
                        alt="Preview"
                        width={600}
                        height={400}
                        className="rounded-xl object-cover w-full h-80 shadow-lg"
                      />
                      <button
                        onClick={() => {
                          setNewMomentImage(null);
                          setNewMomentImagePreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-purple-300 rounded-xl p-12 text-center hover:border-purple-500 hover:bg-purple-50 transition-all group"
                    >
                      <div className="text-6xl mb-3 group-hover:scale-110 transition-transform">📷</div>
                      <p className="text-gray-600 font-medium">Click to upload a photo</p>
                      <p className="text-sm text-gray-400 mt-2">JPG, PNG or GIF (max 5MB)</p>
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
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    📅 Date
                  </label>
                  <input
                    type="date"
                    value={newMomentDate}
                    onChange={(e) => setNewMomentDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg"
                  />
                </div>

                {/* Caption */}
                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    💭 What made this moment special?
                  </label>
                  <textarea
                    value={newMomentCaption}
                    onChange={(e) => setNewMomentCaption(e.target.value)}
                    placeholder="Share your thoughts, feelings, and memories from this moment..."
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddMoment}
                    disabled={loading || !newMomentImage || !newMomentCaption.trim()}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </span>
                    ) : (
                      'Create Moment'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setNewMomentImage(null);
                      setNewMomentImagePreview(null);
                      setNewMomentCaption('');
                      setNewMomentDate(new Date().toISOString().split('T')[0]);
                    }}
                    className="px-6 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Comment Modal */}
          {showCommentModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Share Your Thoughts 💬</h3>
                <p className="text-gray-600 mb-6 text-sm">Let your partner know how this moment made you feel</p>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="This moment reminds me of..."
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-6 resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAddComment(showCommentModal)}
                    disabled={loading || !commentText.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? 'Adding...' : 'Add Comment'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCommentModal(null);
                      setCommentText('');
                    }}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-semibold"
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

