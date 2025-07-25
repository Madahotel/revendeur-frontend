import React, { useState } from 'react';
import api from '../../utils/Api';

export default function RevendeurForm({ onCreated }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    pays: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  // Mise à jour du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrors({});

    try {
      const res = await api.post('/register-revendeur', form);
      setMessage(`✅ Revendeur créé avec succès : ${res.data.code_affiliation}`);

      // Reset du formulaire
      setForm({
        name: '',
        email: '',
        pays: '',
        password: '',
        password_confirmation: '',
      });

      if (onCreated) onCreated();
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setMessage(`❌ ${err.response.data.message}`);
      } else {
        setMessage("❌ Erreur lors de la création du revendeur.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Créer un nouveau revendeur</h2>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        {/* Nom */}
        <div>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nom"
            className="border p-2 rounded w-full"
            required
          />
          {errors.name && <p className="text-red-600 text-sm">{errors.name[0]}</p>}
        </div>

        {/* Email */}
        <div>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="border p-2 rounded w-full"
            required
          />
          {errors.email && <p className="text-red-600 text-sm">{errors.email[0]}</p>}
        </div>

        {/* Pays */}
        <div>
          <input
            type="text"
            name="pays"
            value={form.pays}
            onChange={handleChange}
            placeholder="Pays"
            className="border p-2 rounded w-full"
          />
          {errors.pays && <p className="text-red-600 text-sm">{errors.pays[0]}</p>}
        </div>

        {/* Mot de passe */}
        <div>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Mot de passe"
            className="border p-2 rounded w-full"
            required
          />
          {errors.password && <p className="text-red-600 text-sm">{errors.password[0]}</p>}
        </div>

        {/* Confirmation mot de passe */}
        <div>
          <input
            type="password"
            name="password_confirmation"
            value={form.password_confirmation}
            onChange={handleChange}
            placeholder="Confirmez le mot de passe"
            className="border p-2 rounded w-full"
            required
          />
          {errors.password_confirmation && (
            <p className="text-red-600 text-sm">{errors.password_confirmation[0]}</p>
          )}
        </div>

        {/* Bouton */}
        <div className="col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
          >
            {loading ? 'Création...' : 'Créer'}
          </button>
        </div>
      </form>

      {/* Message retour */}
      {message && (
        <p className={`mt-4 text-sm ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
