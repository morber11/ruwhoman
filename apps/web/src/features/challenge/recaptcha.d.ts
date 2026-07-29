interface GrecaptchaRenderParameters {
    sitekey: string;
    theme?: 'light' | 'dark';
    size?: 'normal' | 'compact';
    tabindex?: number;
    callback?: () => void;
    'expired-callback'?: () => void;
    'error-callback'?: () => void;
}

interface Window {
    grecaptcha?: {
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
        ready: (callback: () => void) => void;
        getResponse: (optWidgetId?: number) => string;
        render: (container: string | HTMLElement, parameters: GrecaptchaRenderParameters) => number;
        reset: (optWidgetId?: number) => void;
    };
}
