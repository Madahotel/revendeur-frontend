import React, { useEffect, useState } from 'react';
import api from '../../utils/Api';

export default function BellIconWithBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Maka isa notif tsy novakiana
    api.get('/notifications/unread-count')
      .then(res => setUnreadCount(res.data.count))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="relative cursor-pointer">
      <i className="fa fa-bell text-xl"></i>
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-block bg-red-600 text-white text-xs rounded-full px-1">
          {unreadCount}
        </span>
      )}
    </div>
  );
}
