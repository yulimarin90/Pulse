
export type NoticeType = 'success' | 'error';

export interface NoticeState {
    type: NoticeType;
    message: string;
}

//Message that appears after an action: green if successful, red if it failed
export default function Notice({ type, message }: NoticeState) {
    return (
        <p className={`notice notice-${type}`} role={type === 'error' ? 'alert' : 'status'}>
            {message}
        </p>
    );
}