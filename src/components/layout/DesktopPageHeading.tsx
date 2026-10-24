import { Breadcrumb } from './Breadcrumb'

/** Trilha + título das telas de tablet/desktop. No mobile o título fica no PageHeader (com o voltar). */
export function DesktopPageHeading({ title, crumb }: { title: string; crumb: string }) {
  return (
    <div className="hidden flex-col gap-4 md:flex">
      <Breadcrumb current={crumb} />
      <h1 className="text-xl font-bold">{title}</h1>
    </div>
  )
}
