import { useEffect, useState } from 'react';
import api from '../../utils/Api';

export default function NotificationList() {
  const [notifications, setNotifications] = useState([]);


  useEffect(() => {
    fetchNotifications();
  }, []);

const fetchNotifications = async () => {
  try {
    const res = await api.get('/notifications');

    // Ajoute une vérification ici
    if (Array.isArray(res.data)) {
      setNotifications(res.data);
    } else {
      console.warn("Réponse inattendue :", res.data);
      setNotifications([]); // Fallback
    }
  } catch (err) {
    console.error(err);
    setNotifications([]); // Empêche le crash même en cas d'erreur
  }
};



  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      fetchNotifications(); // refresh
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <button
          onClick={markAllAsRead}
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
        >
          Marquer tout comme lu
        </button>
      </div>
      <ul className="space-y-3">
        {notifications.map((notif) => (
          <li
            key={notif.id}
            className={`p-3 rounded border ${
              notif.read_at ? 'bg-gray-100' : 'bg-blue-100'
            }`}
          >
            <p>{notif.data.message}</p>
            <span className="text-xs text-gray-500">{new Date(notif.created_at).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
