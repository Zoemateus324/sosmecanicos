import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  reference_id: string;
  read: boolean;
  created_at: string;
};

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new as Notification, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev =>
              prev.map(n => n.id === payload.new.id ? payload.new as Notification : n)
            );
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev =>
              prev.filter(n => n.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  if (loading) {
    return <div>Carregando notificações...</div>;
  }

  return (
    <div className="space-y-4">
      {notifications.length === 0 ? (
        <div className="text-gray-500">Nenhuma notificação</div>
      ) : (
        notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow ${
              notification.read ? 'bg-gray-50' : 'bg-white border-l-4 border-blue-500'
            }`}
            onClick={() => !notification.read && markAsRead(notification.id)}
          >
            <h3 className="font-semibold text-gray-900">{notification.title}</h3>
            <p className="text-gray-600 mt-1">{notification.message}</p>
            <span className="text-sm text-gray-400 mt-2 block">
              {new Date(notification.created_at).toLocaleString()}
            </span>
          </div>
        ))
      )}
    </div>
  );
} 