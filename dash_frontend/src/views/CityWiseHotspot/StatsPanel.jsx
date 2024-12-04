import React from 'react';

const StatsPanel = ({ stats }) => (
    <div>
        <h3>City Stats</h3>
        <pre>{JSON.stringify(stats, null, 2)}</pre>
    </div>
);

export default StatsPanel;
