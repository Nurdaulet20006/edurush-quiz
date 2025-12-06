import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DatabaseService } from '../services/mockDatabase';
import { User, FriendRequest } from '../types';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Search, Swords, UserPlus, Check, X, Clock } from 'lucide-react';
import { useToast } from '../context/ToastContext';

// --- Duel Modal Component ---
const DuelModal: React.FC<{
  opponent: User;
  currentUser: User;
  onClose: () => void;
  onStart: (subjectId: string, count: number) => void;
}> = ({ opponent, currentUser, onClose, onStart }) => {
  const allSubjects = DatabaseService.getSubjects();
  // Find mutual subjects
  const mutualSubjects = allSubjects.filter(
    s => currentUser.enrolledSubjects.includes(s.id) && opponent.enrolledSubjects.includes(s.id)
  );
  
  const [selectedSubject, setSelectedSubject] = useState<string>(mutualSubjects[0]?.id || '');
  const [questionCount, setQuestionCount] = useState<number>(5);

  const handleStart = () => {
    if (selectedSubject) {
      onStart(selectedSubject, questionCount);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl p-6 border dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-xl font-bold flex items-center gap-2">
             <Swords className="w-6 h-6 text-orange-500" />
             Duel {opponent.username}
           </h2>
           <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
             <X className="w-5 h-5" />
           </button>
        </div>

        {mutualSubjects.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500">You don't have any subjects in common.</p>
          </div>
        ) : (
          <div className="space-y-6">
             <div>
                <label className="block text-sm font-bold text-gray-500 uppercase mb-2">Select Mutual Subject</label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                    {mutualSubjects.map(sub => (
                       <button
                         key={sub.id}
                         onClick={() => setSelectedSubject(sub.id)}
                         className={`p-3 rounded-xl border text-left transition-all ${
                             selectedSubject === sub.id 
                             ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 ring-1 ring-primary-500' 
                             : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                         }`}
                       >
                         {sub.name}
                       </button>
                    ))}
                </div>
             </div>

             <div>
                <label className="block text-sm font-bold text-gray-500 uppercase mb-2">Question Count</label>
                <div className="flex gap-2 justify-between">
                    {[5, 10, 15, 20].map(count => (
                        <button
                           key={count}
                           onClick={() => setQuestionCount(count)}
                           className={`flex-1 py-2 rounded-lg font-bold border transition-all ${
                               questionCount === count 
                               ? 'bg-primary-600 text-white border-primary-600' 
                               : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                           }`}
                        >
                           {count}
                        </button>
                    ))}
                </div>
             </div>

             <button 
                onClick={handleStart}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-transform"
             >
                Send Challenge
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const Friends: React.FC = () => {
  const { user, pendingRequests, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'my_friends' | 'requests'>('my_friends');
  const [friends, setFriends] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [duelTarget, setDuelTarget] = useState<User | null>(null);
  
  // Also check for incoming duels in the Requests tab
  const [incomingDuels, setIncomingDuels] = useState<any[]>([]);

  // Invite Waiting State
  const [waitingDuelId, setWaitingDuelId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
        const load = async () => {
            setFriends(await DatabaseService.getFriends(user.id));
            setAllUsers(await DatabaseService.getUsers());
            setIncomingDuels(await DatabaseService.getIncomingDuels(user.id));
        };
        load();
        
        // Polling for incoming duels
        const interval = setInterval(async () => {
             setIncomingDuels(await DatabaseService.getIncomingDuels(user.id));
             
             // Check if my created duel was accepted
             if (waitingDuelId) {
                const session = await DatabaseService.getDuelSession(waitingDuelId);
                if (session) {
                    if (session.status === 'active') {
                        setWaitingDuelId(null);
                        navigate(`/quiz-setup/${session.subjectId}`, { 
                            state: { isDuel: true, duelId: session.id } 
                        });
                    } else if (session.status === 'rejected') {
                        setWaitingDuelId(null);
                        showToast("Duel request rejected.", "error");
                    }
                }
             }
        }, 3000);
        return () => clearInterval(interval);
    }
  }, [user, activeTab, pendingRequests, waitingDuelId]);

  const searchResults = allUsers.filter(u => 
    u.id !== user?.id && 
    !user?.friends.includes(u.id) && 
    (u.username.toLowerCase().includes(searchTerm.toLowerCase()) || u.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRequester = (req: FriendRequest) => allUsers.find(u => u.id === req.fromUserId);
  const getDuelChallenger = (duel: any) => allUsers.find(u => u.id === duel.player1Id);
  const getSubjectName = (id: string) => DatabaseService.getSubjects().find(s => s.id === id)?.name || 'Unknown';

  const handleAddFriend = async (friendId: string) => {
    if (user) await DatabaseService.sendFriendRequest(user.id, friendId);
    showToast(`Friend request sent!`, "success");
    setSearchTerm(''); 
  };

  const handleAccept = async (reqId: string) => {
    await DatabaseService.acceptFriendRequest(reqId);
    refreshUser(); 
    showToast("Friend request accepted!", "success");
  };

  const handleReject = async (reqId: string) => {
    await DatabaseService.rejectFriendRequest(reqId);
    refreshUser();
    showToast("Friend request ignored.", "info");
  };

  const openDuelModal = (friend: User) => {
      setDuelTarget(friend);
  };

  const handleCreateDuel = async (subjectId: string, count: number) => {
      if (user && duelTarget) {
          const session = await DatabaseService.createDuelSession(user.id, duelTarget.id, subjectId, count);
          setDuelTarget(null);
          setWaitingDuelId(session.id);
          showToast("Duel Invite Sent! Waiting for acceptance...", "info");
      }
  };

  const handleAcceptDuel = async (duel: any) => {
      await DatabaseService.acceptDuelInvite(duel.id);
      navigate(`/quiz-setup/${duel.subjectId}`, { 
          state: { isDuel: true, duelId: duel.id } 
      });
  };

  const handleRejectDuel = async (duel: any) => {
      await DatabaseService.rejectDuelInvite(duel.id);
      setIncomingDuels(prev => prev.filter(d => d.id !== duel.id));
      showToast("Duel rejected.", "info");
  };

  const cancelWaiting = async () => {
      if (waitingDuelId) await DatabaseService.rejectDuelInvite(waitingDuelId); 
      setWaitingDuelId(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in relative">
      {/* Waiting Modal */}
      {waitingDuelId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 text-center max-w-sm w-full animate-bounce-slow">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-10 h-10 text-orange-600 animate-spin-slow" />
                </div>
                <h2 className="text-xl font-bold mb-2">Waiting for Opponent...</h2>
                <p className="text-gray-500 mb-6">The duel will start automatically once they accept.</p>
                <button 
                    onClick={cancelWaiting}
                    className="text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-colors"
                >
                    Cancel Request
                </button>
            </div>
        </div>
      )}

      {duelTarget && user && (
          <DuelModal 
            opponent={duelTarget} 
            currentUser={user} 
            onClose={() => setDuelTarget(null)} 
            onStart={handleCreateDuel} 
          />
      )}

      <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Social & Duels</h1>
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
             <button 
                onClick={() => setActiveTab('my_friends')}
                className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'my_friends' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600' : 'text-gray-500'}`}
             >
                My Friends
             </button>
             <button 
                onClick={() => setActiveTab('requests')}
                className={`px-5 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'requests' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600' : 'text-gray-500'}`}
             >
                Requests
                {(pendingRequests.length + incomingDuels.length) > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">{pendingRequests.length + incomingDuels.length}</span>
                )}
             </button>
          </div>
      </div>

      {activeTab === 'my_friends' && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-primary-600" /> Connected Friends
                </h2>
                {friends.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <p className="font-medium">You haven't added any friends yet.</p>
                    <p className="text-sm mt-1">Search below to find people.</p>
                </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {friends.map(friend => (
                    <div key={friend.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors border border-transparent hover:border-primary-100">
                        <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-sm border-2 border-white">
                                {friend.avatar ? (
                                    <img src={friend.avatar} className="w-full h-full object-cover" alt={friend.username} />
                                ) : (
                                    <span className="text-lg font-bold text-primary-600">{friend.username[0]}</span>
                                )}
                            </div>
                            <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white dark:border-gray-800 rounded-full shadow-sm ${friend.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">{friend.fullName}</p>
                            <p className="text-xs text-gray-500 font-medium">@{friend.username}</p>
                            <p className="text-[10px] font-bold mt-0.5 text-gray-400 uppercase tracking-wide">
                                {friend.isOnline ? 'Online' : 'Offline'}
                            </p>
                        </div>
                        </div>
                        
                        {friend.isOnline ? (
                        <button 
                            onClick={() => openDuelModal(friend)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg shadow-orange-500/30 rounded-xl text-sm font-bold hover:scale-105 transition-all"
                        >
                            <Swords className="w-4 h-4" />
                            Duel
                        </button>
                        ) : null}
                    </div>
                    ))}
                </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold mb-4">Find New People</h2>
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Search by username or name..."
                        className="w-full pl-12 px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="space-y-3">
                    {searchTerm && searchResults.map(u => (
                        <div key={u.id} className="flex items-center justify-between p-4 border rounded-xl dark:border-gray-700 hover:shadow-md transition-all animate-fade-in-up">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold overflow-hidden">
                                     {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt={u.username} /> : u.username[0]}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{u.fullName}</p>
                                    <p className="text-xs text-gray-500">@{u.username}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleAddFriend(u.id)}
                                className="flex items-center gap-2 text-white bg-primary-600 hover:bg-primary-700 px-5 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-primary-500/20"
                            >
                                <UserPlus className="w-4 h-4" />
                                Add
                            </button>
                        </div>
                    ))}
                    {searchTerm && searchResults.length === 0 && (
                        <p className="text-center text-gray-500 py-4 font-medium">No users found.</p>
                    )}
                </div>
            </div>
          </>
      )}

      {activeTab === 'requests' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
              <h2 className="text-xl font-bold mb-6">Pending Requests & Challenges</h2>
              
              {incomingDuels.length > 0 && (
                  <div className="mb-8 space-y-4">
                      <h3 className="text-sm font-bold text-gray-500 uppercase">Duel Challenges</h3>
                      {incomingDuels.map(duel => {
                          const challenger = getDuelChallenger(duel);
                          if (!challenger) return null;
                          return (
                             <div key={duel.id} className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-900/30 animate-pulse">
                                  <div className="flex items-center gap-4">
                                       <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                                            <Swords className="w-6 h-6" />
                                       </div>
                                       <div>
                                            <p className="font-bold text-lg">{challenger.username} challenged you!</p>
                                            <p className="text-xs text-gray-500">{getSubjectName(duel.subjectId)} • {duel.questionCount} Questions</p>
                                       </div>
                                  </div>
                                  <div className="flex gap-2">
                                      <button 
                                        onClick={() => handleAcceptDuel(duel)}
                                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 hover:scale-105 transition-all"
                                      >
                                          Accept
                                      </button>
                                      <button 
                                        onClick={() => handleRejectDuel(duel)}
                                        className="px-4 py-2 bg-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 transition-all"
                                      >
                                          Decline
                                      </button>
                                  </div>
                             </div>
                          );
                      })}
                  </div>
              )}

              {pendingRequests.length === 0 && incomingDuels.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                      <p>No pending friend requests or duels.</p>
                  </div>
              ) : (
                  <div className="space-y-4">
                      {pendingRequests.length > 0 && <h3 className="text-sm font-bold text-gray-500 uppercase">Friend Requests</h3>}
                      {pendingRequests.map(req => {
                          const requester = getRequester(req);
                          if (!requester) return null;
                          return (
                              <div key={req.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700 animate-slide-in-right">
                                   <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-sm">
                                            {requester.avatar ? (
                                                <img src={requester.avatar} className="w-full h-full object-cover" alt={requester.username} />
                                            ) : (
                                                <span className="text-lg font-bold text-gray-500">{requester.username[0]}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{requester.fullName}</p>
                                            <p className="text-xs text-gray-500">wants to be your friend</p>
                                        </div>
                                   </div>
                                   <div className="flex gap-2">
                                       <button 
                                        onClick={() => handleAccept(req.id)}
                                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all hover:scale-110" title="Accept"
                                       >
                                           <Check className="w-5 h-5" />
                                       </button>
                                       <button 
                                        onClick={() => handleReject(req.id)}
                                        className="p-2 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 transition-all hover:scale-110" title="Ignore"
                                       >
                                           <X className="w-5 h-5" />
                                       </button>
                                   </div>
                              </div>
                          );
                      })}
                  </div>
              )}
          </div>
      )}
    </div>
  );
};