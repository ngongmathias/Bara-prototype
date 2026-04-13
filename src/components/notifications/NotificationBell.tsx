import React from 'react';
import {
    Bell, Trash2, MessageSquare, Calendar, Music, FileText,
    Coins, ShoppingBag, Tag, CheckCircle, XCircle, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, Notification, NotificationType } from '@/context/NotificationsContext';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case 'new_message': return MessageSquare;
        case 'event_reminder': case 'event_rsvp': return Calendar;
        case 'new_song_from_artist': return Music;
        case 'blog_comment_reply': case 'blog_approved': return FileText;
        case 'blog_declined': return XCircle;
        case 'coins_earned': return Coins;
        case 'new_ad_from_store': case 'listing_approved': return ShoppingBag;
        case 'listing_rejected': return XCircle;
        case 'offer_received': case 'offer_accepted': return Tag;
        case 'success': return CheckCircle;
        case 'warning': case 'error': return XCircle;
        default: return Info;
    }
};

export const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex items-center justify-center h-4 min-w-[16px] px-0.5 rounded-full bg-black text-white text-[10px] font-bold leading-none">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold leading-none font-comfortaa">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto py-1 text-gray-600 hover:text-gray-900"
                            onClick={() => markAllAsRead()}
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                            <Bell className="h-8 w-8 mb-2 opacity-30" />
                            <p className="text-sm font-medium">No notifications yet</p>
                            <p className="text-xs text-gray-300 mt-1">We'll notify you when something happens</p>
                        </div>
                    ) : (
                        <div className="grid gap-0">
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
    const Icon = getNotificationIcon(notification.type);

    return (
        <div
            className={cn(
                "flex gap-3 p-3 items-start transition-colors hover:bg-gray-50 border-b last:border-0 relative group cursor-pointer",
                !notification.is_read ? "bg-gray-50/80" : "bg-white"
            )}
            onClick={onRead}
        >
            <div className={cn(
                "mt-0.5 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                !notification.is_read ? "bg-black text-white" : "bg-gray-100 text-gray-500"
            )}>
                <Icon className="h-4 w-4" />
            </div>

            <div className="flex-1 space-y-0.5 min-w-0">
                <p className={cn(
                    "text-sm leading-tight line-clamp-1",
                    !notification.is_read ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                )}>
                    {notification.title}
                </p>
                <p className="text-xs text-gray-500 line-clamp-2">
                    {notification.message}
                </p>
                <p className="text-[10px] text-gray-400">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </p>

                {notification.link && (
                    <Link
                        to={notification.link}
                        className="text-xs font-medium text-gray-900 hover:underline block mt-1"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRead();
                        }}
                    >
                        View details →
                    </Link>
                )}
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-400 hover:text-gray-700"
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
