import './Loader.css'

export default function Loader({ text = 'Processing...', sub = '' }) {
  return (
    <div className="loader-wrap">
      <div className="loader-ring">
        <div />
        <div />
        <div />
        <div />
      </div>
      <div className="loader-text">{text}</div>
      {sub && <div className="loader-sub">{sub}</div>}
    </div>
  )
}