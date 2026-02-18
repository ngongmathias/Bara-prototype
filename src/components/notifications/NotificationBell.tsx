import React from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, Notification } from '@/context/NotificationsContext';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-white hover:text-white/80 hover:bg-white/10">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-transparent" />
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold leading-none">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto py-1 text-blue-600 hover:text-blue-800"
                            onClick={() => markAllAsRead()}
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="grid gap-1">
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onRead={() => markAsRead(notification.id)}
                                    onDelete={() => deleteNotification(notification.id)}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};

const NotificationItem = ({
    notification,
    onRead,
    onDelete
}: {
    notification: Notification;
    onRead: () => void;
    onDelete: () => void;
}) => {
    return (
        <div
            className={cn(
                "flex gap-3 p-4 items-start transition-colors hover:bg-gray-50 border-b last:border-0 relative group",
                !notification.is_read ? "bg-blue-50/50" : "bg-white"
            )}
            onClick={onRead}
        >
            <div className={cn(
                "mt-1 h-2 w-2 rounded-full flex-shrink-0",
                !notification.is_read ? "bg-blue-600" : "bg-transparent"
            )} />

            <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                    {notification.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                </p>
                <p className="text-[10px] text-gray-400">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </p>

                {notification.link && (
                    <Link
                        to={notification.link}
                        className="text-xs text-blue-600 hover:underline block mt-1"
                        onClick={(e) => e.stopPropagation()}
                    >
                        View details
                    </Link>
                )}
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-400 hover:text-red-500"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                >
                    <Trash2 className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
};
