
import React, { useState, useEffect, useRef } from 'react';

const CHARS = "ABCDEFGHIKLMNOPQRSTUVWYZ0123456789<>/-_[]{}*^";

interface HeroTypographyProps {
    text: string;
    className?: string;
    highlightWords?: string[];
}

const HeroTypography: React.FC<HeroTypographyProps> = ({ text, className = "", highlightWords = [] }) => {
    const [displayText, setDisplayText] = useState('');
    const [isFinished, setIsFinished] = useState(false);
    const iterationRef = useRef(0);

    useEffect(() => {
        let interval: any;
        iterationRef.current = 0;
        setIsFinished(false);
        
        const startTimeout = setTimeout(() => {
            interval = setInterval(() => {
                setDisplayText(() => {
                    const targetText = text;
                    const currentIteration = iterationRef.current;
                    
                    if (currentIteration >= targetText.length) {
                        clearInterval(interval);
                        setIsFinished(true);
                        return targetText;
                    }
                    
                    const nextText = targetText
                        .split("")
                        .map((char, index) => {
                            if (index < currentIteration) {
                                return targetText[index];
                            }
                            if (char === " ") return " ";
                            return CHARS[Math.floor(Math.random() * CHARS.length)];
                        })
                        .join("");
                    
                    iterationRef.current += 1.5; // Faster reveal for expert feel
                    return nextText;
                });
            }, 30);
        }, 100);

        return () => {
            clearTimeout(startTimeout);
            if (interval) clearInterval(interval);
        };
    }, [text]);

    const renderContent = () => {
        if (!displayText) return null;

        if (isFinished) {
             const regex = new RegExp(`(${highlightWords.join('|')})`, 'gi');
             const parts = text.split(regex);
             return (
                 <>
                    {parts.map((part, i) => {
                        const isHighlight = highlightWords.some(hw => hw.toLowerCase() === part.toLowerCase());
                        return isHighlight 
                            ? <span key={i} className="text-polygon-purple font-black drop-shadow-[0_0_15px_rgba(123,63,228,0.4)]">{part}</span> 
                            : <span key={i}>{part}</span>;
                    })}
                 </>
             )
        }
        
        return <span>{displayText}</span>;
    };

    return (
        <div className={`leading-[1] tracking-tight ${className}`}>
            {renderContent()}
            {!isFinished && <span className="inline-block w-[0.15em] h-[0.8em] ml-1 align-middle bg-polygon-purple shadow-[0_0_12px_rgba(123,63,228,0.8)]"></span>}
        </div>
    );
};

export default HeroTypography;
