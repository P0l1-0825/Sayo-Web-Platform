-- ============================================================
-- SAYO — Phase 8: Comprehensive Seed Data for Development
-- ============================================================
-- Realistic test data for all modules. Safe to re-run (ON CONFLICT).
-- Uses gen_random_uuid() for deterministic-ish IDs via fixed approach.
-- ============================================================

-- ============================================
-- 1. CLIENTS PFAE — 15 Personas Físicas
-- ============================================
INSERT INTO clients_pfae (
  first_name, last_name, mother_last_name, rfc, curp, birth_date,
  nationality, civil_status, id_type, id_number,
  address, city, state, zip_code,
  occupation, company, position, seniority_years, contract_type,
  monthly_income, other_income, monthly_expenses, total_assets, total_liabilities,
  resource_origin, is_pep, fund_country, credit_purpose, status
) VALUES
  ('Carlos', 'Mendoza', 'García', 'MEGC850312QA1', 'MEGC850312HDFNRL09', '1985-03-12',
   'Mexicana', 'casado', 'INE', 'IDMEX12345678',
   'Av. Reforma 505, Piso 12, Col. Cuauhtémoc', 'Ciudad de México', 'Ciudad de México', '06500',
   'Director Comercial', 'Grupo Bimbo', 'Director', 8.5, 'indefinido',
   95000, 15000, 45000, 3500000, 800000,
   'Ingresos por nómina', false, 'México', 'Capital de trabajo', 'activo'),

  ('Ana', 'García', 'López', 'GALA900215TQ3', 'GALA900215MDFRPN02', '1990-02-15',
   'Mexicana', 'soltero', 'INE', 'IDMEX23456789',
   'Calle Madero 23, Col. Centro', 'Guadalajara', 'Jalisco', '44100',
   'Ingeniera de Software', 'Oracle México', 'Senior Engineer', 5.0, 'indefinido',
   72000, 8000, 30000, 1500000, 200000,
   'Ingresos por nómina', false, 'México', 'Remodelación de vivienda', 'activo'),

  ('Roberto', 'López', 'Hernández', 'LOHR880623KL5', 'LOHR880623HDFPRB07', '1988-06-23',
   'Mexicana', 'casado', 'INE', 'IDMEX34567890',
   'Blvd. Adolfo López Mateos 2456, Col. Altavista', 'Monterrey', 'Nuevo León', '64000',
   'Médico Especialista', 'Hospital San José', 'Cardiólogo', 12.0, 'honorarios',
   120000, 35000, 55000, 6000000, 1200000,
   'Honorarios médicos', false, 'México', 'Equipo médico', 'activo'),

  ('María', 'Fernández', 'Ortiz', 'FEOM920810AB2', 'FEOM920810MDFRRR04', '1992-08-10',
   'Mexicana', 'soltero', 'INE', 'IDMEX45678901',
   'Calle 5 de Mayo 789, Col. Narvarte', 'Ciudad de México', 'Ciudad de México', '03020',
   'Contadora Pública', 'Deloitte', 'Gerente', 6.0, 'indefinido',
   65000, 5000, 28000, 900000, 150000,
   'Ingresos por nómina', false, 'México', 'Adquisición de vehículo', 'activo'),

  ('Luis', 'Torres', 'Ramírez', 'TORL870405CD4', 'TORL870405HDFRMS08', '1987-04-05',
   'Mexicana', 'casado', 'INE', 'IDMEX56789012',
   'Av. Juárez 1200, Col. Moderna', 'Puebla', 'Puebla', '72000',
   'Empresario', 'Tortillería Los Torres', 'Propietario', 15.0, 'empresario',
   45000, 25000, 35000, 2000000, 500000,
   'Actividad empresarial', false, 'México', 'Expansión de negocio', 'activo'),

  ('Diana', 'Ruiz', 'Castillo', 'RUCD950115EF6', 'RUCD950115MDFRNS01', '1995-01-15',
   'Mexicana', 'union_libre', 'INE', 'IDMEX67890123',
   'Calle Hidalgo 456, Col. Centro', 'Querétaro', 'Querétaro', '76000',
   'Diseñadora Gráfica', 'Freelance', 'Independiente', 4.0, 'honorarios',
   38000, 12000, 22000, 600000, 80000,
   'Honorarios profesionales', false, 'México', 'Equipo de cómputo', 'activo'),

  ('Pedro', 'Sánchez', 'Morales', 'SAMP830720GH7', 'SAMP830720HDFNDR05', '1983-07-20',
   'Mexicana', 'divorciado', 'INE', 'IDMEX78901234',
   'Av. Universidad 3400, Col. Copilco', 'Ciudad de México', 'Ciudad de México', '04360',
   'Profesor Universitario', 'UNAM', 'Titular', 18.0, 'indefinido',
   55000, 20000, 30000, 4000000, 600000,
   'Ingresos por nómina y regalías', false, 'México', 'Viaje de investigación', 'activo'),

  ('Patricia', 'Morales', 'Vega', 'MOVP910330IJ8', 'MOVP910330MDFRGT03', '1991-03-30',
   'Mexicana', 'casado', 'INE', 'IDMEX89012345',
   'Calle Allende 890, Col. Obrera', 'León', 'Guanajuato', '37000',
   'Abogada', 'Morales & Asociados', 'Socia', 7.5, 'socio',
   85000, 10000, 40000, 2500000, 400000,
   'Honorarios profesionales', false, 'México', 'Ampliación de despacho', 'activo'),

  ('Jorge', 'Ramírez', 'Díaz', 'RADJ860912KL9', 'RADJ860912HDFMRR06', '1986-09-12',
   'Mexicana', 'casado', 'INE', 'IDMEX90123456',
   'Blvd. Manuel Ávila Camacho 100, Col. Lomas', 'Ciudad de México', 'Ciudad de México', '11000',
   'Director de Finanzas', 'FEMSA', 'CFO', 10.0, 'indefinido',
   180000, 50000, 80000, 12000000, 3000000,
   'Ingresos por nómina y dividendos', true, 'México', 'Inversión inmobiliaria', 'activo'),

  ('Sofía', 'Hernández', 'Mejía', 'HEMS970225MN0', 'HEMS970225MDFRJF02', '1997-02-25',
   'Mexicana', 'soltero', 'INE', 'IDMEX01234567',
   'Calle Morelos 234, Col. Juárez', 'Mérida', 'Yucatán', '97000',
   'Community Manager', 'Agencia Digital MX', 'Coordinadora', 3.0, 'indefinido',
   28000, 5000, 18000, 300000, 50000,
   'Ingresos por nómina', false, 'México', 'Consolidación de deudas', 'activo'),

  ('Fernando', 'Vega', 'Núñez', 'VENF800505OP1', 'VENF800505HDFGRN09', '1980-05-05',
   'Mexicana', 'casado', 'INE', 'IDMEX12340001',
   'Av. Constituyentes 800, Col. Daniel Garza', 'Ciudad de México', 'Ciudad de México', '11830',
   'Cirujano Dentista', 'Consultorio Propio', 'Propietario', 20.0, 'empresario',
   95000, 30000, 45000, 5000000, 800000,
   'Actividad profesional', false, 'México', 'Equipo dental', 'activo'),

  ('Gabriela', 'Castro', 'Luna', 'CALG930818QR2', 'CALG930818MDFSTR01', '1993-08-18',
   'Mexicana', 'soltero', 'INE', 'IDMEX12340002',
   'Calle Independencia 567, Col. Centro', 'Aguascalientes', 'Aguascalientes', '20000',
   'Arquitecta', 'Estudio GC Arquitectura', 'Directora', 6.0, 'empresario',
   58000, 15000, 30000, 1800000, 300000,
   'Ingresos por actividad empresarial', false, 'México', 'Maquinaria para construcción', 'activo'),

  ('Miguel', 'Ortiz', 'Paredes', 'OIPM881120ST3', 'OIPM881120HDFRRG07', '1988-11-20',
   'Mexicana', 'casado', 'pasaporte', 'PAX12345678',
   'Av. Revolución 1500, Col. San Ángel', 'Ciudad de México', 'Ciudad de México', '01000',
   'Consultor IT', 'Accenture México', 'Manager', 9.0, 'indefinido',
   110000, 20000, 50000, 3200000, 700000,
   'Ingresos por nómina', false, 'México', 'Capital de trabajo', 'activo'),

  ('Alejandra', 'Domínguez', 'Ríos', 'DORA960407UV4', 'DORA960407MDFRML04', '1996-04-07',
   'Mexicana', 'soltero', 'INE', 'IDMEX12340003',
   'Calle Lerdo 345, Col. Centro', 'Chihuahua', 'Chihuahua', '31000',
   'Veterinaria', 'Clínica VetPlus', 'Socia Fundadora', 4.0, 'socio',
   42000, 8000, 25000, 800000, 120000,
   'Ingresos profesionales', false, 'México', 'Equipo veterinario', 'activo'),

  ('Eduardo', 'Jiménez', 'Flores', 'JIFE820630WX5', 'JIFE820630HDFMRD08', '1982-06-30',
   'Mexicana', 'viudo', 'INE', 'IDMEX12340004',
   'Blvd. García Morales 500, Col. El Llano', 'Hermosillo', 'Sonora', '83000',
   'Agricultor', 'Rancho Los Jiménez', 'Propietario', 25.0, 'empresario',
   65000, 40000, 35000, 8000000, 1500000,
   'Actividad agropecuaria', false, 'México', 'Maquinaria agrícola', 'activo')
ON CONFLICT (rfc) DO NOTHING;

-- ============================================
-- 2. CLIENTS PM — 7 Personas Morales
-- ============================================
INSERT INTO clients_pm (
  legal_name, rfc, business_object, sector, industry, fiscal_address,
  incorporation_date, deed_number, notary, notary_number, deed_date,
  rep_legal_name, rep_legal_rfc, rep_legal_curp, power_of_attorney,
  main_activity, annual_sales, employees, main_clients, main_suppliers,
  beneficial_owner, beneficial_owner_rfc, ownership_percentage,
  resource_origin, is_pep, fund_country, credit_purpose, status
) VALUES
  ('Solvendom SOFOM E.N.R. SA de CV', 'SSO200115AB1', 'Servicios financieros y otorgamiento de crédito', 'Financiero', 'SOFOM', 'Av. Paseo de la Reforma 250, Piso 15, Col. Juárez, CDMX 06600',
   '2020-01-15', '45678', 'Lic. Manuel Ríos Pérez', '234', '2020-01-10',
   'Benito Sánchez Rojas', 'SARB900101ABC', 'SARB900101HDFNNT09', 'Poder General Amplio',
   'Otorgamiento de créditos', 85000000, 45, 'PyMEs y personas físicas', 'STP, CNBV',
   'Benito Sánchez Rojas', 'SARB900101ABC', 80.00,
   'Ingresos por intereses y comisiones', false, 'México', 'Capital de trabajo', 'activo'),

  ('Constructora del Norte SA de CV', 'CNO150305CD2', 'Construcción de vivienda y obra civil', 'Construcción', 'Vivienda', 'Blvd. Díaz Ordaz 1500, Col. Santa María, Monterrey NL 64650',
   '2015-03-05', '12345', 'Lic. Laura Garza Treviño', '189', '2015-03-01',
   'Héctor Cavazos López', 'CALH780520DE3', 'CALH780520HNLVRR05', 'Poder para actos de administración',
   'Construcción de vivienda residencial', 250000000, 320, 'INFONAVIT, FOVISSSTE, particulares', 'CEMEX, Aceros del Norte',
   'Héctor Cavazos López', 'CALH780520DE3', 60.00,
   'Ingresos por construcción', false, 'México', 'Financiamiento de obra', 'activo'),

  ('Tecnología Avanzada del Bajío SA de CV', 'TAB180910EF4', 'Desarrollo de software y servicios de TI', 'Tecnología', 'Software', 'Blvd. Campestre 450, Col. Jardines del Moral, León GTO 37160',
   '2018-09-10', '78901', 'Lic. Francisco Ibarra Mora', '156', '2018-09-08',
   'Ricardo Mora Estrada', 'MOER850715GH5', 'MOER850715HGTRRK03', 'Poder General',
   'Desarrollo de software empresarial', 45000000, 85, 'Gobierno del Estado, PyMEs', 'AWS, Microsoft',
   'Ricardo Mora Estrada', 'MOER850715GH5', 75.00,
   'Ingresos por servicios de TI', false, 'México', 'Infraestructura tecnológica', 'activo'),

  ('Distribuidora de Alimentos del Pacífico SA de CV', 'DAP120620IJ6', 'Distribución de alimentos y bebidas', 'Alimentos', 'Distribución', 'Av. del Mar 2200, Col. Pradera Dorada, Mazatlán SIN 82110',
   '2012-06-20', '34567', 'Lic. Alberto Soto Cruz', '278', '2012-06-18',
   'Carmen Soto Beltrán', 'SOBC700305KL7', 'SOBC700305MSLTRR01', 'Poder Amplio',
   'Distribución de alimentos perecederos', 180000000, 200, 'Soriana, Walmart, HEB', 'Productos agrícolas regionales',
   'Carmen Soto Beltrán', 'SOBC700305KL7', 55.00,
   'Ingresos por venta de productos', false, 'México', 'Flotilla vehicular', 'activo'),

  ('Energía Solar del Sureste SA de CV', 'ESS190215MN8', 'Instalación de sistemas de energía solar', 'Energía', 'Renovables', 'Calle 60 No. 500, Col. Centro, Mérida YUC 97000',
   '2019-02-15', '56789', 'Lic. Mariana Chi Canul', '145', '2019-02-12',
   'Andrés Pech Góngora', 'PEGA880922OP9', 'PEGA880922HYNCRN06', 'Poder para actos de administración',
   'Instalación de paneles solares', 35000000, 60, 'Gobierno de Yucatán, hoteles, residencial', 'Jinko Solar, Canadian Solar',
   'Andrés Pech Góngora', 'PEGA880922OP9', 90.00,
   'Ingresos por servicios de instalación', false, 'México', 'Inventario de paneles', 'activo'),

  ('Grupo Farmacéutico del Centro SA de CV', 'GFC100830QR0', 'Distribución y venta de productos farmacéuticos', 'Salud', 'Farmacéutico', 'Av. Hidalgo 1800, Col. Centro, Aguascalientes AGS 20000',
   '2010-08-30', '23456', 'Lic. José Luis Padilla Romo', '312', '2010-08-28',
   'Laura Elena Padilla Muñoz', 'PAML750410ST1', 'PAML750410MASDLR08', 'Poder General Amplio',
   'Venta de medicamentos y material médico', 120000000, 150, 'Farmacias Guadalajara, hospitales privados', 'Bayer, Pfizer, Liomont',
   'Laura Elena Padilla Muñoz', 'PAML750410ST1', 65.00,
   'Ingresos por venta de medicamentos', false, 'México', 'Inventario de medicamentos', 'activo'),

  ('Transportes Ejecutivos del Golfo SA de CV', 'TEG140425UV2', 'Transporte de carga y logística', 'Transporte', 'Carga', 'Av. Miguel Alemán 3500, Col. Jardín, Veracruz VER 91900',
   '2014-04-25', '45670', 'Lic. Pedro Hernández Ortega', '267', '2014-04-22',
   'Manuel Hernández Cruz', 'HECM760815WX3', 'HECM760815HVRRRN04', 'Poder para actos de administración',
   'Transporte de carga general', 95000000, 180, 'PEMEX, CFE, empresas manufactureras', 'Kenworth, Volvo Trucks',
   'Manuel Hernández Cruz', 'HECM760815WX3', 70.00,
   'Ingresos por servicios de transporte', false, 'México', 'Renovación de flotilla', 'activo')
ON CONFLICT (rfc) DO NOTHING;

-- ============================================
-- 3. CREDIT ORIGINATION APPLICATIONS — 20 apps
-- ============================================
INSERT INTO credit_origination_applications (
  folio, client_name, client_id, client_type, product, amount, term, rate, status,
  assigned_to, bureau_score, notes
) VALUES
  ('ORI-20260101-0001', 'Carlos Mendoza García', (SELECT id FROM clients_pfae WHERE rfc = 'MEGC850312QA1'), 'PFAE', 'Crédito Empresarial', 500000, 36, 15.00, 'activa', 'Ana García', 720, 'Cliente con buen historial'),
  ('ORI-20260102-0001', 'Ana García López', (SELECT id FROM clients_pfae WHERE rfc = 'GALA900215TQ3'), 'PFAE', 'Crédito Personal', 150000, 24, 28.00, 'por_disponer', 'Roberto López', 680, 'Aprobado en comité'),
  ('ORI-20260103-0001', 'Roberto López Hernández', (SELECT id FROM clients_pfae WHERE rfc = 'LOHR880623KL5'), 'PFAE', 'Crédito de Nómina', 300000, 48, 18.50, 'en_comite', 'María Fernández', 750, 'En evaluación'),
  ('ORI-20260104-0001', 'Constructora del Norte SA de CV', (SELECT id FROM clients_pm WHERE rfc = 'CNO150305CD2'), 'PM', 'Crédito Empresarial', 5000000, 60, 15.00, 'por_aprobar', 'Luis Torres', 710, 'Solicitud de financiamiento de obra'),
  ('ORI-20260105-0001', 'María Fernández Ortiz', (SELECT id FROM clients_pfae WHERE rfc = 'FEOM920810AB2'), 'PFAE', 'Crédito Automotriz', 450000, 48, 12.50, 'capturada', 'Diana Ruiz', 690, NULL),
  ('ORI-20260106-0001', 'Tecnología Avanzada del Bajío SA de CV', (SELECT id FROM clients_pm WHERE rfc = 'TAB180910EF4'), 'PM', 'Línea Revolvente', 2000000, 12, 35.00, 'activa', 'Pedro Sánchez', 730, 'Línea aprobada y dispersada'),
  ('ORI-20260107-0001', 'Luis Torres Ramírez', (SELECT id FROM clients_pfae WHERE rfc = 'TORL870405CD4'), 'PFAE', 'Crédito Empresarial', 800000, 36, 15.00, 'rechazada', 'Patricia Morales', 580, 'Score bajo, documentación incompleta'),
  ('ORI-20260108-0001', 'Diana Ruiz Castillo', (SELECT id FROM clients_pfae WHERE rfc = 'RUCD950115EF6'), 'PFAE', 'Crédito Personal', 80000, 12, 28.00, 'saldada', 'Jorge Ramírez', 650, 'Crédito liquidado anticipadamente'),
  ('ORI-20260109-0001', 'Distribuidora de Alimentos del Pacífico SA de CV', (SELECT id FROM clients_pm WHERE rfc = 'DAP120620IJ6'), 'PM', 'Crédito Empresarial', 3500000, 48, 15.00, 'en_comite', 'Ana García', 700, 'Buen perfil financiero'),
  ('ORI-20260110-0001', 'Pedro Sánchez Morales', (SELECT id FROM clients_pfae WHERE rfc = 'SAMP830720GH7'), 'PFAE', 'Crédito de Nómina', 200000, 36, 18.50, 'activa', 'Roberto López', 715, 'Descuento vía nómina'),
  ('ORI-20260111-0001', 'Patricia Morales Vega', (SELECT id FROM clients_pfae WHERE rfc = 'MOVP910330IJ8'), 'PFAE', 'Crédito Personal', 250000, 24, 28.00, 'por_aprobar', 'María Fernández', 695, 'Pendiente documentación'),
  ('ORI-20260112-0001', 'Energía Solar del Sureste SA de CV', (SELECT id FROM clients_pm WHERE rfc = 'ESS190215MN8'), 'PM', 'Crédito Empresarial', 1500000, 36, 15.00, 'capturada', 'Luis Torres', NULL, 'Nuevo cliente'),
  ('ORI-20260113-0001', 'Jorge Ramírez Díaz', (SELECT id FROM clients_pfae WHERE rfc = 'RADJ860912KL9'), 'PFAE', 'Crédito Empresarial', 1200000, 36, 15.00, 'cancelada', 'Diana Ruiz', 760, 'Cancelado por el cliente'),
  ('ORI-20260114-0001', 'Grupo Farmacéutico del Centro SA de CV', (SELECT id FROM clients_pm WHERE rfc = 'GFC100830QR0'), 'PM', 'Crédito Empresarial', 4000000, 60, 15.00, 'por_disponer', 'Pedro Sánchez', 740, 'Aprobado con condiciones'),
  ('ORI-20260115-0001', 'Sofía Hernández Mejía', (SELECT id FROM clients_pfae WHERE rfc = 'HEMS970225MN0'), 'PFAE', 'Crédito Personal', 60000, 12, 28.00, 'capturada', 'Patricia Morales', 620, 'Primera solicitud'),
  ('ORI-20260116-0001', 'Fernando Vega Núñez', (SELECT id FROM clients_pfae WHERE rfc = 'VENF800505OP1'), 'PFAE', 'Crédito Empresarial', 950000, 48, 15.00, 'activa', 'Jorge Ramírez', 735, 'Equipo dental especializado'),
  ('ORI-20260117-0001', 'Gabriela Castro Luna', (SELECT id FROM clients_pfae WHERE rfc = 'CALG930818QR2'), 'PFAE', 'Crédito Empresarial', 700000, 36, 15.00, 'por_aprobar', 'Ana García', 705, 'Maquinaria para construcción'),
  ('ORI-20260118-0001', 'Transportes Ejecutivos del Golfo SA de CV', (SELECT id FROM clients_pm WHERE rfc = 'TEG140425UV2'), 'PM', 'Crédito Empresarial', 3000000, 60, 15.00, 'en_comite', 'Roberto López', 690, 'Renovación de flotilla'),
  ('ORI-20260119-0001', 'Miguel Ortiz Paredes', (SELECT id FROM clients_pfae WHERE rfc = 'OIPM881120ST3'), 'PFAE', 'Crédito de Nómina', 400000, 48, 18.50, 'activa', 'María Fernández', 745, 'Consolidación de deudas'),
  ('ORI-20260120-0001', 'Alejandra Domínguez Ríos', (SELECT id FROM clients_pfae WHERE rfc = 'DORA960407UV4'), 'PFAE', 'Crédito Personal', 120000, 18, 28.00, 'reactivada', 'Luis Torres', 640, 'Reactivada tras documentación adicional')
ON CONFLICT (folio) DO NOTHING;

-- ============================================
-- 4. COMPLIANCE ALERTS — 10 alerts
-- ============================================
INSERT INTO compliance_alerts (
  alert_type, description, severity, status,
  client_name, amount, risk_score
) VALUES
  ('operacion_relevante', 'Transferencia SPEI por $85,000 MXN. Cliente: Carlos Mendoza García', 'media', 'activa', 'Carlos Mendoza García', 85000, 35),
  ('operacion_preocupante', 'Depósito en efectivo por $200,000 MXN. Requiere investigación.', 'alta', 'investigando', 'Roberto López Hernández', 200000, 70),
  ('posible_fraccionamiento', '5 depósitos en 24h sumando $95,000 MXN. Cada uno < $50K.', 'alta', 'activa', 'Sofía Hernández Mejía', 95000, 75),
  ('operacion_pep', 'Transacción de PEP. Jorge Ramírez Díaz — Director FEMSA.', 'alta', 'investigando', 'Jorge Ramírez Díaz', 180000, 60),
  ('pais_alto_riesgo', 'Transferencia internacional desde cuenta en Panamá.', 'critica', 'escalada', 'Empresa Offshore SA', 500000, 90),
  ('operacion_relevante', 'Pago de nómina masivo por $450,000 MXN. Constructora del Norte.', 'media', 'descartada', 'Constructora del Norte SA de CV', 450000, 25),
  ('structuring', 'Patrón inusual: 8 transferencias en 3 días por montos similares.', 'alta', 'activa', 'Fernando Vega Núñez', 160000, 80),
  ('operacion_relevante', 'Disposición de crédito por $500,000 MXN. Crédito empresarial.', 'media', 'resuelta', 'Carlos Mendoza García', 500000, 30),
  ('beneficiario_desconocido', 'Transferencia a beneficiario no registrado en lista blanca.', 'media', 'activa', 'Miguel Ortiz Paredes', 75000, 45),
  ('cambio_patron', 'Cambio significativo en patrón transaccional. Incremento 300% en volumen.', 'alta', 'investigando', 'Tecnología Avanzada del Bajío SA de CV', 320000, 65)
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. SUPPORT TICKETS — 5 tickets
-- ============================================
INSERT INTO support_tickets (
  subject, description, category, priority, status, channel
) VALUES
  ('No puedo realizar transferencia SPEI', 'Al intentar enviar una transferencia SPEI por $15,000 me aparece error "Cuenta no válida". La CLABE del destinatario es correcta.', 'transferencias', 'alta', 'en_progreso', 'app'),
  ('Solicitud de estado de cuenta', 'Necesito mi estado de cuenta de los últimos 3 meses para trámite bancario.', 'cuentas', 'media', 'abierto', 'email'),
  ('Cargo no reconocido en mi cuenta', 'Aparece un cargo de $2,500 que no reconozco del día 5 de marzo. Solicito aclaración.', 'cargos', 'urgente', 'en_progreso', 'telefono'),
  ('Actualización de datos personales', 'Necesito cambiar mi dirección y número telefónico en mi perfil.', 'datos_personales', 'baja', 'resuelto', 'app'),
  ('Problema con token de seguridad', 'Mi token de seguridad no genera códigos. Necesito reemplazo.', 'seguridad', 'alta', 'abierto', 'chat')
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. LEADS — 10 leads
-- ============================================
INSERT INTO leads (
  name, email, phone, company, source, product, amount, stage, score, notes
) VALUES
  ('Alejandro Ríos Mendoza', 'arios@email.com', '5512345678', 'Ríos Construcciones', 'web', 'empresarial', 2000000, 'evaluacion', 72, 'Interesado en crédito para obra'),
  ('Mariana Ochoa Pérez', 'mochoa@gmail.com', '3312345678', NULL, 'referido', 'personal', 80000, 'contactado', 45, 'Referida por Carlos Mendoza'),
  ('Grupo Textil Hidalgo SA de CV', 'contacto@textilhidalgo.mx', '7712345678', 'Grupo Textil Hidalgo', 'alianza', 'empresarial', 5000000, 'prospecto', 60, 'Contacto vía alianza con CANACINTRA'),
  ('Laura Medina Torres', 'lmedina@hotmail.com', '8112345678', 'Farmacia San Rafael', 'organico', 'revolvente', 200000, 'aprobado', 85, 'Aprobada, pendiente firma'),
  ('Ing. Francisco Delgado', 'fdelgado@empresa.mx', '2212345678', 'Ingeniería Aplicada SA', 'campaña', 'empresarial', 1500000, 'evaluacion', 68, 'Llegó por campaña de email'),
  ('Restaurante El Bajío SA de CV', 'contacto@elbajio.mx', '5587654321', 'El Bajío', 'llamada', 'empresarial', 800000, 'contactado', 55, 'Llamada entrante, expansión de sucursal'),
  ('Sandra Villanueva Cruz', 'svillanueva@yahoo.com', '9512345678', NULL, 'web', 'nomina', 150000, 'prospecto', 30, 'Solicitud web, sin documentos aún'),
  ('Comercializadora del Istmo SA de CV', 'ventas@istmo.mx', '9712345678', 'Comercializadora del Istmo', 'referido', 'empresarial', 3000000, 'dispersado', 95, 'Crédito ya dispersado'),
  ('Dr. Alberto Fuentes Garza', 'afuentes@clinica.mx', '8187654321', 'Clínica Santa Fe', 'organico', 'auto', 600000, 'evaluacion', 70, 'Financiamiento de ambulancia'),
  ('Plásticos del Noroeste SA de CV', 'compras@plasticosnw.mx', '6612345678', 'Plásticos del Noroeste', 'campaña', 'empresarial', 4000000, 'rechazado', 20, 'No cumple requisitos mínimos de antigüedad')
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. KPI RECORDS — Historical data (6 months)
-- ============================================
INSERT INTO kpi_records (name, category, actual, target, unit, period, period_date, trend, status) VALUES
  -- Cartera
  ('Cartera Total', 'cartera', 125000000, 130000000, 'currency', 'mensual', '2026-03-01', 'up', 'amarillo'),
  ('Cartera Total', 'cartera', 118000000, 125000000, 'currency', 'mensual', '2026-02-01', 'up', 'amarillo'),
  ('Cartera Total', 'cartera', 112000000, 120000000, 'currency', 'mensual', '2026-01-01', 'up', 'amarillo'),
  ('IMOR', 'cartera', 3.2, 3.0, 'percent', 'mensual', '2026-03-01', 'down', 'amarillo'),
  ('IMOR', 'cartera', 3.5, 3.0, 'percent', 'mensual', '2026-02-01', 'up', 'rojo'),
  ('IMOR', 'cartera', 2.8, 3.0, 'percent', 'mensual', '2026-01-01', 'stable', 'verde'),
  -- Originación
  ('Créditos Dispersados', 'originacion', 45, 50, 'number', 'mensual', '2026-03-01', 'up', 'amarillo'),
  ('Créditos Dispersados', 'originacion', 38, 50, 'number', 'mensual', '2026-02-01', 'down', 'rojo'),
  ('Créditos Dispersados', 'originacion', 52, 50, 'number', 'mensual', '2026-01-01', 'up', 'verde'),
  ('Monto Dispersado', 'originacion', 18500000, 20000000, 'currency', 'mensual', '2026-03-01', 'up', 'amarillo'),
  ('Monto Dispersado', 'originacion', 14200000, 20000000, 'currency', 'mensual', '2026-02-01', 'down', 'rojo'),
  -- Cobranza
  ('Recuperación', 'cobranza', 12500000, 13000000, 'currency', 'mensual', '2026-03-01', 'up', 'amarillo'),
  ('Tasa de Contacto', 'cobranza', 78, 80, 'percent', 'mensual', '2026-03-01', 'up', 'amarillo'),
  ('Promesas Cumplidas', 'cobranza', 65, 75, 'percent', 'mensual', '2026-03-01', 'down', 'rojo'),
  -- Clientes
  ('Nuevos Clientes', 'clientes', 320, 300, 'number', 'mensual', '2026-03-01', 'up', 'verde'),
  ('Nuevos Clientes', 'clientes', 280, 300, 'number', 'mensual', '2026-02-01', 'down', 'amarillo'),
  ('Retención', 'clientes', 92, 90, 'percent', 'mensual', '2026-03-01', 'stable', 'verde'),
  -- Cumplimiento
  ('Alertas Resueltas', 'cumplimiento', 85, 95, 'percent', 'mensual', '2026-03-01', 'down', 'rojo'),
  ('Tiempo Promedio Resolución', 'cumplimiento', 4.2, 3.0, 'number', 'mensual', '2026-03-01', 'up', 'rojo'),
  -- Tesorería
  ('Volumen SPEI', 'tesoreria', 45000000, 40000000, 'currency', 'mensual', '2026-03-01', 'up', 'verde'),
  ('Pagos Procesados', 'tesoreria', 1250, 1200, 'number', 'mensual', '2026-03-01', 'up', 'verde')
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. NOTIFICATION TEMPLATES
-- ============================================
INSERT INTO notification_templates (name, event_type, channel, subject, body, variables, is_active) VALUES
  ('Bienvenida', 'user.signup', 'email', 'Bienvenido a SAYO', 'Hola {{full_name}}, tu cuenta ha sido creada exitosamente. Tu número de cuenta es {{account_number}}.', ARRAY['full_name','account_number'], true),
  ('Transferencia Enviada', 'transfer.sent', 'push', 'Transferencia enviada', 'Se envió ${{amount}} a {{receiver_name}}. Referencia: {{reference}}.', ARRAY['amount','receiver_name','reference'], true),
  ('Transferencia Recibida', 'transfer.received', 'push', 'Depósito recibido', 'Recibiste ${{amount}} de {{sender_name}}. Saldo: ${{balance}}.', ARRAY['amount','sender_name','balance'], true),
  ('Pago de Crédito', 'credit.payment_due', 'sms', NULL, 'SAYO: Tu pago de ${{amount}} vence el {{due_date}}. Realiza tu pago en app.sayo.mx', ARRAY['amount','due_date'], true),
  ('Crédito Aprobado', 'credit.approved', 'email', 'Tu crédito ha sido aprobado', 'Hola {{full_name}}, tu solicitud de crédito por ${{amount}} ha sido aprobada. Ingresa a la app para firmar tu contrato.', ARRAY['full_name','amount'], true),
  ('Alerta PLD', 'compliance.alert', 'email', 'Alerta de Cumplimiento', 'Se ha generado una nueva alerta PLD: {{alert_type}}. Severidad: {{severity}}. Revisar en el portal de cumplimiento.', ARRAY['alert_type','severity'], true),
  ('Pago Vencido', 'credit.overdue', 'sms', NULL, 'SAYO: Tu pago de ${{amount}} está vencido desde {{due_date}}. Evita cargos adicionales. Paga ahora.', ARRAY['amount','due_date'], true),
  ('Recordatorio 5 días', 'credit.reminder_5d', 'push', 'Recordatorio de pago', 'Tu pago de ${{amount}} vence en 5 días ({{due_date}}). Programa tu pago anticipado.', ARRAY['amount','due_date'], true)
ON CONFLICT DO NOTHING;
