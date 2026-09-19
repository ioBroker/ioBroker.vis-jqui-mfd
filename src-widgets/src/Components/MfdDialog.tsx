import React, { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';

import { dialogVars, type MfdThemeColors } from './theme';
import { cssSize } from '../utils';

/** Every dialog that opens lies over the ones that are already open */
let lastZIndex = 1000;

export interface MfdDialogSettings {
    /** Text of the title bar; the caller falls back to the object ID like vis-1 */
    title?: string;
    /** Title bar without background and text - only the close button stays */
    noHeader?: boolean;
    /** Darkens the view behind the dialog and blocks it; a click on the dark area closes the dialog */
    modal?: boolean;
    /** Size of the dialog, a number is px */
    width?: string | number;
    height?: string | number;
    /** Position in the window; empty centres the dialog on that axis */
    top?: string | number;
    left?: string | number;
    overflowX?: string;
    overflowY?: string;
    /** Closes the dialog after that many ms; every click in the dialog starts the time again. 0: stays open */
    autoClose?: number;
}

interface MfdDialogProps extends MfdDialogSettings {
    open: boolean;
    onClose: () => void;
    dark?: boolean;
    /** Extra style of the content area, e.g. the left padding of the value dialogs */
    contentStyle?: CSSProperties;
    /** Class of the content area */
    contentClassName?: string;
    /** The colours of the vis-2 theme ("vis-2 theme" on); without them the dialog has its own light/dark look */
    colors?: MfdThemeColors;
    children: React.ReactNode;
}

/**
 * The popup of the dialog widgets - the replacement of the jQuery UI dialog.
 *
 * It is rendered into `document.body`, so no widget and no `overflow: hidden` of the view can cover or cut it. The
 * jQuery UI theme of the view does not reach that far (vis-2 loads it scoped to the view), so the dialog has a
 * look of its own that follows the light and dark theme of vis-2.
 *
 * Like the jQuery UI dialog it can be moved at the title bar and closed with Escape.
 */
export default function MfdDialog(props: MfdDialogProps): React.JSX.Element | null {
    const { open, onClose, autoClose } = props;
    // The widgets render the dialog only while it is open, so every opening mounts it anew: on top of the dialogs
    // that are open already, at the configured position
    const [zIndex] = useState(() => (lastZIndex += 2));
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const drag = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
    // the timer and the Escape key call the latest onClose, without starting the timer again when it changes
    const onCloseRef = useRef(onClose);
    useLayoutEffect(() => {
        onCloseRef.current = onClose;
    });

    const restartTimer = (): void => {
        if (timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
        }
        if (autoClose) {
            timer.current = setTimeout(() => {
                timer.current = null;
                onCloseRef.current();
            }, autoClose);
        }
    };

    useEffect(() => {
        if (!open) {
            return undefined;
        }
        restartTimer();

        const onKey = (e: KeyboardEvent): void => {
            if (e.key === 'Escape') {
                onCloseRef.current();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('keydown', onKey);
            if (timer.current) {
                clearTimeout(timer.current);
                timer.current = null;
            }
        };
        // the timer is only started again by opening or by a click in the dialog
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, autoClose]);

    if (!open) {
        return null;
    }

    const top = cssSize(props.top);
    const left = cssSize(props.left);
    const style: CSSProperties = {
        ...(props.colors ? dialogVars(props.colors) : undefined),
        zIndex: zIndex + 1,
        width: cssSize(props.width),
        minHeight: cssSize(props.height),
        top: top ?? '50%',
        left: left ?? '50%',
        transform: `translate(calc(${left === undefined ? '-50%' : '0px'} + ${offset.x}px), calc(${
            top === undefined ? '-50%' : '0px'
        } + ${offset.y}px))`,
    };

    const onHeaderPointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
        if (e.button !== 0 || (e.target as HTMLElement).closest('button')) {
            return;
        }
        drag.current = { x: offset.x, y: offset.y, startX: e.clientX, startY: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    const onHeaderPointerMove = (e: React.PointerEvent<HTMLDivElement>): void => {
        if (drag.current) {
            setOffset({
                x: drag.current.x + e.clientX - drag.current.startX,
                y: drag.current.y + e.clientY - drag.current.startY,
            });
        }
    };
    const onHeaderPointerUp = (): void => {
        drag.current = null;
    };

    const dialog = (
        <div
            className={`mfd-rx mfd-dialog${(props.colors ? props.colors.dark : props.dark) ? ' mfd-dark' : ''}`}
            role="dialog"
            style={style}
            // clicks in the dialog must not reach the widget, which would open the dialog again
            onClick={e => e.stopPropagation()}
            onPointerDown={e => {
                e.stopPropagation();
                restartTimer();
            }}
        >
            <div
                className={`mfd-dialog-header${props.noHeader ? ' mfd-dialog-header-hidden' : ''}`}
                onPointerDown={onHeaderPointerDown}
                onPointerMove={onHeaderPointerMove}
                onPointerUp={onHeaderPointerUp}
                onPointerCancel={onHeaderPointerUp}
            >
                <div className="mfd-dialog-title">{props.noHeader ? '' : props.title || ''}</div>
                <button
                    type="button"
                    className="mfd-dialog-close"
                    aria-label="close"
                    onClick={() => onClose()}
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                    >
                        <path
                            d="M6 6l12 12M18 6L6 18"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>
            </div>
            <div
                className={`mfd-dialog-content${props.contentClassName ? ` ${props.contentClassName}` : ''}`}
                style={{
                    overflowX: (props.overflowX as CSSProperties['overflowX']) || 'auto',
                    overflowY: (props.overflowY as CSSProperties['overflowY']) || 'auto',
                    ...props.contentStyle,
                }}
            >
                {props.children}
            </div>
        </div>
    );

    return createPortal(
        <>
            {props.modal ? (
                <div
                    className="mfd-dialog-backdrop"
                    style={{ zIndex }}
                    onClick={e => {
                        e.stopPropagation();
                        onClose();
                    }}
                    onPointerDown={e => e.stopPropagation()}
                />
            ) : null}
            {dialog}
        </>,
        document.body,
    );
}
