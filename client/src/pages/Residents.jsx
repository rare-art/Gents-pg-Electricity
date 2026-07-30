import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, Home, Phone, Edit, UserX, CheckCircle, Search, History, ShieldAlert, Trash2, AlertTriangle } from 'lucide-react';
import { api } from '../api';

export const Residents = ({ residents = [], onRefresh, onOpenAddResident, onEditResident }) => {
  const { isOwner } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roomFilter, setRoomFilter] = useState('All');
  const [selectedLedgerResident, setSelectedLedgerResident] = useState(null);
  const [ledgerPayments, setLedgerPayments] = useState([]);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [residentToDelete, setResidentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredResidents = residents.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || (r.phone && r.phone.includes(searchTerm));
    const matchesRoom = roomFilter === 'All' || r.roomNumber === Number(roomFilter);
    return matchesSearch && matchesRoom;
  });

  const handleToggleStatus = async (resident) => {
    if (!isOwner) return;
    const newStatus = resident.status === 'Active' ? 'Left' : 'Active';
    try {
      await api.updateResident(resident._id, { status: newStatus });
      onRefresh();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleConfirmDelete = async () => {
    if (!residentToDelete || !isOwner) return;
    setIsDeleting(true);
    try {
      await api.deleteResident(residentToDelete._id);
      setResidentToDelete(null);
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to delete resident');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenLedger = async (resident) => {
    setSelectedLedgerResident(resident);
    setLoadingLedger(true);
    try {
      const data = await api.getResidentPayments(resident._id);
      setLedgerPayments(data);
    } catch (err) {
      setLedgerPayments([]);
    } finally {
      setLoadingLedger(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">PG Residents ({residents.length} Total)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            4 Rooms • 2 Residents per room • Managed for Bhubaneswar PG
          </p>
        </div>

        {isOwner && (
          <button
            onClick={onOpenAddResident}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md shadow-emerald-600/20 transition-all"
          >
            <UserPlus className="w-4 h-4" /> Add Resident
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 uppercase">Filter Room:</span>
          {['All', 1, 2, 3, 4].map(room => (
            <button
              key={room}
              onClick={() => setRoomFilter(room.toString())}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                roomFilter === room.toString()
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {room === 'All' ? 'All Rooms' : `Room ${room}`}
            </button>
          ))}
        </div>
      </div>

      {/* Room-wise Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(roomNum => {
          const roomResidents = filteredResidents.filter(r => r.roomNumber === roomNum);
          return (
            <div key={roomNum} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-emerald-600" />
                    <span className="font-extrabold text-slate-900">Room {roomNum}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                    {roomResidents.length} / 2 Residents
                  </span>
                </div>

                <div className="space-y-3">
                  {roomResidents.map(resident => (
                    <div
                      key={resident._id}
                      className={`p-3 rounded-2xl border transition-all ${
                        resident.status === 'Active'
                          ? 'bg-slate-50 border-slate-200 hover:border-emerald-300'
                          : 'bg-red-50/40 border-red-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-sm text-slate-900">{resident.name}</p>
                          {resident.phone && (
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" /> {resident.phone}
                            </p>
                          )}
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          resident.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {resident.status}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold">
                        <button
                          onClick={() => handleOpenLedger(resident)}
                          className="text-emerald-700 hover:underline flex items-center gap-1"
                        >
                          <History className="w-3.5 h-3.5" /> Ledger History
                        </button>

                        {isOwner && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onEditResident(resident)}
                              className="text-slate-600 hover:text-slate-900 p-1"
                              title="Edit Resident"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(resident)}
                              className={`${resident.status === 'Active' ? 'text-amber-600' : 'text-emerald-600'} hover:underline`}
                              title={resident.status === 'Active' ? 'Mark Left' : 'Mark Active'}
                            >
                              {resident.status === 'Active' ? 'Mark Left' : 'Re-activate'}
                            </button>
                            <button
                              onClick={() => setResidentToDelete(resident)}
                              className="text-red-600 hover:text-red-800 hover:underline flex items-center gap-0.5 ml-1"
                              title="Delete Resident Permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}

                  {roomResidents.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-4">No residents in this room match filter.</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal for Resident Deletion */}
      {residentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Delete Resident</h3>
                <p className="text-xs text-slate-500 font-semibold">{residentToDelete.name} (Room {residentToDelete.roomNumber})</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 font-medium">
              Are you sure you want to permanently delete this resident? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResidentToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5"
              >
                {isDeleting ? 'Deleting...' : 'Delete Resident'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resident Ledger Modal */}
      {selectedLedgerResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
            <div className="bg-gradient-to-r from-emerald-800 to-lime-700 p-6 text-white relative">
              <button
                onClick={() => setSelectedLedgerResident(null)}
                className="absolute top-4 right-4 text-emerald-100 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                ✕
              </button>
              <h2 className="text-xl font-extrabold">{selectedLedgerResident.name}'s Payment Ledger</h2>
              <p className="text-xs text-emerald-100">Room {selectedLedgerResident.roomNumber} • Complete Bill Split History</p>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {loadingLedger ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : ledgerPayments.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-6">No payment records logged for this resident yet.</p>
              ) : (
                ledgerPayments.map(p => (
                  <div key={p._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-slate-900">
                        {p.bill?.month} {p.bill?.year} ({p.bill?.meter?.name || 'Meter'})
                      </p>
                      <p className="text-xs text-slate-500">
                        Total Bill: ₹{p.bill?.totalAmount} | Per Head Share
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-sm text-slate-900">₹{p.amount}</span>
                      <p className={`text-[10px] font-bold ${p.status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {p.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
