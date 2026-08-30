import { CONDITIONS, LAYER_META, type Condition, type JobHeader, type LayerType, type Site, type Station } from '../types'

interface Props {
  site: Site
  selectedId: string | null
  onSelect: (id: string) => void
  onHeaderChange: (h: JobHeader) => void
  onStationChange: (id: string, patch: Partial<Pick<Station, 'label' | 'product' | 'condition'>>) => void
  onStationDelete: (id: string) => void
}

export default function RegisterPanel({
  site,
  selectedId,
  onSelect,
  onHeaderChange,
  onStationChange,
  onStationDelete,
}: Props) {
  const h = site.header
  const set = (patch: Partial<JobHeader>) => onHeaderChange({ ...h, ...patch })

  const groups = (['rodent', 'trelona'] as LayerType[]).map(layer => ({
    layer,
    stations: site.stations.filter(st => st.layer === layer).sort((a, b) => a.num - b.num),
  }))

  return (
    <div className="register">
      <h2>Job &amp; Station Register</h2>
      <div className="scroll">
        <div className="job-fields">
          <label className="wide">
            Site
            <input value={h.siteName} onChange={e => set({ siteName: e.target.value })} />
          </label>
          <label className="wide">
            Address
            <input value={h.address} onChange={e => set({ address: e.target.value })} />
          </label>
          <label>
            Technician
            <input value={h.technician} onChange={e => set({ technician: e.target.value })} />
          </label>
          <label>
            Product
            <input value={h.product} onChange={e => set({ product: e.target.value })} />
          </label>
          <label>
            Date
            <input type="date" value={h.date} onChange={e => set({ date: e.target.value })} />
          </label>
        </div>

        {site.stations.length === 0 && (
          <div className="empty-note">
            No stations yet. Turn <b>Place ON</b>, pick a layer, and click the map to drop numbered
            stations. Rows will appear here automatically.
          </div>
        )}

        {groups.map(
          g =>
            g.stations.length > 0 && (
              <div key={g.layer}>
                <div className="group-title">
                  <span className={`swatch ${g.layer}`} />
                  {LAYER_META[g.layer].typeLabel}s ({g.stations.length})
                </div>
                {g.stations.map(st => (
                  <div
                    key={st.id}
                    className={`reg-row${selectedId === st.id ? ' selected' : ''}`}
                    onClick={() => onSelect(st.id)}
                  >
                    <span className={`reg-num ${st.layer}`}>{st.num}</span>
                    <div className="reg-fields">
                      <input
                        placeholder="Location, e.g. Building 4 – SW corner"
                        value={st.label}
                        onChange={e => onStationChange(st.id, { label: e.target.value })}
                      />
                      <div className="pair">
                        <input
                          placeholder="Product"
                          value={st.product}
                          onChange={e => onStationChange(st.id, { product: e.target.value })}
                        />
                        <select
                          value={st.condition}
                          onChange={e => onStationChange(st.id, { condition: e.target.value as Condition })}
                        >
                          {CONDITIONS.map(c => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {selectedId === st.id && (
                      <button
                        className="del"
                        style={{ gridColumn: '1 / -1', justifySelf: 'end' }}
                        onClick={e => {
                          e.stopPropagation()
                          onStationDelete(st.id)
                        }}
                      >
                        Remove station {st.num}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ),
        )}
      </div>
    </div>
  )
}
