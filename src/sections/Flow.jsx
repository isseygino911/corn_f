import Process from './Process.jsx'
import Collections from './Collections.jsx'
import Farm from './Farm.jsx'
import Values from './Values.jsx'
import Pairings from './Pairings.jsx'
import Questions from './Questions.jsx'
import Footer from './Footer.jsx'

// Normal-flow sections after the pinned story; the opaque background hard-cuts over the fixed stage.
export default function Flow({ fallback }) {
  return (
    <div className="flow">
      {[Process, Collections, Farm, Values, Pairings, Questions, Footer].map((Section) => (
        <Section key={Section.name} fallback={fallback} />
      ))}
    </div>
  )
}
