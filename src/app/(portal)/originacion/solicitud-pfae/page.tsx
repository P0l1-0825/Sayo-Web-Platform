"use client"

import { MultiTabForm, type FormTab } from "@/components/forms/multi-tab-form"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const pfaeTabs: FormTab[] = [
  {
    label: "Identificación",
    description: "Datos personales y documento de identidad",
    fields: [
      { name: "nombre", label: "Nombre(s)", type: "text", placeholder: "Juan Carlos", required: true },
      { name: "apellido_paterno", label: "Apellido Paterno", type: "text", placeholder: "Garcia", required: true },
      { name: "apellido_materno", label: "Apellido Materno", type: "text", placeholder: "Lopez", required: true },
      { name: "rfc", label: "RFC", type: "text", placeholder: "GALJ850101AB1", required: true, pattern: /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/i, patternMessage: "RFC inválido (formato: XXXX000000XX0)" },
      { name: "curp", label: "CURP", type: "text", placeholder: "GALJ850101HDFPRL09", required: true, pattern: /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]\d$/i, patternMessage: "CURP inválido (18 caracteres)" },
      { name: "fecha_nacimiento", label: "Fecha de Nacimiento", type: "date", required: true },
      { name: "nacionalidad", label: "Nacionalidad", type: "select", options: [
        { value: "mexicana", label: "Mexicana" },
        { value: "extranjera", label: "Extranjera" },
      ], required: true },
      { name: "estado_civil", label: "Estado Civil", type: "select", options: [
        { value: "soltero", label: "Soltero(a)" },
        { value: "casado", label: "Casado(a)" },
        { value: "divorciado", label: "Divorciado(a)" },
        { value: "viudo", label: "Viudo(a)" },
        { value: "union_libre", label: "Union Libre" },
      ], required: true },
      { name: "tipo_identificación", label: "Tipo de Identificación", type: "select", options: [
        { value: "ine", label: "INE / IFE" },
        { value: "pasaporte", label: "Pasaporte" },
        { value: "cedula", label: "Cedula Profesional" },
      ], required: true },
      { name: "numero_identificación", label: "Número de Identificación", type: "text", placeholder: "1234567890", required: true },
      { name: "calle", label: "Calle y Número", type: "text", placeholder: "Av. Reforma 255, Int. 4", required: true, span: 2 },
      { name: "colonia", label: "Colonia", type: "text", placeholder: "Juarez", required: true },
      { name: "cp", label: "Código Postal", type: "text", placeholder: "06600", required: true, pattern: /^\d{5}$/, patternMessage: "Código postal debe ser de 5 dígitos" },
      { name: "ciudad", label: "Ciudad", type: "text", placeholder: "Ciudad de Mexico", required: true },
      { name: "estado", label: "Estado", type: "select", options: [
        { value: "cdmx", label: "Ciudad de Mexico" },
        { value: "edomex", label: "Estado de Mexico" },
        { value: "jalisco", label: "Jalisco" },
        { value: "nuevo_leon", label: "Nuevo Leon" },
        { value: "puebla", label: "Puebla" },
        { value: "otro", label: "Otro" },
      ], required: true },
    ],
  },
  {
    label: "Empleo",
    description: "Información laboral actual",
    fields: [
      { name: "ocupacion", label: "Ocupacion", type: "text", placeholder: "Empresario", required: true },
      { name: "empresa", label: "Empresa / Negocio", type: "text", placeholder: "Comercializadora ABC S.A. de C.V.", required: true },
      { name: "puesto", label: "Puesto", type: "text", placeholder: "Director General" },
      { name: "antiguedad_anios", label: "Antiguedad (anios)", type: "number", placeholder: "5", required: true },
      { name: "tipo_contrato", label: "Tipo de Contrato", type: "select", options: [
        { value: "independiente", label: "Independiente / Propio" },
        { value: "indefinido", label: "Contrato Indefinido" },
        { value: "temporal", label: "Contrato Temporal" },
        { value: "honorarios", label: "Honorarios" },
      ] },
      { name: "giro_actividad", label: "Giro / Actividad", type: "select", options: [
        { value: "comercio", label: "Comercio" },
        { value: "servicios", label: "Servicios" },
        { value: "manufactura", label: "Manufactura" },
        { value: "construccion", label: "Construccion" },
        { value: "agropecuario", label: "Agropecuario" },
        { value: "tecnologia", label: "Tecnologia" },
        { value: "otro", label: "Otro" },
      ] },
      { name: "dirección_empresa", label: "Dirección de la Empresa", type: "text", placeholder: "Av. Insurgentes Sur 1234", span: 2 },
      { name: "telefono_empresa", label: "Teléfono de la Empresa", type: "tel", placeholder: "55 1234 5678" },
    ],
  },
  {
    label: "Ingresos",
    description: "Información financiera y patrimonio",
    fields: [
      { name: "ingreso_mensual", label: "Ingreso Mensual Neto", type: "currency", placeholder: "50000", required: true, min: 1000, max: 50000000 },
      { name: "otros_ingresos", label: "Otros Ingresos Mensuales", type: "currency", placeholder: "10000" },
      { name: "fuente_otros_ingresos", label: "Fuente de Otros Ingresos", type: "text", placeholder: "Rentas, inversiones, etc." },
      { name: "gastos_mensuales", label: "Gastos Mensuales", type: "currency", placeholder: "30000", required: true },
      { name: "activos_totales", label: "Activos Totales", type: "currency", placeholder: "2000000" },
      { name: "pasivos_totales", label: "Pasivos Totales", type: "currency", placeholder: "500000" },
      { name: "patrimonio_neto", label: "Patrimonio Neto", type: "currency", placeholder: "1500000" },
      { name: "tiene_creditos_vigentes", label: "Créditos Vigentes", type: "select", options: [
        { value: "si", label: "Si" },
        { value: "no", label: "No" },
      ] },
      { name: "monto_creditos_vigentes", label: "Monto Créditos Vigentes", type: "currency", placeholder: "200000" },
    ],
  },
  {
    label: "Contacto",
    description: "Datos de contacto y referencias",
    fields: [
      { name: "telefono_celular", label: "Teléfono Celular", type: "tel", placeholder: "55 1234 5678", required: true },
      { name: "telefono_fijo", label: "Teléfono Fijo", type: "tel", placeholder: "55 9876 5432" },
      { name: "email", label: "Correo Electronico", type: "email", placeholder: "juan.garcia@email.com", required: true },
      { name: "ref1_nombre", label: "Referencia Personal 1 — Nombre", type: "text", placeholder: "Maria Hernandez", required: true, span: 2 },
      { name: "ref1_telefono", label: "Teléfono Ref. 1", type: "tel", placeholder: "55 1111 2222", required: true },
      { name: "ref1_parentesco", label: "Parentesco Ref. 1", type: "text", placeholder: "Hermana" },
      { name: "ref2_nombre", label: "Referencia Personal 2 — Nombre", type: "text", placeholder: "Carlos Perez", required: true, span: 2 },
      { name: "ref2_telefono", label: "Teléfono Ref. 2", type: "tel", placeholder: "55 3333 4444", required: true },
      { name: "ref2_parentesco", label: "Parentesco Ref. 2", type: "text", placeholder: "Amigo" },
      { name: "ref3_nombre", label: "Referencia Personal 3 — Nombre", type: "text", placeholder: "Ana Martinez", span: 2 },
      { name: "ref3_telefono", label: "Teléfono Ref. 3", type: "tel", placeholder: "55 5555 6666" },
      { name: "ref_com1_nombre", label: "Referencia Comercial 1 — Nombre", type: "text", placeholder: "Proveedor XYZ S.A.", span: 2 },
      { name: "ref_com1_telefono", label: "Teléfono Ref. Comercial 1", type: "tel", placeholder: "55 7777 8888" },
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
      { name: "valor_garantia", label: "Valor de la Garantia", type: "currency", placeholder: "1000000" },
      { name: "descripcion_garantia", label: "Descripcion de la Garantia", type: "textarea", placeholder: "Inmueble ubicado en...", span: 2 },
      { name: "aval_nombre", label: "Nombre del Aval (si aplica)", type: "text", placeholder: "Roberto Garcia" },
      { name: "aval_rfc", label: "RFC del Aval", type: "text", placeholder: "GARR800101AB1", pattern: /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/i, patternMessage: "RFC del aval inválido" },
      { name: "aval_telefono", label: "Teléfono del Aval", type: "tel", placeholder: "55 9999 0000" },
      { name: "documentos_garantia", label: "Documentos de Garantia Disponibles", type: "textarea", placeholder: "Escritura publica, avaluo, etc.", span: 2 },
    ],
  },
  {
    label: "PLD",
    description: "Prevencion de Lavado de Dinero",
    fields: [
      { name: "origen_recursos", label: "Origen de los Recursos", type: "select", options: [
        { value: "actividad_empresarial", label: "Actividad Empresarial" },
        { value: "salario", label: "Salario / Sueldo" },
        { value: "rentas", label: "Rentas" },
        { value: "inversiones", label: "Inversiones" },
        { value: "herencia", label: "Herencia" },
        { value: "otro", label: "Otro" },
      ], required: true },
      { name: "destino_recursos", label: "Destino del Crédito", type: "select", options: [
        { value: "capital_trabajo", label: "Capital de Trabajo" },
        { value: "adquisicion_activos", label: "Adquisicion de Activos" },
        { value: "reestructura_deuda", label: "Reestructura de Deuda" },
        { value: "expansion", label: "Expansion del Negocio" },
        { value: "otro", label: "Otro" },
      ], required: true },
      { name: "es_pep", label: "Es Persona Expuesta Politicamente (PEP)?", type: "select", options: [
        { value: "no", label: "No" },
        { value: "si", label: "Si" },
      ], required: true },
      { name: "relacion_pep", label: "Relacion con PEP (si aplica)", type: "text", placeholder: "Cargo o parentesco" },
      { name: "pais_origen_fondos", label: "Pais de Origen de los Fondos", type: "select", options: [
        { value: "mexico", label: "Mexico" },
        { value: "usa", label: "Estados Unidos" },
        { value: "otro", label: "Otro" },
      ], required: true },
      { name: "proposito_credito", label: "Proposito Detallado del Crédito", type: "textarea", placeholder: "Describir el uso especifico del credito...", required: true, span: 2 },
      { name: "acepta_declaracion_pld", label: "Declaro que la información proporcionada es verídica", type: "checkbox", placeholder: "Acepto los términos de PLD y consiento la verificación de mi información" },
    ],
  },
  {
    label: "Resumen",
    description: "Revision final antes de enviar",
    fields: [
      { name: "monto_solicitado", label: "Monto Solicitado", type: "currency", placeholder: "500000", required: true, min: 10000, max: 50000000 },
      { name: "plazo_solicitado", label: "Plazo Solicitado (meses)", type: "number", placeholder: "24", required: true, min: 3, max: 60 },
      { name: "producto", label: "Producto de Crédito", type: "select", options: [
        { value: "cuenta_corriente", label: "Crédito Cuenta Corriente" },
        { value: "simple", label: "Crédito Simple" },
        { value: "arrendamiento", label: "Arrendamiento" },
        { value: "factoraje", label: "Factoraje" },
      ], required: true },
      { name: "comentarios_adicionales", label: "Comentarios Adicionales", type: "textarea", placeholder: "Información adicional relevante para la solicitud...", span: 2 },
      { name: "acepta_terminos", label: "Acepto terminos y condiciones", type: "checkbox", placeholder: "He leido y acepto los términos, condiciones y el aviso de privacidad de SAYO", required: true },
      { name: "autoriza_buro", label: "Autorizo consulta a Buro de Crédito", type: "checkbox", placeholder: "Autorizo a Solvendom SOFOM E.N.R. a consultar mi historial crediticio", required: true },
    ],
  },
]

export default function SolicitudPFAEPage() {
  const router = useRouter()

  const handleSubmit = (data: Record<string, unknown>) => {
    toast.success("Solicitud PFAE enviada a validación", {
      description: `${data.nombre} ${data.apellido_paterno} — ${data.producto}`,
    })
    router.push("/originacion/validación")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Solicitud de Crédito — Persona Fisica (PFAE)</h1>
        <p className="text-sm text-muted-foreground">Complete los 7 pasos para enviar la solicitud a validación</p>
      </div>

      <MultiTabForm
        tabs={pfaeTabs}
        onSubmit={handleSubmit}
        submitLabel="Enviar a Validación"
      />
    </div>
  )
}
