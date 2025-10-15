const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

// Enhanced performance monitoring
export const logPerformanceMetrics = (metric) => {
  console.log('Performance Metric:', metric);
  
  // Send to analytics if needed
  if (process.env.NODE_ENV === 'production') {
    // You can send metrics to your analytics service here
    // Example: analytics.track('performance', metric);
  }
};

// Monitor Core Web Vitals
export const monitorCoreWebVitals = () => {
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(logPerformanceMetrics);
    getFID(logPerformanceMetrics);
    getFCP(logPerformanceMetrics);
    getLCP(logPerformanceMetrics);
    getTTFB(logPerformanceMetrics);
  });
};

export default reportWebVitals;
