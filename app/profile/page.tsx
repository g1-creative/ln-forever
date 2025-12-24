'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getSupabaseClient } from '@/lib/supabase/client';
import { 
  getFriends, 
  getFriendRequests, 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  removeFriend,
  searchUsersByUsername,
  FriendWithProfile,
  FriendRequestWithProfile
} from '@/lib/db/friends';
import { UserIcon } from '@/components/Icons';
import Image from 'next/image';
import Link from 'next/link';

// Avatar options - using emoji for now, can be replaced with images
const AVATAR_OPTIONS = [
  { id: 'avatar1', emoji: '👤', name: 'Default' },
  { id: 'avatar2', emoji: '😊', name: 'Happy' },
  { id: 'avatar3', emoji: '😎', name: 'Cool' },
  { id: 'avatar4', emoji: '🤩', name: 'Star' },
  { id: 'avatar5', emoji: '😍', name: 'Love' },
  { id: 'avatar6', emoji: '🥰', name: 'Adore' },
  { id: 'avatar7', emoji: '😇', name: 'Angel' },
  { id: 'avatar8', emoji: '🤗', name: 'Hug' },
  { id: 'avatar9', emoji: '😋', name: 'Yum' },
  { id: 'avatar10', emoji: '🤓', name: 'Nerd' },
  { id: 'avatar11', emoji: '🧐', name: 'Thinking' },
  { id: 'avatar12', emoji: '😌', name: 'Peaceful' },
];

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Friends state
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<{ sent: FriendRequestWithProfile[]; received: FriendRequestWithProfile[] }>({ sent: [], received: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'friends'>('profile');
  const [loadingFriends, setLoadingFriends] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setSelectedAvatar(profile.avatar_selection || 'avatar1');
    }
  }, [profile]);

  useEffect(() => {
    if (activeTab === 'friends' && user) {
      loadFriends();
    }
  }, [activeTab, user]);

  const loadFriends = async () => {
    setLoadingFriends(true);
    try {
      const [friendsData, requestsData] = await Promise.all([
        getFriends(),
        getFriendRequests(),
      ]);
      setFriends(friendsData);
      setFriendRequests(requestsData);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Validate username
      if (username && username.length < 3) {
        setSaveMessage('Username must be at least 3 characters');
        setIsSaving(false);
        return;
      }

      // Check username uniqueness if changed
      if (username && username !== profile?.username) {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data: existing } = await (supabase
            .from('profiles') as any)
            .select('id')
            .eq('username', username)
            .neq('id', user.id)
            .single();
          
          if (existing) {
            setSaveMessage('Username already taken');
            setIsSaving(false);
            return;
          }
        }
      }

      await updateProfile({
        username: username || null,
        bio: bio || null,
        avatar_selection: selectedAvatar,
      });
      
      setSaveMessage('Profile updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error: any) {
      setSaveMessage(error.message || 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await searchUsersByUsername(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    try {
      await sendFriendRequest(userId);
      await loadFriends();
      setSearchQuery('');
      setSearchResults([]);
    } catch (error: any) {
      alert(error.message || 'Error sending friend request');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      await loadFriends();
    } catch (error: any) {
      alert(error.message || 'Error accepting request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      await loadFriends();
    } catch (error: any) {
      alert(error.message || 'Error rejecting request');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;
    
    try {
      await removeFriend(friendId);
      await loadFriends();
    } catch (error: any) {
      alert(error.message || 'Error removing friend');
    }
  };

  const getAvatarEmoji = (avatarId: string) => {
    return AVATAR_OPTIONS.find(a => a.id === avatarId)?.emoji || '👤';
  };

  return (
    <ProtectedRoute>
      <div className="container">
        <div className="page-header">
          <Link href="/dashboard" className="back-link">
            ← Back to Dashboard
          </Link>
          <Image 
            src="/images/ln_logo_favicon.png" 
            alt="LN Forever" 
            width={64} 
            height={64}
            className="page-header-logo"
          />
          <h1>My Profile</h1>
          <p>Customize your profile and manage your friends</p>
        </div>

        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Settings
          </button>
          <button
            className={`profile-tab ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            Friends
            {friendRequests.received.length > 0 && (
              <span className="tab-badge">{friendRequests.received.length}</span>
            )}
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="section">
            <div className="profile-avatar-section">
              <h3 className="section-subtitle">Avatar</h3>
              <div className="avatar-preview">
                <div className="avatar-display">
                  {getAvatarEmoji(selectedAvatar)}
                </div>
                <p className="avatar-name">
                  {AVATAR_OPTIONS.find(a => a.id === selectedAvatar)?.name}
                </p>
              </div>
              <div className="avatar-grid">
                {AVATAR_OPTIONS.map((avatar) => (
                  <button
                    key={avatar.id}
                    className={`avatar-option ${selectedAvatar === avatar.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAvatar(avatar.id)}
                    title={avatar.name}
                  >
                    {avatar.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="profile-form-section">
              <h3 className="section-subtitle">Username</h3>
              <input
                type="text"
                className="profile-input"
                placeholder="Choose a unique username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={30}
              />
              <p className="input-hint">
                Your username will be visible to other users. Must be at least 3 characters.
              </p>
            </div>

            <div className="profile-form-section">
              <h3 className="section-subtitle">Bio</h3>
              <textarea
                className="profile-textarea"
                placeholder="Tell others about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={200}
                rows={4}
              />
              <p className="input-hint">
                {bio.length}/200 characters
              </p>
            </div>

            {saveMessage && (
              <div className={`save-message ${saveMessage.includes('Error') ? 'error' : 'success'}`}>
                {saveMessage}
              </div>
            )}

            <button
              className="spin-button"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="friends-section">
            {/* Search Users */}
            <div className="section">
              <h3 className="section-subtitle">Add Friends</h3>
              <div className="search-users">
                <input
                  type="text"
                  className="profile-input"
                  placeholder="Search by username..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearchUsers(e.target.value);
                  }}
                />
                {searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map((user) => (
                      <div key={user.id} className="search-result-item">
                        <div className="result-avatar">
                          {getAvatarEmoji(user.avatar_selection || 'avatar1')}
                        </div>
                        <div className="result-info">
                          <div className="result-username">{user.username || 'No username'}</div>
                          <div className="result-name">{user.name || user.id.slice(0, 8)}</div>
                        </div>
                        <button
                          className="action-btn"
                          onClick={() => handleSendFriendRequest(user.id)}
                        >
                          Add Friend
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Friend Requests */}
            {friendRequests.received.length > 0 && (
              <div className="section">
                <h3 className="section-subtitle">Friend Requests</h3>
                {loadingFriends ? (
                  <div className="loading-text">Loading...</div>
                ) : (
                  <div className="friends-list">
                    {friendRequests.received.map((request) => (
                      <div key={request.id} className="friend-item">
                        <div className="friend-avatar">
                          {getAvatarEmoji(request.sender_profile?.avatar_selection || 'avatar1')}
                        </div>
                        <div className="friend-info">
                          <div className="friend-username">
                            {request.sender_profile?.username || 'No username'}
                          </div>
                          <div className="friend-name">
                            {request.sender_profile?.name || request.sender_id.slice(0, 8)}
                          </div>
                        </div>
                        <div className="friend-actions">
                          <button
                            className="action-btn"
                            onClick={() => handleAcceptRequest(request.id)}
                          >
                            Accept
                          </button>
                          <button
                            className="action-btn secondary"
                            onClick={() => handleRejectRequest(request.id)}
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Friends List */}
            <div className="section">
              <h3 className="section-subtitle">My Friends ({friends.length})</h3>
              {loadingFriends ? (
                <div className="loading-text">Loading...</div>
              ) : friends.length === 0 ? (
                <div className="empty-state">
                  <p>No friends yet. Search for users above to add friends!</p>
                </div>
              ) : (
                <div className="friends-list">
                  {friends.map((friend) => (
                    <div key={friend.id} className="friend-item">
                      <div className="friend-avatar">
                        {getAvatarEmoji(friend.avatar_selection || 'avatar1')}
                      </div>
                      <div className="friend-info">
                        <div className="friend-username">
                          {friend.username || 'No username'}
                        </div>
                        <div className="friend-name">
                          {friend.name || friend.friend_id.slice(0, 8)}
                        </div>
                        <div className="friend-date">
                          Friends since {new Date(friend.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        className="action-btn secondary"
                        onClick={() => handleRemoveFriend(friend.friend_id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

