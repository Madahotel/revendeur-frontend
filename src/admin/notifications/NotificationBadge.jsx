import { useEffect, useState } from 'react';
import {
  FiBell,
} from 'react-icons/fi';
import axios from 'axios';
import api from '../../utils/Api';

export default function NotificationBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread/count');
      setCount(res.data.count);
    } catch (err) {
      console.error('Erreur récupération notification:', err);
    }
  };

  return (
    <div className="relative">
      <FiBell className="w-4 h-4 text-white" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}
