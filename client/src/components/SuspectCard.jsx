export default function SuspectCard({ suspect, onInvestigate }) {
  return (
    <div className="suspect-card">
      <div className="avatar">{suspect.avatar}</div>
      <h3>{suspect.name}</h3>
      <p className="role">{suspect.role}</p>
      <div className="suspicion">
        Suspicion:
        <span className="dots">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={n <= suspect.suspicion ? "dot on" : "dot"} />
          ))}
        </span>
      </div>
      <button className="btn btn-small" onClick={() => onInvestigate(suspect)}>Investigate</button>
    </div>
  );
}
