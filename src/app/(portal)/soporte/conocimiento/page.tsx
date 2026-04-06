"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Search, BookOpen, FileText, Plus, ThumbsUp, BarChart3, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { api, isDemoMode } from "@/lib/api-client"

interface Article {
  id: string
  title: string
  category: string
  content: string
  views: number
  helpful: number
  updatedAt: string
}

const categories = [
  { name: "Transferencias", articles: 12, icon: "💸" },
  { name: "Cuenta SAYO", articles: 8, icon: "🏦" },
  { name: "Tarjeta", articles: 6, icon: "💳" },
  { name: "Créditos", articles: 10, icon: "📊" },
  { name: "Seguridad", articles: 5, icon: "🔒" },
  { name: "App Móvil", articles: 7, icon: "📱" },
]

const initialArticles: Article[] = [
  { id: "ART-001", title: "¿Cómo realizar una transferencia SPEI?", category: "Transferencias", views: 2340, helpful: 92, updatedAt: "2024-03-01", content: "Para realizar una transferencia SPEI desde tu cuenta SAYO: 1) Ingresa a la sección Transferencias, 2) Selecciona SPEI como método, 3) Ingresa la CLABE del destinatario, 4) Confirma el monto y concepto, 5) Valida con tu NIP de seguridad." },
  { id: "ART-002", title: "Límites de transferencia por tipo de cuenta", category: "Transferencias", views: 1890, helpful: 88, updatedAt: "2024-02-28", content: "Los límites diarios varían: Cuenta Básica $8,000 MXN, Cuenta Plus $50,000 MXN, Cuenta Premium $250,000 MXN. Los límites mensuales son 3x el diario." },
  { id: "ART-003", title: "¿Qué hacer si mi transferencia no llega?", category: "Transferencias", views: 3450, helpful: 85, updatedAt: "2024-03-05", content: "Si tu transferencia no ha llegado en 30 minutos: 1) Verifica la CLABE destino, 2) Revisa tu comprobante de operación, 3) Contacta a soporte con tu número de referencia. Las transferencias SPEI se procesan en minutos pero pueden tomar hasta 24h en horarios no bancarios." },
  { id: "ART-004", title: "Cómo activar/desactivar mi tarjeta", category: "Tarjeta", views: 1200, helpful: 95, updatedAt: "2024-02-20", content: "Puedes gestionar tu tarjeta desde la app: 1) Ve a la sección Tarjeta, 2) Usa el switch de activación, 3) Confirma con tu NIP. También puedes bloquear temporalmente o reportar robo/extravío." },
  { id: "ART-005", title: "Documentos para apertura de cuenta", category: "Cuenta SAYO", views: 980, helpful: 90, updatedAt: "2024-02-15", content: "Necesitas: 1) INE/IFE vigente (ambos lados), 2) Comprobante de domicilio (< 3 meses), 3) CURP, 4) Selfie con tu INE. Para cuenta empresarial también: RFC, Acta constitutiva, Poder notarial." },
  { id: "ART-006", title: "Cambiar mi NIP de acceso", category: "Seguridad", views: 2100, helpful: 93, updatedAt: "2024-03-03", content: "Para cambiar tu NIP: 1) Ve a Perfil > Seguridad, 2) Selecciona 'Cambiar NIP', 3) Ingresa tu NIP actual, 4) Ingresa el nuevo NIP (6 dígitos), 5) Confirma. Si olvidaste tu NIP, usa la opción 'Olvidé mi NIP' para recuperarlo via SMS." },
]

function ArticleSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3 animate-pulse">
        <div className="size-4 bg-muted rounded shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-56 bg-muted rounded" />
          <div className="h-3 w-40 bg-muted rounded" />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-3 w-12 bg-muted rounded" />
          <div className="h-3 w-10 bg-muted rounded" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function ConocimientoPage() {
  const [articles, setArticles] = React.useState<Article[]>(initialArticles)
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)
  const [selectedArticle, setSelectedArticle] = React.useState<Article | null>(null)
  const [articleOpen, setArticleOpen] = React.useState(false)
  const [newOpen, setNewOpen] = React.useState(false)
  const [newForm, setNewForm] = React.useState({
    title: "",
    category: "Transferencias",
    content: "",
  })

  React.useEffect(() => {
    async function load() {
      if (isDemoMode) { setLoading(false); return }
      try {
        const result = await api.get<Article[]>("/api/v1/support/knowledge")
        if (Array.isArray(result)) setArticles(result)
      } catch { /* keep demo data */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const filteredArticles = articles.filter((a) => {
    const matchesSearch = searchTerm === "" ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || a.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleViewArticle = (article: Article) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === article.id ? { ...a, views: a.views + 1 } : a))
    )
    setSelectedArticle({ ...article, views: article.views + 1 })
    setArticleOpen(true)
  }

  const handleHelpful = (article: Article) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === article.id ? { ...a, helpful: Math.min(a.helpful + 1, 100) } : a))
    )
    if (selectedArticle?.id === article.id) {
      setSelectedArticle({ ...article, helpful: Math.min(article.helpful + 1, 100) })
    }
    toast.success("¡Gracias por tu feedback!", { description: `Artículo marcado como útil` })
  }

  const handleNewArticle = () => {
    if (!newForm.title || !newForm.content) {
      toast.error("Completa los campos requeridos")
      return
    }
    const newArticle: Article = {
      id: `ART-${String(articles.length + 1).padStart(3, "0")}`,
      title: newForm.title,
      category: newForm.category,
      content: newForm.content,
      views: 0,
      helpful: 0,
      updatedAt: new Date().toISOString().slice(0, 10),
    }
    setArticles([newArticle, ...articles])
    setNewOpen(false)
    setNewForm({ title: "", category: "Transferencias", content: "" })
    toast.success("Artículo creado", { description: `${newArticle.id} — ${newArticle.title}` })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Base de Conocimiento</h1>
          <p className="text-sm text-muted-foreground">FAQs y artículos de ayuda para agentes y clientes</p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="size-4 mr-1.5" /> Nuevo Artículo
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar artículos..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category filters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((c) => (
          <Card
            key={c.name}
            className={`cursor-pointer transition-colors ${selectedCategory === c.name ? "border-primary ring-1 ring-primary" : "hover:border-primary/50"}`}
            onClick={() => setSelectedCategory(selectedCategory === c.name ? null : c.name)}
          >
            <CardContent className="p-4 text-center">
              <p className="text-2xl mb-1">{c.icon}</p>
              <p className="text-xs font-semibold">{c.name}</p>
              <p className="text-[10px] text-muted-foreground">{c.articles} artículos</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCategory && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ArrowLeft className="size-3" />
            Todas las categorías
          </button>
          <Badge variant="outline">{selectedCategory} — {filteredArticles.length} artículos</Badge>
        </div>
      )}

      {/* Articles */}
      <div>
        <h2 className="text-sm font-semibold mb-3">
          {selectedCategory ? `Artículos: ${selectedCategory}` : searchTerm ? "Resultados de búsqueda" : "Artículos Populares"}
        </h2>
        <div className="space-y-2">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ArticleSkeleton key={i} />)
            : filteredArticles.map((a) => (
              <Card key={a.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewArticle(a)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <FileText className="size-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.category} • {a.views.toLocaleString()} vistas • {a.helpful}% útil • Act: {a.updatedAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <BarChart3 className="size-3" />
                      {a.views.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-sayo-green">
                      <ThumbsUp className="size-3" />
                      {a.helpful}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          }
          {!loading && filteredArticles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="size-8 mx-auto mb-2" />
              <p className="text-sm">No se encontraron artículos</p>
              <p className="text-xs">Intenta con otra búsqueda o categoría</p>
            </div>
          )}
        </div>
      </div>

      {/* Article Detail Dialog */}
      <Dialog open={articleOpen} onOpenChange={setArticleOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedArticle?.title}</DialogTitle>
            <DialogDescription>
              {selectedArticle?.category} • {selectedArticle?.id} • Act: {selectedArticle?.updatedAt}
            </DialogDescription>
          </DialogHeader>
          {selectedArticle && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 text-sm">
                <div className="flex items-center gap-1">
                  <BarChart3 className="size-3 text-muted-foreground" />
                  <span>{selectedArticle.views.toLocaleString()} vistas</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="size-3 text-sayo-green" />
                  <span>{selectedArticle.helpful}% útil</span>
                </div>
                <Badge variant="outline" className="text-[10px]">{selectedArticle.category}</Badge>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm leading-relaxed whitespace-pre-line">{selectedArticle.content}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => selectedArticle && handleHelpful(selectedArticle)}>
              <ThumbsUp className="size-3.5 mr-1" /> Útil
            </Button>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Article Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Artículo</DialogTitle>
            <DialogDescription>Crear artículo en la base de conocimiento</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Título *</label>
              <Input placeholder="Ej: ¿Cómo activar notificaciones?" value={newForm.title} onChange={(e) => setNewForm({ ...newForm, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Categoría</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {categories.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setNewForm({ ...newForm, category: c.name })}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                      newForm.category === c.name ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {c.icon} {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Contenido *</label>
              <Input placeholder="Escribe el contenido del artículo..." value={newForm.content} onChange={(e) => setNewForm({ ...newForm, content: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleNewArticle}>
              <Plus className="size-3.5 mr-1" /> Crear Artículo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
