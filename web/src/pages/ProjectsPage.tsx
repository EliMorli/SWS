import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchProjects, apiCreateProject } from '../lib/api'
import { formatCurrency, statusColor } from '../lib/format'
import { FolderKanban, MapPin, Building2, ArrowRight } from 'lucide-react'
import Modal from '../components/ui/Modal'

export default function ProjectsPage() {
  const queryClient = useQueryClient()
  const [showNew, setShowNew] = useState(false)

  const { data } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  })

  const projects = data || []

  const createMutation = useMutation({
    mutationFn: (input: Parameters<typeof apiCreateProject>[0]) => apiCreateProject(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setShowNew(false)
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-sws-navy">Projects</h1>
          <p className="text-sm text-gray-500">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowNew(true)}>+ New Project</button>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="card hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FolderKanban size={20} className="text-sws-gold" />
                  <h2 className="text-lg font-bold text-sws-navy group-hover:text-sws-blue transition-colors">
                    {project.name}
                  </h2>
                  <span className={`badge ${statusColor(project.status)}`}>{project.status}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {project.address}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 size={14} /> GC: {project.gc_name}
                  </span>
                </div>

                {/* Financial Summary Bar */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Original Contract</p>
                    <p className="text-sm font-semibold">{formatCurrency(project.original_contract)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Revised Contract</p>
                    <p className="text-sm font-semibold text-sws-navy">{formatCurrency(project.revised_contract)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Total Billed</p>
                    <p className="text-sm font-semibold text-blue-600">{formatCurrency(project.total_billed)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Total Paid</p>
                    <p className="text-sm font-semibold text-green-600">{formatCurrency(project.total_paid)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Outstanding</p>
                    <p className="text-sm font-semibold text-amber-600">{formatCurrency(project.outstanding)}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Collection Progress</span>
                    <span>{project.revised_contract > 0 ? ((project.total_paid / project.revised_contract) * 100).toFixed(1) : '0.0'}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sws-gold to-green-500 rounded-full transition-all"
                      style={{ width: `${project.revised_contract > 0 ? Math.min((project.total_paid / project.revised_contract) * 100, 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <ArrowRight size={20} className="text-gray-300 group-hover:text-sws-gold transition-colors mt-2 ml-4" />
            </div>
          </Link>
        ))}
      </div>

      {/* New Project Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Project">
        <NewProjectForm
          onSubmit={(data) => createMutation.mutate(data)}
          loading={createMutation.isPending}
        />
      </Modal>
    </div>
  )
}

function NewProjectForm({ onSubmit, loading }: {
  onSubmit: (data: { name: string; project_number: string; address: string; gc_name: string; original_contract: number; retention_pct: number }) => void
  loading: boolean
}) {
  const [form, setForm] = useState({
    name: '', project_number: '', address: '', gc_name: '',
    original_contract: '', retention_pct: '10',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...form,
      original_contract: parseFloat(form.original_contract) || 0,
      retention_pct: parseFloat(form.retention_pct) || 10,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
        <input type="text" required className="input" placeholder="e.g. 200 Wilshire Tower"
          value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Project Number</label>
        <input type="text" required className="input" placeholder="e.g. WIL-2025-001"
          value={form.project_number} onChange={e => setForm(f => ({ ...f, project_number: e.target.value }))} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <input type="text" required className="input" placeholder="200 Wilshire Blvd, Santa Monica, CA 90401"
          value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">General Contractor</label>
        <input type="text" required className="input" placeholder="e.g. Turner Construction"
          value={form.gc_name} onChange={e => setForm(f => ({ ...f, gc_name: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Original Contract ($)</label>
          <input type="number" required step="0.01" min="0" className="input" placeholder="750000"
            value={form.original_contract} onChange={e => setForm(f => ({ ...f, original_contract: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Retention %</label>
          <input type="number" step="0.5" min="0" max="100" className="input" placeholder="10"
            value={form.retention_pct} onChange={e => setForm(f => ({ ...f, retention_pct: e.target.value }))} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating...' : 'Create Project'}
        </button>
      </div>
    </form>
  )
}
