import React, { useState, useEffect } from 'react';
import { Heart, Users, MessageSquare, Settings, Plus, X, Upload, LogOut, Camera } from 'lucide-react';
import './App.css';

/**
 * ============================================
 * BOSCONIANS - MAIN APP COMPONENT
 * ============================================
 * School Friends & Community App
 * Don Bosco Higher Secondary School, Diphu
 */

export default function App() {
  // ============ STATE MANAGEMENT ============
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', phone: '', password: '' });
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState({});
  const [messageText, setMessageText] = useState('');
  const [profiles, setProfiles] = useState({});
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [viewingUserId, setViewingUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('friends');
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);

  // ============ INITIALIZATION ============
  useEffect(() => {
    loadAllData();
  }, []);

  // ============ STORAGE FUNCTIONS ============
  const loadAllData = async () => {
    try {
      const userData = await window.storage?.get('bosconians:users') || null;
      if (userData?.value) {
        const users = JSON.parse(userData.value);
        setCurrentUser(users[0]);
        setFriends(users);
      }

      if (currentUser?.id) {
        const msgData = await window.storage?.get(`messages:${currentUser.id}`) || null;
        if (msgData?.value) setMessages(JSON.parse(msgData.value));

        const grpData = await window.storage?.get(`groups:${currentUser.id}`) || null;
        if (grpData?.value) setGroups(JSON.parse(grpData.value));
      }

      const profileData = await window.storage?.get('bosconians:profiles') || null;
      if (profileData?.value) setProfiles(JSON.parse(profileData.value));
    } catch (error) {
      console.log('First load - initializing...');
    }
  };

  // ============ AUTHENTICATION ============
  const handleRegisterLogin = async () => {
    if (!loginForm.email || !loginForm.phone || !loginForm.password) {
      alert('Sab fields fill karo! 📝');
      return;
    }

    const newUser = {
      id: Date.now(),
      email: loginForm.email,
      phone: loginForm.phone,
      password: loginForm.password,
      class: '11th',
      joinedDate: new Date().toLocaleDateString(),
      profilePic: null
    };

    try {
      const userData = await window.storage?.get('bosconians:users') || null;
      const users = userData?.value ? JSON.parse(userData.value) : [];
      users.push(newUser);
      await window.storage?.set('bosconians:users', JSON.stringify(users));

      setCurrentUser(newUser);
      setFriends(users);
      setShowLogin(false);
      setLoginForm({ email: '', phone: '', password: '' });

      const newProfile = {
        bio: '🎓 BOSCONIAN 🎓',
        photos: [],
        reels: [],
        followers: [],
        profilePic: null
      };
      const updatedProfiles = { ...profiles, [newUser.id]: newProfile };
      await window.storage?.set('bosconians:profiles', JSON.stringify(updatedProfiles));
      setProfiles(updatedProfiles);
    } catch (error) {
      alert('Registration error!');
    }
  };

  // ============ FRIENDS MANAGEMENT ============
  const handleAddFriend = async () => {
    const email = prompt('Friend ka email dalo:');
    if (!email) return;

    const newFriend = {
      id: Date.now(),
      email: email,
      phone: '+91 XXXXXXXXXX',
      class: '11th',
      joinedDate: new Date().toLocaleDateString(),
      profilePic: null
    };

    try {
      const userData = await window.storage?.get('bosconians:users') || null;
      const users = userData?.value ? JSON.parse(userData.value) : [];
      users.push(newFriend);
      await window.storage?.set('bosconians:users', JSON.stringify(users));
      setFriends(users);

      const newProfile = {
        bio: '🎓 BOSCONIAN 🎓',
        photos: [],
        reels: [],
        followers: [],
        profilePic: null
      };
      const updatedProfiles = { ...profiles, [newFriend.id]: newProfile };
      await window.storage?.set('bosconians:profiles', JSON.stringify(updatedProfiles));
      setProfiles(updatedProfiles);
    } catch (error) {
      alert('Error adding friend!');
    }
  };

  // ============ GROUP MANAGEMENT ============
  const handleCreateGroup = async () => {
    if (!newGroupName) return;

    const newGroup = {
      id: Date.now(),
      name: newGroupName,
      createdBy: currentUser.id,
      members: [currentUser.id],
      admins: [currentUser.id],
      createdDate: new Date().toLocaleDateString()
    };

    try {
      const grpData = await window.storage?.get(`groups:${currentUser.id}`) || null;
      const grps = grpData?.value ? JSON.parse(grpData.value) : [];
      grps.push(newGroup);
      await window.storage?.set(`groups:${currentUser.id}`, JSON.stringify(grps));
      setGroups([...groups, newGroup]);
      setNewGroupName('');
      setShowGroupModal(false);
    } catch (error) {
      alert('Error creating group!');
    }
  };

  // ============ MESSAGING ============
  const handleSendMessage = async () => {
    if (!messageText.trim() || (!selectedFriend && !selectedGroup)) return;

    const newMessage = {
      id: Date.now(),
      sender: currentUser.email,
      senderId: currentUser.id,
      text: messageText,
      timestamp: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString()
    };

    try {
      const chatKey = selectedFriend 
        ? `chat:${currentUser.id}-${selectedFriend.id}` 
        : `group:${selectedGroup.id}`;
      
      const msgData = await window.storage?.get(chatKey) || null;
      const chatMessages = msgData?.value ? JSON.parse(msgData.value) : [];
      chatMessages.push(newMessage);
      await window.storage?.set(chatKey, JSON.stringify(chatMessages));
      
      setMessages(prev => ({
        ...prev,
        [chatKey]: chatMessages
      }));
      setMessageText('');
    } catch (error) {
      alert('Error sending message!');
    }
  };

  // ============ MEDIA UPLOAD ============
  const handleUploadMedia = async (file, type) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result;

      try {
        const userProfile = profiles[currentUser.id] || {
          bio: '🎓 BOSCONIAN 🎓',
          photos: [],
          reels: [],
          followers: [],
          profilePic: null
        };

        const mediaItem = {
          id: Date.now(),
          data: base64,
          uploadedDate: new Date().toLocaleDateString(),
          likes: 0
        };

        if (type === 'photo') {
          userProfile.photos.push(mediaItem);
        } else if (type === 'reel') {
          userProfile.reels.push(mediaItem);
        } else if (type === 'profilepic') {
          userProfile.profilePic = base64;
        }

        const updatedProfiles = { ...profiles, [currentUser.id]: userProfile };
        await window.storage?.set('bosconians:profiles', JSON.stringify(updatedProfiles));
        setProfiles(updatedProfiles);
        alert('✅ Media uploaded!');
      } catch (error) {
        alert('Error uploading!');
      }
    };
    reader.readAsDataURL(file);
  };

  // ============ HELPERS ============
  const getMessagesWithFriend = (friendId) => {
    const chatKey = `chat:${currentUser.id}-${friendId}`;
    return messages[chatKey] || [];
  };

  const getGroupMessages = (groupId) => {
    const chatKey = `group:${groupId}`;
    return messages[chatKey] || [];
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowLogin(true);
    setFriends([]);
    setMessages({});
    setSelectedFriend(null);
  };

  // ============ LOGIN SCREEN ============
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-5xl font-bold text-center mb-2 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            🎓 BOSCONIANS
          </h1>
          <p className="text-center text-gray-600 mb-2 text-sm">Don Bosco Higher Secondary School, Diphu</p>
          <p className="text-center text-gray-500 mb-8 border-t pt-2">School Friends & Community App</p>
          
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email (example@gmail.com)"
              value={loginForm.email}
              onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none transition"
            />
            <input
              type="tel"
              placeholder="Phone (+91 XXXXXXXXXX)"
              value={loginForm.phone}
              onChange={(e) => setLoginForm({...loginForm, phone: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none transition"
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none transition"
            />
            <button
              onClick={handleRegisterLogin}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition transform hover:scale-105"
            >
              Sign In / Register
            </button>
          </div>

          <div className="mt-6 p-4 bg-red-50 rounded-lg border-l-4 border-red-600">
            <p className="text-sm text-gray-700">
              <strong>Demo:</strong> Koi bhi email/phone daal de! 😊
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============ MAIN APP ============
  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4 shadow-lg sticky top-0 z-40">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold">🎓 BOSCONIANS</h1>
            <p className="text-orange-100 text-xs">Don Bosco Higher Secondary, Diphu</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setViewingUserId(currentUser.id);
                setShowProfileModal(true);
              }}
              className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition flex items-center gap-2"
            >
              <Camera size={20} /> Profile
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition flex items-center gap-2"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden gap-4 p-4 max-w-6xl mx-auto w-full">
        {/* Sidebar */}
        <div className="w-80 bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 py-3 font-bold transition ${activeTab === 'friends' ? 'bg-red-50 border-b-4 border-red-600 text-red-600' : 'text-gray-600'}`}
            >
              <Users size={20} className="inline mr-2" /> Friends
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex-1 py-3 font-bold transition ${activeTab === 'groups' ? 'bg-red-50 border-b-4 border-red-600 text-red-600' : 'text-gray-600'}`}
            >
              <MessageSquare size={20} className="inline mr-2" /> Groups
            </button>
          </div>

          {/* Friends List */}
          {activeTab === 'friends' && (
            <div className="flex-1 overflow-y-auto">
              <button
                onClick={handleAddFriend}
                className="w-full p-3 bg-red-500 text-white font-bold hover:bg-red-600 transition m-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Add Friend
              </button>
              <div className="space-y-2 p-2">
                {friends.map((friend) => (
                  <div key={friend.id} className="bg-gray-50 rounded-lg p-2">
                    <button
                      onClick={() => {
                        setSelectedFriend(friend);
                        setSelectedGroup(null);
                      }}
                      className={`w-full text-left p-2 rounded transition ${selectedFriend?.id === friend.id ? 'bg-red-200' : 'hover:bg-gray-100'}`}
                    >
                      <p className="font-bold text-sm">{friend.email}</p>
                      <p className="text-xs text-gray-500">{friend.phone}</p>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Groups List */}
          {activeTab === 'groups' && (
            <div className="flex-1 overflow-y-auto">
              <button
                onClick={() => setShowGroupModal(true)}
                className="w-full p-3 bg-red-500 text-white font-bold hover:bg-red-600 transition m-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Plus size={20} /> New Group
              </button>
              <div className="space-y-2 p-2">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => {
                      setSelectedGroup(group);
                      setSelectedFriend(null);
                    }}
                    className={`w-full text-left p-3 rounded transition ${selectedGroup?.id === group.id ? 'bg-red-200' : 'bg-gray-50 hover:bg-gray-100'}`}
                  >
                    <p className="font-bold text-sm">{group.name}</p>
                    <p className="text-xs text-gray-500">{group.members.length} members</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
          {selectedFriend || selectedGroup ? (
            <>
              <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-b">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedFriend?.email || selectedGroup?.name}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {(selectedFriend ? getMessagesWithFriend(selectedFriend.id) : getGroupMessages(selectedGroup.id)).length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <p>No messages yet! 💬</p>
                  </div>
                ) : (
                  (selectedFriend ? getMessagesWithFriend(selectedFriend.id) : getGroupMessages(selectedGroup.id)).map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          msg.senderId === currentUser.id
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-300 text-gray-900'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 bg-white border-t flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p>Select a friend or group! 👈</p>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-4">
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-red-50 to-orange-50">
              <h3 className="text-2xl font-bold text-red-600">My Profile</h3>
              <button onClick={() => setShowProfileModal(false)} className="text-gray-500">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gradient-to-r from-red-100 to-orange-100 p-4 rounded-lg">
                <p className="font-bold text-lg">{currentUser?.email}</p>
                <p className="text-gray-700">{currentUser?.phone}</p>
                <p className="text-sm text-gray-600 mt-2">{profiles[currentUser?.id]?.bio}</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadMedia(e.target.files?.[0], 'profilepic')}
                    className="hidden"
                  />
                  <div className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-center font-bold">
                    📸 Profile Pic
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadMedia(e.target.files?.[0], 'photo')}
                    className="hidden"
                  />
                  <div className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-center font-bold">
                    🖼️ Add Photo
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => handleUploadMedia(e.target.files?.[0], 'reel')}
                    className="hidden"
                  />
                  <div className="p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-center font-bold">
                    🎬 Add Reel
                  </div>
                </label>
              </div>

              {profiles[currentUser?.id]?.photos.length > 0 && (
                <div>
                  <h4 className="font-bold mb-2">Photos:</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {profiles[currentUser?.id]?.photos.map((photo) => (
                      <img
                        key={photo.id}
                        src={photo.data}
                        alt="gallery"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-red-600">Create Group</h3>
              <button onClick={() => setShowGroupModal(false)}>
                <X size={24} />
              </button>
            </div>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group name..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 focus:border-red-500 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateGroup}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition"
              >
                Create
              </button>
              <button
                onClick={() => setShowGroupModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
