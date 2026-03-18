"use client"

import { MultiTabForm, type FormTab } from "@/components/forms/multi-tab-form"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const pmTabs: FormTab[] = [
  {
    label: "Empresa",
    description: "Datos generales de la empresa",
    fields: [
      { name: "razon_social", label: "Razon Social", type: "text", placeholder: "Comercializadora ABC S.A. de C.V.", required: true, span: 2 },
      { name: "rfc_empresa", label: "RFC", type: "text", placeholder: "CAB200101AB1", required: true },
      { name: "fecha_constitución", label: "Fecha de Constitución", type: "date", required: true },
      { name: "objeto_social", label: "Objeto Social", type: "textarea", placeholder: "Compra-venta de mercancia en general...", required: true, span: 2 },
      { name: "giro", label: "Giro", type: "select", options: [
        { value: "comercio", label: "Comercio" },
        { value: "servicios", label: "Servicios" },
        { value: "manufactura", label: "Manufactura" },
        { value: "construccion", label: "Construccion" },
        { value: "tecnologia", label: "Tecnologia" },
        { value: "alimentos", label: "Alimentos y Bebidas" },
        { value: "otro", label: "Otro" },
      ], required: true },
      { name: "sector", label: "Sector", type: "select", options: [
        { value: "privado", label: "Sector Privado" },
        { value: "publico", label: "Sector Publico" },
        { value: "social", label: "Sector Social" },
      ], required: true },
      { name: "domicilio_fiscal", label: "Domicilio Fiscal", type: "text", placeholder: "Av. Industria 456, Col. Industrial", required: true, span: 2 },
      { name: "cp_empresa", label: "Código Postal", type: "text", placeholder: "06600", required: true },
      { name: "ciudad_empresa", label: "Ciudad", type: "text", placeholder: "Ciudad de Mexico", required: true },
      { name: "estado_empresa", label: "Estado", type: "select", options: [
        { value: "cdmx", label: "Ciudad de Mexico" },
        { value: "edomex", label: "Estado de Mexico" },
        { value: "jalisco", label: "Jalisco" },
        { value: "nuevo_leon", label: "Nuevo Leon" },
        { value: "otro", label: "Otro" },
      ], required: true },
      { name: "telefono_empresa", label: "Teléfono", type: "tel", placeholder: "55 1234 5678", required: true },
      { name: "email_empresa", label: "Correo Electronico", type: "email", placeholder: "contacto@empresa.com", required: true },
    ],
  },
  {
    label: "Notarial",
    description: "Datos de escritura constitutiva",
    fields: [
      { name: "num_escritura", label: "Número de Escritura", type: "text", placeholder: "12345", required: true },
      { name: "fecha_escritura", label: "Fecha de Escritura", type: "date", required: true },
      { name: "notario", label: "Nombre del Notario", type: "text", placeholder: "Lic. Roberto Martinez", required: true },
      { name: "num_notaria", label: "Número de Notaria", type: "text", placeholder: "45", required: true },
      { name: "ciudad_notaria", label: "Ciudad de la Notaria", type: "text", placeholder: "Ciudad de Mexico" },
      { name: "folio_mercantil", label: "Folio Mercantil", type: "text", placeholder: "N-2020-012345" },
      { name: "modificaciones", label: "Modificaciones a Escritura", type: "textarea", placeholder: "Listar modificaciones relevantes (aumento de capital, cambio de objeto social, etc.)", span: 2 },
      { name: "inscripcion_rpc", label: "Inscripcion en Registro Publico de Comercio", type: "select", options: [
        { value: "si", label: "Si" },
        { value: "no", label: "No" },
        { value: "en_tramite", label: "En Tramite" },
      ] },
    ],
  },
  {
    label: "Rep. Legal",
    description: "Datos del representante legal",
    fields: [
      { name: "rep_nombre", label: "Nombre Completo", type: "text", placeholder: "Juan Carlos Garcia Lopez", required: true, span: 2 },
      { name: "rep_rfc", label: "RFC", type: "text", placeholder: "GALJ850101AB1", required: true },
      { name: "rep_curp", label: "CURP", type: "text", placeholder: "GALJ850101HDFPRL09", required: true },
      { name: "rep_fecha_nacimiento", label: "Fecha de Nacimiento", type: "date", required: true },
      { name: "rep_nacionalidad", label: "Nacionalidad", type: "select", options: [
        { value: "mexicana", label: "Mexicana" },
        { value: "extranjera", label: "Extranjera" },
      ], required: true },
      { name: "rep_identificación", label: "Tipo de Identificación", type: "select", options: [
        { value: "ine", label: "INE / IFE" },
        { value: "pasaporte", label: "Pasaporte" },
        { value: "cedula", label: "Cedula Profesional" },
      ], required: true },
      { name: "rep_num_id", label: "Número de Identificación", type: "text", placeholder: "1234567890", required: true },
      { name: "rep_domicilio", label: "Domicilio", type: "text", placeholder: "Calle y numero, colonia, CP", span: 2 },
      { name: "rep_telefono", label: "Teléfono", type: "tel", placeholder: "55 1234 5678", required: true },
      { name: "rep_email", label: "Correo Electronico", type: "email", placeholder: "rep@email.com", required: true },
      { name: "poder_notarial", label: "Número de Poder Notarial", type: "text", placeholder: "54321" },
      { name: "alcance_poder", label: "Alcance del Poder", type: "select", options: [
        { value: "actos_administración", label: "Actos de Administración" },
        { value: "actos_dominio", label: "Actos de Dominio" },
        { value: "ambos", label: "Ambos" },
        { value: "especial", label: "Poder Especial" },
      ] },
    ],
  },
  {
    label: "Operaciones",
    description: "Información operativa de la empresa",
    fields: [
      { name: "actividad_principal", label: "Actividad Principal", type: "text", placeholder: "Distribucion de productos de consumo", required: true, span: 2 },
      { name: "ventas_anuales", label: "Ventas Anuales", type: "currency", placeholder: "15000000", required: true },
      { name: "num_empleados", label: "Número de Empleados", type: "number", placeholder: "50", required: true },
      { name: "principales_clientes", label: "Principales Clientes", type: "textarea", placeholder: "1. Cliente A — 30%\n2. Cliente B — 20%\n3. Cliente C — 15%", span: 2 },
      { name: "principales_proveedores", label: "Principales Proveedores", type: "textarea", placeholder: "1. Proveedor X\n2. Proveedor Y\n3. Proveedor Z", span: 2 },
      { name: "anios_operación", label: "Anios de Operación", type: "number", placeholder: "10" },
      { name: "sucursales", label: "Número de Sucursales", type: "number", placeholder: "3" },
    ],
  },
  {
    label: "Benef. Real",
    description: "Beneficiario real de la empresa (>25%)",
    fields: [
      { name: "ben_nombre", label: "Nombre Completo del Beneficiario Real", type: "text", placeholder: "Juan Carlos Garcia Lopez", required: true, span: 2 },
      { name: "ben_rfc", label: "RFC", type: "text", placeholder: "GALJ850101AB1", required: true },
      { name: "ben_curp", label: "CURP", type: "text", placeholder: "GALJ850101HDFPRL09", required: true },
      { name: "ben_fecha_nacimiento", label: "Fecha de Nacimiento", type: "date", required: true },
      { name: "ben_nacionalidad", label: "Nacionalidad", type: "select", options: [
        { value: "mexicana", label: "Mexicana" },
        { value: "extranjera", label: "Extranjera" },
      ], required: true },
      { name: "ben_porcentaje", label: "Porcentaje de Participacion", type: "number", placeholder: "51", required: true },
      { name: "ben_domicilio", label: "Domicilio", type: "text", placeholder: "Calle y numero, colonia, CP", span: 2 },
      { name: "ben_pais_residencia", label: "Pais de Residencia Fiscal", type: "select", options: [
        { value: "mexico", label: "Mexico" },
        { value: "usa", label: "Estados Unidos" },
        { value: "otro", label: "Otro" },
      ] },
      { name: "ben_es_pep", label: "Es PEP?", type: "select", options: [
        { value: "no", label: "No" },
        { value: "si", label: "Si" },
      ] },
    ],
  },
  {
    label: "Garantias",
    description: "Garantias ofrecidas para el credito",
    fields: [
      { name: "tipo_garantia", label: "Tipo de Garantia", type: "select", options: [
        { value: "hipotecaria", label: "Hipotecaria" },
        { value: "prendaria", label: "Prendaria" },
        { value: "fianza", label: "Fianza / Aval" },
        { value: "liquida", label: "Garantia Liquida" },
        { value: "sin_garantia", label: "Sin Garantia" },
      ], required: true },
      { name: "valor_garantia", label: "Valor de la Garantia", type: "currency", placeholder: "2000000" },
      { name: "descripcion_garantia", label: "Descripcion de la Garantia", type: "textarea", placeholder: "Inmueble comercial ubicado en...", span: 2 },
      { name: "aval_nombre", label: "Nombre del Aval (si aplica)", type: "text", placeholder: "Roberto Garcia" },
      { name: "aval_rfc", label: "RFC del Aval", type: "text", placeholder: "GARR800101AB1" },
      { name: "aval_relacion", label: "Relacion con la Empresa", type: "text", placeholder: "Socio mayoritario" },
      { name: "documentos_garantia", label: "Documentos de Garantia Disponibles", type: "textarea", placeholder: "Escrituras, avaluos, facturas de equipo, etc.", span: 2 },
    ],
  },
  {
    label: "PLD",
    description: "Prevencion de Lavado de Dinero",
    fields: [
      { name: "origen_recursos_empresa", label: "Origen de los Recursos de la Empresa", type: "select", options: [
        { value: "ventas", label: "Ventas de Productos/Servicios" },
        { value: "contratos", label: "Contratos Gubernamentales" },
        { value: "exportaciones", label: "Exportaciones" },
        { value: "inversiones", label: "Inversiones" },
        { value: "otro", label: "Otro" },
      ], required: true },
      { name: "destino_credito", label: "Destino del Crédito", type: "select", options: [
        { value: "capital_trabajo", label: "Capital de Trabajo" },
        { value: "adquisicion_activos", label: "Adquisicion de Activos" },
        { value: "reestructura", label: "Reestructura de Pasivos" },
        { value: "expansion", label: "Expansion" },
        { value: "otro", label: "Otro" },
      ], required: true },
      { name: "opera_con_extranjero", label: "Opera con Empresas Extranjeras?", type: "select", options: [
        { value: "no", label: "No" },
        { value: "si", label: "Si" },
      ], required: true },
      { name: "paises_operación", label: "Paises con los que Opera (si aplica)", type: "text", placeholder: "USA, Canada" },
      { name: "volumen_mensual_operaciones", label: "Volumen Mensual de Operaciones", type: "currency", placeholder: "1000000" },
      { name: "proposito_credito_pm", label: "Proposito Detallado del Crédito", type: "textarea", placeholder: "Describir el uso especifico...", required: true, span: 2 },
      { name: "acepta_pld_pm", label: "Declaración PLD", type: "checkbox", placeholder: "La empresa declara que la información proporcionada es verídica y consiente la verificación" },
    ],
  },
  {
    label: "Resumen",
    description: "Revision final antes de enviar",
    fields: [
      { name: "monto_solicitado", label: "Monto Solicitado", type: "currency", placeholder: "2000000", required: true },
      { name: "plazo_solicitado", label: "Plazo Solicitado (meses)", type: "number", placeholder: "36", required: true },
      { name: "producto_pm", label: "Producto de Crédito", type: "select", options: [
        { value: "cuenta_corriente", label: "Crédito Cuenta Corriente" },
        { value: "simple", label: "Crédito Simple" },
        { value: "arrendamiento", label: "Arrendamiento" },
        { value: "factoraje", label: "Factoraje" },
      ], required: true },
      { name: "comentarios_pm", label: "Comentarios Adicionales", type: "textarea", placeholder: "Información adicional relevante...", span: 2 },
      { name: "acepta_terminos_pm", label: "Acepto terminos y condiciones", type: "checkbox", placeholder: "He leido y acepto los terminos y el aviso de privacidad", required: true },
      { name: "autoriza_buro_pm", label: "Autorizo consulta a Buro de Crédito", type: "checkbox", placeholder: "Autorizo la consulta del historial crediticio de la empresa", required: true },
    ],
  },
]

export default function SolicitudPMPage() {
  const router = useRouter()

  const handleSubmit = (data: Record<string, unknown>) => {
    toast.success("Solicitud PM enviada a validación", {
      description: `${data.razon_social} — ${data.producto_pm}`,
    })
    router.push("/originacion/validación")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Solicitud de Crédito — Persona Moral (PM)</h1>
        <p className="text-sm text-muted-foreground">Complete los 8 pasos para enviar la solicitud a validación</p>
      </div>

      <MultiTabForm
        tabs={pmTabs}
        onSubmit={handleSubmit}
        submitLabel="Enviar a Validación"
      />
    </div>
  )
}
