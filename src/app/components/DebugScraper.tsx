'use client';

import { useState } from 'react';

export default function DebugScraper() {
    const [url, setUrl] = useState('https://www.currys.co.uk/products/samsung-galaxy-s24-256-gb-onyx-black-10267206.html');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testUrl = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/debug-scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ marginTop: 'var(--space-lg)' }}>
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">🔧 Debug Price Scraper</h3>
                </div>

                <div className="form-group">
                    <label className="form-label">URL to Test</label>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="form-input"
                        placeholder="Enter URL to debug"
                    />
                </div>

                <button
                    onClick={testUrl}
                    disabled={loading || !url}
                    className={`btn ${loading ? 'btn-outline' : 'btn-primary'}`}
                >
                    {loading ? '🔄 Testing...' : '🧪 Test URL'}
                </button>
            </div>

            {result && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            {result.error ? '❌ Error' : '✅ Results'}
                        </h3>
                    </div>

                    {result.error ? (
                        <div style={{ color: 'var(--danger)' }}>
                            <strong>Error:</strong> {result.error}
                            {result.details && <><br /><strong>Details:</strong> {result.details}</>}
                        </div>
                    ) : (
                        <div>
                            <div style={{ marginBottom: 'var(--space-md)' }}>
                                <strong>Found Price:</strong>
                                <span className={result.foundPrice ? 'text-success' : 'text-danger'} style={{ marginLeft: 'var(--space-sm)', fontWeight: 'bold' }}>
                                    {result.foundPrice || 'No price found'}
                                </span>
                            </div>

                            {result.debugResults && result.debugResults.length > 0 && (
                                <div style={{ marginBottom: 'var(--space-lg)' }}>
                                    <h4>🎯 Selector Matches ({result.debugResults.length})</h4>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius-md)', padding: 'var(--space-sm)' }}>
                                        {result.debugResults.map((item: any, index: number) => (
                                            <div key={index} style={{ marginBottom: 'var(--space-sm)', padding: 'var(--space-sm)', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)' }}>
                                                <div><strong>Selector:</strong> <code>{item.selector}</code></div>
                                                {item.text && <div><strong>Text:</strong> {item.text}</div>}
                                                {item.content && <div><strong>Content:</strong> {item.content}</div>}
                                                {item.dataPrice && <div><strong>Data-Price:</strong> {item.dataPrice}</div>}
                                                {item.value && <div><strong>Value:</strong> {item.value}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {result.regexMatches && result.regexMatches.length > 0 && (
                                <div style={{ marginBottom: 'var(--space-lg)' }}>
                                    <h4>🔍 Regex Matches</h4>
                                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius-md)', padding: 'var(--space-sm)' }}>
                                        {result.regexMatches.map((item: any, index: number) => (
                                            <div key={index} style={{ marginBottom: 'var(--space-sm)' }}>
                                                <div><strong>Pattern:</strong> {item.pattern}</div>
                                                <div><strong>Matches:</strong> {item.matches.join(', ')}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {result.htmlPreview && (
                                <div>
                                    <h4>📄 HTML Preview (First 1000 chars)</h4>
                                    <div style={{
                                        background: 'var(--gray-100)',
                                        padding: 'var(--space-sm)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '0.875rem',
                                        fontFamily: 'monospace',
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {result.htmlPreview}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}