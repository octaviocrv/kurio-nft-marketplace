import { createFileRoute } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const Route = createFileRoute('/_tabs/')({
  component: HomePage,
})

// TEMPORÁRIO (tarefa 1.2): vitrine do tema para homologação. Vira a tela de Início na 1.7.
function HomePage() {
  return (
    <main className="mx-auto flex max-w-[390px] flex-col gap-8 px-6 py-10">
      <h1 className="text-2xl font-bold">Tema Kurio</h1>

      <section className="flex flex-col gap-3">
        <Button size="lg" className="rounded-full">Comprar NFT</Button>
        <Button>Entrar</Button>
        <Button variant="outline">Continuar com Google</Button>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" size="icon" className="rounded-full" aria-label="Favoritar">
            <Heart />
          </Button>
          <Button variant="link">Esqueceu a senha?</Button>
          <Button disabled>Desabilitado</Button>
        </div>
        <p className="text-lg font-bold text-highlight">1.19 ETH</p>
      </section>

      <section className="flex flex-col gap-3">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" placeholder="contato@email.com" />
        <Input aria-invalid placeholder="Campo com erro" />
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Listados recentemente</SelectItem>
            <SelectItem value="price-asc">Menor preço</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <section className="flex flex-wrap gap-2">
        <Badge>RARO</Badge>
        <Badge variant="outline">1/50</Badge>
        <Badge variant="secondary">Polygon</Badge>
        <Badge variant="destructive">Esgotado</Badge>
      </section>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todos os NFTs</TabsTrigger>
          <TabsTrigger value="new">Novos lançamentos</TabsTrigger>
          <TabsTrigger value="hot">Em alta</TabsTrigger>
        </TabsList>
      </Tabs>

      <RadioGroup defaultValue="reserve" className="rounded-xl bg-card p-4">
        <div className="flex items-center gap-3">
          <RadioGroupItem value="reserve" id="reserve" />
          <Label htmlFor="reserve">Reserva</Label>
        </div>
        <div className="flex items-center gap-3">
          <RadioGroupItem value="main" id="main" />
          <Label htmlFor="main">Principal</Label>
        </div>
      </RadioGroup>

      <section className="grid grid-cols-2 gap-4">
        <Skeleton className="aspect-square" />
        <Skeleton className="aspect-square" />
      </section>

      <section className="flex gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Abrir modal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Entrar</DialogTitle>
              <DialogDescription>Entre para gerenciar sua carteira.</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Abrir filtros</Button>
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>Coleção, rede e faixa de preço.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </section>
    </main>
  )
}
