import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';

const scrollAnimation = keyframes`
    0% {
        transform: translateY(0);
    }
    100% {
        transform: translateY(-50%);
    }
`;

const Container = styled.div<{ $fullHeight?: boolean }>`
    overflow: hidden;
    position: relative;
    width: 100%;
    ${props => props.$fullHeight && `
        flex: 1;
        display: flex;
        flex-direction: column;
    `}

    &:hover .slide-wrapper {
        animation-play-state: paused;
    }
`;

const SlideWrapper = styled.div<{ $shouldAnimate: boolean; $duration: number }>`
    width: 100%;
    ${props => props.$shouldAnimate && css`
        animation: ${scrollAnimation} ${props.$duration}s linear infinite;
    `}
`;

const ItemRow = styled.div<{ $height: number }>`
    height: ${props => props.$height}px;
    display: flex;
    align-items: center;
    width: 100%;
`;

interface AirportSlideListProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    itemHeight: number;
    visibleCount?: number;
    scrollSpeed?: number; // pixels per second (default: 30)
    className?: string;
    fullHeight?: boolean; // If true, fills the parent container
}

function AirportSlideList<T>({
    items,
    renderItem,
    itemHeight,
    visibleCount = 5,
    scrollSpeed = 30,
    className,
    fullHeight = false,
}: AirportSlideListProps<T>) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dynamicVisibleCount, setDynamicVisibleCount] = useState(visibleCount);

    // Calculate visible count based on container height when fullHeight is enabled
    useEffect(() => {
        if (!fullHeight || !containerRef.current) return;

        const updateVisibleCount = () => {
            const containerHeight = containerRef.current?.clientHeight || 0;
            const newVisibleCount = Math.max(1, Math.floor(containerHeight / itemHeight));
            setDynamicVisibleCount(newVisibleCount);
        };

        updateVisibleCount();
        const resizeObserver = new ResizeObserver(updateVisibleCount);
        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, [fullHeight, itemHeight]);

    const effectiveVisibleCount = fullHeight ? dynamicVisibleCount : visibleCount;
    const shouldAnimate = items.length > effectiveVisibleCount;

    // Double the items for seamless looping
    const displayItems = shouldAnimate
        ? [...items, ...items]
        : items;

    // Calculate animation duration based on scroll speed
    // Total distance to scroll = items.length * itemHeight (half of doubled list)
    const totalScrollDistance = items.length * itemHeight;
    const animationDuration = totalScrollDistance / scrollSpeed;

    const containerStyle = fullHeight
        ? { flex: 1, minHeight: 0, height: '100%' }
        : { height: itemHeight * visibleCount };

    return (
        <Container
            ref={containerRef}
            className={className}
            $fullHeight={fullHeight}
            style={containerStyle}
        >
            <SlideWrapper
                className="slide-wrapper"
                $duration={animationDuration}
                $shouldAnimate={shouldAnimate}
            >
                {displayItems.map((item, idx) => (
                    <ItemRow key={`item-${idx}`} $height={itemHeight}>
                        {renderItem(item, idx % items.length)}
                    </ItemRow>
                ))}
            </SlideWrapper>
        </Container>
    );
}

export default AirportSlideList;
