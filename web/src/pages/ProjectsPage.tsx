import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchProjects } from '../lib/api'
import { formatCurrency, statusColor } from '../lib/format'
import { FolderKanban, MapPin, Building2, ArrowRight } from 'lucide-react'

const MOCK_PROJECTS = [
  {
    id: 'hartford-001',
    name: '495 Hartford Apartments',
    project_number: 'HTF-2022-001',
    address: '1441 W. 5th Street, Los Angeles, CA, 90017',
    gc_name: 'Fassberg Construction Company',
    status: 'active',
    revised_contract: 1133005.20,
    total_billed: 1157965.20,
    total_paid: 966182.81,
    outstanding: 191782.39,
    retention_pct: 10.0,
    original_contract: 865000.00,
  },
]

export default function ProjectsPage() {
  const { data } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  })

  const projects = data || MOCK_PROJECTS

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-sws-navy">Projects</h1>
          <p className="text-sm text-gray-500">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary">+ New Project</button>
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
                    <span>{((project.total_paid / project.revised_contract) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sws-gold to-green-500 rounded-full transition-all"
                      style={{ width: `${Math.min((project.total_paid / project.revised_contract) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <ArrowRight size={20} className="text-gray-300 group-hover:text-sws-gold transition-colors mt-2 ml-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
