declare const BACKEND: string;

export const environment = {
    backendUrl: typeof BACKEND !== 'undefined' ? BACKEND : 'http://localhost:8080'
};