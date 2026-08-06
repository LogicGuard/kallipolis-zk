
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../common/Card';
import { Input, Textarea } from '../common/Input';
import Button from '../common/Button';
import { SendIcon } from '../Icons';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            onClose();
        }, 3000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-lg"
                >
                    <Card className="p-8 bg-[#0C0C0C] border border-white/10 shadow-2xl relative overflow-hidden">
                        {/* Technical Header Line */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

                        {submitted ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500 animate-pulse">
                                    <SendIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 font-mono">TRANSMISSION SENT</h3>
                                <p className="text-gray-500 font-mono text-xs">Uplink established. Standby for response.</p>
                            </div>
                        ) : (
                            <>
                                <div className="mb-8 border-b border-white/5 pb-4">
                                    <div className="flex justify-between items-start">
                                        <h2 className="text-xl font-bold text-white mb-1">Enterprise Uplink</h2>
                                        <div className="text-[10px] font-mono text-gray-500">CH_SECURE</div>
                                    </div>
                                    <p className="text-gray-500 text-xs font-mono">
                                        Establish dedicated channel for custom infrastructure requirements.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase font-mono">Identity</label>
                                            <Input placeholder="FULL_NAME" required className="bg-[#050505] border-white/10 text-xs font-mono focus:border-blue-500 rounded-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase font-mono">Contact Point</label>
                                            <Input type="email" placeholder="WORK_EMAIL" required className="bg-[#050505] border-white/10 text-xs font-mono focus:border-blue-500 rounded-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase font-mono">Organization</label>
                                        <Input placeholder="ENTITY_NAME" required className="bg-[#050505] border-white/10 text-xs font-mono focus:border-blue-500 rounded-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase font-mono">Requirements Payload</label>
                                        <Textarea rows={4} placeholder="Describe infrastructure needs..." required className="bg-[#050505] border-white/10 text-xs font-mono focus:border-blue-500 rounded-sm" />
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-white/5">
                                        <Button type="button" variant="secondary" onClick={onClose} className="flex-1 rounded-sm text-xs font-bold uppercase bg-transparent border border-white/10 hover:bg-white/5">
                                            Abort
                                        </Button>
                                        <Button type="submit" disabled={isLoading} className="flex-1 rounded-sm text-xs font-bold uppercase bg-white text-black hover:bg-gray-200 border-none">
                                            {isLoading ? 'Transmitting...' : 'Initiate Handshake'}
                                        </Button>
                                    </div>
                                </form>
                            </>
                        )}
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ContactModal;
