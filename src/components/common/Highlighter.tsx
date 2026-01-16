import React from 'react';
import styled from 'styled-components';

const Mark = styled.mark`
    padding: 0;
    background-color: #ffc069;
    color: inherit;
    border-radius: 2px;
`;

interface HighlighterProps {
    text: string | number | undefined;
    search: string | undefined;
}

export const Highlighter: React.FC<HighlighterProps> = ({ text, search }) => {
    if (!text) return null;
    if (!search || !search.trim()) return <>{text}</>;

    const textStr = String(text);
    const searchTrimmed = search.trim();

    // Escape special regex characters
    const escapedSearch = searchTrimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearch})`, 'gi');
    const parts = textStr.split(regex);

    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <Mark key={i}>{part}</Mark>
                ) : (
                    part
                )
            )}
        </>
    );
};

export default Highlighter;
