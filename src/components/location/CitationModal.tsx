import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Download, BookOpen } from 'lucide-react';
import { useState } from 'react';
import type { Location } from '../../types';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { datumLabel, siteBibtex, siteCitation } from '../../lib/citation';
import project from '../../data/project.json';

interface CitationModalProps {
    location: Location;
    isOpen: boolean;
    onClose: () => void;
}

export const CitationModal = ({ location, isOpen, onClose }: CitationModalProps) => {
    const [copied, setCopied] = useState<'apa' | 'bibtex' | null>(null);
    useEscapeKey(onClose, isOpen);

    const citations = { apa: siteCitation(location), bibtex: siteBibtex(location) };

    const handleCopy = async (type: 'apa' | 'bibtex') => {
        await navigator.clipboard.writeText(citations[type]);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleDownloadJson = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(location, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${location.name.toLowerCase().replace(/\s+/g, '_')}_data.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1500]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Cite this site"
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl p-5 md:p-8 z-[1510] w-[90vw] max-w-2xl max-h-[90dvh] overflow-y-auto shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <BookOpen className="w-6 h-6 text-amber-500" />
                                Cite This Site
                            </h2>
                            <button onClick={onClose} aria-label="Close" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* APA Style */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase">APA Format</span>
                                    <button
                                        onClick={() => handleCopy('apa')}
                                        className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700"
                                    >
                                        {copied === 'apa' ? 'Copied!' : <><Copy className="w-4 h-4" /> Copy</>}
                                    </button>
                                </div>
                                <p className="font-mono text-sm text-gray-800 break-words leading-relaxed select-all">
                                    {citations.apa}
                                </p>
                            </div>

                            {/* BibTeX Style */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase">BibTeX</span>
                                    <button
                                        onClick={() => handleCopy('bibtex')}
                                        className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700"
                                    >
                                        {copied === 'bibtex' ? 'Copied!' : <><Copy className="w-4 h-4" /> Copy</>}
                                    </button>
                                </div>
                                <pre className="font-mono text-xs text-gray-800 overflow-x-auto p-2 bg-white rounded-lg border border-gray-200">
                                    {citations.bibtex}
                                </pre>
                            </div>

                            <p className="text-sm text-gray-600">
                                Licence: {project.licence}. Coordinates: {datumLabel}.
                            </p>

                            <hr />

                            {/* Download Data */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-gray-900">Export Raw Data</h3>
                                    <p className="text-sm text-gray-500">Download this site's record as JSON.</p>
                                </div>
                                <button
                                    onClick={handleDownloadJson}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                                >
                                    <Download className="w-4 h-4" />
                                    Download JSON
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
