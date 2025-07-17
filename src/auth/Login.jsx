import React, { useState } from 'react';
import api from '../utils/Api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', { email, password });

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Données invalides.");
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirection basée sur le rôle
      switch (user.role) {
        case 'revendeur':
          navigate('/dash_rev');
          break;
        case 'admin':
          navigate('/dashboard');
          break;
        default:
          navigate('/dashboard'); // redirection par défaut
      }
    } catch (err) {
      console.error('Erreur de connexion', err);
      setError('Échec de la connexion. Vérifiez vos identifiants.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Connexion</h2>
        {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
