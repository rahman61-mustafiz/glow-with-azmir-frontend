// Status pills per design spec:
//   Active    -> black bg + gold text
//   Low stock -> amber (#FAEEDA bg / #854F0B text)

export default function StatusPill({ status }) {
  if (status === 'low') {
    return <span className="pill pill-low">● Low stock</span>
  }
  return <span className="pill pill-active">● Active</span>
}
