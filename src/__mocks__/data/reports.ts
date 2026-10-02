import type { IReportSubmission } from '@/interfaces/IReport'

const reports = new Map<string, IReportSubmission[]>()

export function resetMockReports() {
  reports.clear()
}

export function addMockReport(websiteId: string, report: IReportSubmission) {
  reports.set(websiteId, [...(reports.get(websiteId) ?? []), report])
}

export function getMockReports(websiteId: string) {
  return reports.get(websiteId) ?? []
}
