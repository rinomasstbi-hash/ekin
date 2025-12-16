import React, { useState, useEffect } from 'react';
import { TeacherProfile } from '../types';

interface Props {
  initialProfile: TeacherProfile | null;
  onSave: (profile: TeacherProfile) => void;
}

export const ProfileForm: React.FC<Props> = ({ initialProfile, onSave }) => {
  const [formData, setFormData] = useState<TeacherProfile>({
    nama: '',
    nip: '',
    unitKerja: '',
    kota: '',
  });

  useEffect(() => {
    if (initialProfile) {
      setFormData(initialProfile);
    }
  }, [initialProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Data Guru</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap & Gelar</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            placeholder="Contoh: Budi Santoso, S.Pd."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">NIP (Opsional)</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            value={formData.nip}
            onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
            placeholder="19850101 201001 1 001"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit Kerja / Sekolah</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            value={formData.unitKerja}
            onChange={(e) => setFormData({ ...formData, unitKerja: e.target.value })}
            placeholder="SDN 01 Jakarta"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kota / Kabupaten</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            value={formData.kota}
            onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
            placeholder="Jakarta Selatan"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all transform hover:scale-[1.02] mt-4"
        >
          Simpan & Lanjutkan
        </button>
      </form>
    </div>
  );
};