export function ReadingStatus({ loading, failures, retry, hasData }) {
  return <div className="reading-status">
    <span role="status"><i data-state={failures.length ? 'warning' : loading ? 'loading' : 'ready'} />
      {loading ? (hasData ? 'Checking for newer readings…' : 'Fetching station readings…')
        : failures.length ? ('Could not refresh ' + failures.join(', ') + (hasData ? '. Showing available readings.' : '.'))
        : hasData ? 'Latest available station readings' : 'No station readings available yet.'}
    </span>
    {failures.length > 0 && <button type="button" onClick={retry} disabled={loading}>Retry</button>}
  </div>;
}
