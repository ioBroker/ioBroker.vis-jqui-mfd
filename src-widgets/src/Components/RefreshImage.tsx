import React, { useEffect, useState, type CSSProperties } from 'react';

interface RefreshImageProps {
    src: string;
    /** Loads the image again every that many ms; 0 never */
    interval?: number;
    /** Loads the image again when the page becomes visible - a MJPEG stream stops while the tab sleeps */
    refreshOnWakeUp?: boolean;
    alt?: string;
    className?: string;
    style?: CSSProperties;
}

/**
 * An image that is loaded again and again - `vis.binds.basic.imgRefresh` of vis-1. A timestamp in the query keeps
 * the browser from answering from its cache; the first load goes to the URL as it is.
 *
 * The timer only runs while the image is shown, and not while the page is hidden.
 */
export default function RefreshImage(props: RefreshImageProps): React.JSX.Element | null {
    const { src, interval, refreshOnWakeUp } = props;
    const [stamp, setStamp] = useState(0);

    useEffect(() => {
        if (!src || !interval || interval <= 0) {
            return undefined;
        }
        const timer = setInterval(() => {
            if (document.visibilityState !== 'hidden') {
                setStamp(Date.now());
            }
        }, interval);
        return () => clearInterval(timer);
    }, [src, interval]);

    useEffect(() => {
        if (!src || !refreshOnWakeUp) {
            return undefined;
        }
        const onVisibility = (): void => {
            if (document.visibilityState === 'visible') {
                setStamp(Date.now());
            }
        };
        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
    }, [src, refreshOnWakeUp]);

    if (!src) {
        return null;
    }

    return (
        <img
            className={props.className}
            src={stamp ? `${src}${src.includes('?') ? '&' : '?'}_refts=${stamp}` : src}
            alt={props.alt || ''}
            draggable={false}
            style={props.style}
        />
    );
}
