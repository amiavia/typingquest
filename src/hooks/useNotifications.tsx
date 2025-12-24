/**
 * PRP-027 Task 5.4: Notification System Hook
 *
 * In-app notifications for various events.
 */

import { useState, useCallback } from "react";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  autoDismiss?: boolean;
  duration?: number;
}

export interface UseNotificationsResult {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  // Convenience methods
  notifyStreakAtRisk: () => void;
  notifyNewChallenge: () => void;
  notifyRewardReady: (coins?: number) => void;
  notifyPremiumExpiring: (daysLeft: number) => void;
  notifyAchievement: (name: string) => void;
}

export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id">): string => {
      const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newNotification: Notification = {
        ...notification,
        id,
        autoDismiss: notification.autoDismiss ?? true,
        duration: notification.duration ?? 5000,
      };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto-dismiss if enabled
      if (newNotification.autoDismiss) {
        setTimeout(() => {
          removeNotification(id);
        }, newNotification.duration);
      }

      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string): void => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback((): void => {
    setNotifications([]);
  }, []);

  // Convenience methods for common notifications
  const notifyStreakAtRisk = useCallback((): void => {
    addNotification({
      type: "warning",
      title: "STREAK AT RISK!",
      message: "Complete a lesson today to keep your streak alive!",
      actionLabel: "START LESSON",
      autoDismiss: false,
    });
  }, [addNotification]);

  const notifyNewChallenge = useCallback((): void => {
    addNotification({
      type: "info",
      title: "NEW DAILY CHALLENGE!",
      message: "A fresh challenge awaits. Are you up for it?",
      actionLabel: "VIEW CHALLENGE",
    });
  }, [addNotification]);

  const notifyRewardReady = useCallback(
    (coins?: number): void => {
      addNotification({
        type: "success",
        title: "REWARD READY!",
        message: coins
          ? `Claim your ${coins} coins now!`
          : "You have unclaimed rewards waiting!",
        actionLabel: "CLAIM",
      });
    },
    [addNotification]
  );

  const notifyPremiumExpiring = useCallback(
    (daysLeft: number): void => {
      addNotification({
        type: "warning",
        title: "PREMIUM EXPIRING SOON",
        message: `Your premium subscription expires in ${daysLeft} day${
          daysLeft === 1 ? "" : "s"
        }.`,
        actionLabel: "RENEW",
        autoDismiss: false,
      });
    },
    [addNotification]
  );

  const notifyAchievement = useCallback(
    (name: string): void => {
      addNotification({
        type: "success",
        title: "ACHIEVEMENT UNLOCKED!",
        message: name.toUpperCase(),
        duration: 7000,
      });
    },
    [addNotification]
  );

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    notifyStreakAtRisk,
    notifyNewChallenge,
    notifyRewardReady,
    notifyPremiumExpiring,
    notifyAchievement,
  };
}

// Notification display component
interface NotificationToastProps {
  notification: Notification;
  onDismiss: () => void;
}

export function NotificationToast({
  notification,
  onDismiss,
}: NotificationToastProps) {
  const bgColorMap: Record<NotificationType, string> = {
    info: "#3bceac",
    success: "#0ead69",
    warning: "#ffd93d",
    error: "#ff6b9d",
  };

  const iconMap: Record<NotificationType, string> = {
    info: "ℹ️",
    success: "✓",
    warning: "⚠️",
    error: "✗",
  };

  return (
    <div
      className="fixed top-4 right-4 z-50 max-w-sm animate-slide-in"
      style={{ fontFamily: "'Press Start 2P'" }}
    >
      <div
        className="p-4 border-4"
        style={{
          backgroundColor: "#1a1a2e",
          borderColor: bgColorMap[notification.type],
          boxShadow: `0 0 20px ${bgColorMap[notification.type]}40`,
        }}
      >
        <div className="flex items-start gap-3">
          <span style={{ fontSize: "16px" }}>{iconMap[notification.type]}</span>
          <div className="flex-1">
            <h4
              style={{
                fontSize: "8px",
                color: bgColorMap[notification.type],
                marginBottom: "4px",
              }}
            >
              {notification.title}
            </h4>
            <p style={{ fontSize: "6px", color: "#eef5db", lineHeight: "1.8" }}>
              {notification.message}
            </p>

            {notification.actionLabel && notification.onAction && (
              <button
                onClick={() => {
                  notification.onAction?.();
                  onDismiss();
                }}
                className="mt-3 px-3 py-1 border-2 hover:bg-opacity-20 transition-colors"
                style={{
                  fontSize: "6px",
                  borderColor: bgColorMap[notification.type],
                  color: bgColorMap[notification.type],
                }}
              >
                {notification.actionLabel}
              </button>
            )}
          </div>
          <button
            onClick={onDismiss}
            style={{ fontSize: "10px", color: "#4a4a6e" }}
            className="hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
