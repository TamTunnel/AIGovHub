// API URL utility for consistent backend access across all components
export const getApiUrl = (endpoint: string = ''): string => {
    // Detect if running in GitHub Codespaces
    if (typeof window !== 'undefined' && window.location.hostname.includes('.app.github.dev')) {
        // Replace port 3000 with 8000 for backend API
        const backendUrl = window.location.origin.replace('-3000.app.github.dev', '-8000.app.github.dev');
        return `${backendUrl}/api/v1${endpoint}`;
    }

    // Fall back to localhost for local development  
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    return `${baseUrl}/api/v1${endpoint}`;
};
