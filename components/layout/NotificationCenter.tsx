
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThreatIcon, ActivityIcon, LightbulbIcon } from '../Icons';

export interface Notification {
    id: string;
    type: 'Security' | 'System' | 'Info';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
}

interface NotificationCenterProps {
    isOpen: boolean;
    notifications: Notification[];
    onClose: () => void;
    onMarkAllRead: () => void;
    onClearAll: () => void;
    onRead: (id: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
    isOpen,
    notifications,
    onClose,
    onMarkAllRead,
    onClearAll,
    onRead
}) => {
    const getIcon = (type: string) => {
        switch (type) {
            case 'Security': return <ThreatIcon className="w-4 h-4 text-red-400" />;
            case 'System': return <ActivityIcon className="w-4 h-4 text-yellow-400" />;
            default: return <LightbulbIcon className="w-4 h-4 text-blue-400" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Security': return 'border-red-500/30 bg-red-500/5';
            case 'System': return 'border-yellow-500/30 bg-yellow-500/5';
            default: return 'border-blue-500/30 bg-blue-500/5';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full mt-3 right-0 w-80 sm:w-96 bg-[#050505]/95 border border-white/10 shadow-2xl z-50 backdrop-blur-xl flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-3 border-b border-white/10 flex justify-between items-center bg-[#0A0A0A]">
                        <h3 className="font-bold text-white text-xs uppercase tracking-widest font-mono">Alert Feed</h3>
                        <div className="flex gap-3">
                            <button onClick={onMarkAllRead} className="text-[9px] font-mono text-gray-500 hover:text-white transition-colors uppercase">
                                READ_ALL
                            </button>
                            <div className="w-px h-3 bg-white/10 my-auto"></div>
                             <button onClick={onClearAll} className="text-[9px] font-mono text-gray-500 hover:text-red-400 transition-colors uppercase">
                                PURGE
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-0">
                        {notifications.length === 0 ? (
                            <div className="text-center py-12 text-gray-600">
                                <div className="w-12 h-12 border border-dashed border-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <LightbulbIcon className="w-5 h-5 opacity-50" />
                                </div>
                                <p className="text-xs font-mono uppercase tracking-wide">Log Empty</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <motion.div
                                    key={notification.id}
                                    layout
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    onClick={() => onRead(notification.id)}
                                    className={`p-4 border-b border-white/5 cursor-pointer transition-all duration-200 group relative ${
                                        notification.read 
                                            ? 'bg-transparent hover:bg-white/[0.02] opacity-60 hover:opacity-100' 
                                            : `bg-[#0C0C0C] hover:bg-[#111]`
                                    }`}
                                >
                                    {!notification.read && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500"></div>}
                                    
                                    <div className="flex gap-3 items-start">
                                        <div className={`mt-0.5 p-1.5 rounded-sm border ${getTypeColor(notification.type)}`}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className={`text-xs font-bold uppercase tracking-wide truncate pr-2 ${notification.read ? 'text-gray-500' : 'text-gray-200'}`}>
                                                    {notification.title}
                                                </p>
                                                <span className="text-[9px] font-mono text-gray-600 whitespace-nowrap">{notification.timestamp}</span>
                                            </div>
                                            <p className="text-[11px] text-gray-400 leading-relaxed font-mono line-clamp-2">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                    
                    {/* Footer Tip */}
                    <div className="bg-[#0A0A0A] border-t border-white/10 p-2 text-center">
                        <p className="text-[9px] text-gray-600 font-mono uppercase">Local Session Storage Active</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationCenter;
