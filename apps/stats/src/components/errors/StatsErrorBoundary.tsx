import React from 'react';
import StatsErrorPage from './StatsErrorPage';

class StatsErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error?: Error}> {
    constructor(props: {children: React.ReactNode}) {
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError(error: Error) {
        // eslint-disable-next-line no-console
        console.error('[STATS ERROR BOUNDARY] Error caught:', error);
        // eslint-disable-next-line no-console
        console.error('[STATS ERROR BOUNDARY] Error stack:', error.stack);
        return {hasError: true, error};
    }
    
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // eslint-disable-next-line no-console
        console.error('[STATS ERROR BOUNDARY] Component stack:', errorInfo.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return <StatsErrorPage error={this.state.error} />;
        }
        return this.props.children;
    }
}

export default StatsErrorBoundary;