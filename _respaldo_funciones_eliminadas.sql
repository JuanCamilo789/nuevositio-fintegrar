-- ══════════════════════════════════════════════════════════════════════════
-- RESPALDO: funciones eliminadas de la base de datos por estar sin uso
-- Proyecto Supabase: numtvmpqoetjmqyzboqt (ERP Cooperamigó Vs. 1.0)
-- Fecha: 2026-07-23
--
-- Verificación previa a la eliminación (ver conversación con Claude Code):
--   - Sin referencias en coop-frontend, coop-portal-asociado, coop-legalterm,
--     coop-landing-page (todas las ramas, git grep, working tree, worktrees)
--   - Sin referencias en ninguna de las 29 Edge Functions de Supabase
--   - Sin referencias en vistas, políticas RLS ni otras funciones SQL
--
-- Para restaurar cualquiera de estas funciones, copia y ejecuta su bloque
-- completo (CREATE OR REPLACE FUNCTION ... $function$;) en el SQL Editor
-- de Supabase o vía mcp__claude_ai_Supabase__execute_sql.
-- ══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────
-- 1) obtener_datos_actuales_asociado(text, text)
--    YA ELIMINADA (2026-07-23). Devolvía el perfil completo del asociado
--    (salario, dirección, empleador, etc.) dado cédula+tipo. Ejecutable
--    por 'anon' — riesgo de exposición de datos sensibles sin autenticar.
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.obtener_datos_actuales_asociado(p_cedula text, p_tipo_identificacion text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_asociado public.asociados%ROWTYPE;
  v_intentos integer;
BEGIN
  IF p_cedula IS NULL OR p_cedula !~ '^[0-9]{5,11}$' THEN
    RETURN NULL;
  END IF;
  IF p_tipo_identificacion IS NULL OR p_tipo_identificacion NOT IN ('CC', 'CE', 'PA', 'OT') THEN
    RETURN NULL;
  END IF;

  SELECT count(*) INTO v_intentos
  FROM portal_rate_limit
  WHERE cedula = p_cedula
    AND accion = 'actualizacion_datos_consulta'
    AND created_at > now() - interval '24 hours';

  IF v_intentos >= 15 THEN
    RAISE EXCEPTION 'Demasiados intentos. Intenta de nuevo más tarde.';
  END IF;

  INSERT INTO portal_rate_limit (cedula, accion) VALUES (p_cedula, 'actualizacion_datos_consulta');
  DELETE FROM portal_rate_limit WHERE created_at < now() - interval '7 days';

  SELECT * INTO v_asociado
  FROM public.asociados
  WHERE cedula = p_cedula AND tipo_identificacion = p_tipo_identificacion AND activo = true;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'email', v_asociado.email, 'otro_email', v_asociado.otro_email,
    'celular', v_asociado.celular,
    'direccion', v_asociado.direccion, 'ciudad', v_asociado.ciudad, 'barrio', v_asociado.barrio,
    'tipo_vivienda', v_asociado.tipo_vivienda, 'estrato', v_asociado.estrato,
    'tiempo_residencia_meses', v_asociado.tiempo_residencia_meses,
    'canales_comunicacion', v_asociado.canales_comunicacion,
    'horario_contacto', v_asociado.horario_contacto,
    'fecha_nacimiento', v_asociado.fecha_nacimiento, 'rh', v_asociado.rh,
    'estado_civil', v_asociado.estado_civil, 'genero', v_asociado.genero,
    'nivel_academico', v_asociado.nivel_academico, 'titulo', v_asociado.titulo,
    'personas_a_cargo', v_asociado.personas_a_cargo,
    'personas_economicamente_activas', v_asociado.personas_economicamente_activas,
    'fuente_ingresos', v_asociado.fuente_ingresos, 'tipo_trabajador', v_asociado.tipo_trabajador,
    'empresa', v_asociado.empresa, 'cargo', v_asociado.cargo, 'tipo_contrato', v_asociado.tipo_contrato,
    'fecha_ingreso_empresa', v_asociado.fecha_ingreso_empresa,
    'direccion_empresa', v_asociado.direccion_empresa, 'ciudad_empresa', v_asociado.ciudad_empresa,
    'telefono_empresa', v_asociado.telefono_empresa, 'email_corporativo', v_asociado.email_corporativo,
    'entidad_pagadora', v_asociado.entidad_pagadora, 'institucion_educativa', v_asociado.institucion_educativa,
    'ocupacion', v_asociado.ocupacion,
    'salario', v_asociado.salario, 'salario_ingresos_fijos', v_asociado.salario_ingresos_fijos,
    'ingresos_independiente', v_asociado.ingresos_independiente, 'mesada_pensional', v_asociado.mesada_pensional,
    'otros_ingresos', v_asociado.otros_ingresos, 'gastos_familiares', v_asociado.gastos_familiares,
    'otros_gastos', v_asociado.otros_gastos, 'obligaciones_financieras', v_asociado.obligaciones_financieras,
    'cuotas_credito', v_asociado.cuotas_credito,
    'tiene_vehiculo', v_asociado.tiene_vehiculo, 'tipo_vehiculo', v_asociado.tipo_vehiculo,
    'tiene_vivienda_propia', v_asociado.tiene_vivienda_propia,
    'practica_deporte', v_asociado.practica_deporte, 'tipo_deporte', v_asociado.tipo_deporte,
    'viaja_frecuencia', v_asociado.viaja_frecuencia, 'alcance_viaje', v_asociado.alcance_viaje,
    'tiene_mascota', v_asociado.tiene_mascota, 'tipo_mascota', v_asociado.tipo_mascota,
    'compras_online', v_asociado.compras_online, 'usa_tarjeta_credito', v_asociado.usa_tarjeta_credito,
    'usa_billeteras_digitales', v_asociado.usa_billeteras_digitales,
    'billeteras_digitales', v_asociado.billeteras_digitales,
    'nivel_interes_promociones', v_asociado.nivel_interes_promociones,
    'usa_redes_sociales', v_asociado.usa_redes_sociales, 'redes_sociales', v_asociado.redes_sociales
  );
END;
$function$;


-- ─────────────────────────────────────────────────────────────────────────
-- 2) crear_borrador_solicitud_credito(jsonb)
--    PENDIENTE de decidir si se elimina. Crea un borrador en
--    solicitudes_credito_portal. Sin llamador detectado — probablemente
--    reemplazada por crear_borrador_credito_portal (la que sí usa el
--    portal de asociados).
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.crear_borrador_solicitud_credito(p_datos jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_payload jsonb;
  v_cols    text;
  v_id      uuid;
  v_sql     text;
BEGIN
  v_payload := p_datos || '{"estado":"borrador"}'::jsonb;

  -- Solo las columnas que vienen en el payload Y no son generadas.
  -- Las columnas con DEFAULT (id, created_at, updated_at…) que no estén
  -- en el payload quedan fuera: la BD aplica sus defaults automáticamente.
  SELECT string_agg(quote_ident(c.column_name), ', ' ORDER BY c.ordinal_position)
  INTO v_cols
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name   = 'solicitudes_credito_portal'
    AND c.is_generated = 'NEVER'
    AND c.column_name  = ANY(SELECT jsonb_object_keys(v_payload));

  v_sql := format(
    'INSERT INTO solicitudes_credito_portal (%s)
     SELECT %s FROM jsonb_populate_record(null::solicitudes_credito_portal, $1)
     RETURNING id',
    v_cols, v_cols
  );

  EXECUTE v_sql USING v_payload INTO v_id;

  RETURN jsonb_build_object('id', v_id);
END;
$function$;


-- ─────────────────────────────────────────────────────────────────────────
-- 3) actualizar_borrador_solicitud_credito(uuid, jsonb)
--    PENDIENTE de decidir si se elimina. Actualiza un borrador existente
--    en solicitudes_credito_portal. Mismo caso que la anterior —
--    probablemente reemplazada por actualizar_borrador_credito_portal.
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.actualizar_borrador_solicitud_credito(p_id uuid, p_datos jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_existente jsonb;
  v_merged    jsonb;
  v_cols      text;
  v_id        uuid;
  v_sql       text;
BEGIN
  SELECT to_jsonb(t) INTO v_existente
  FROM solicitudes_credito_portal t
  WHERE t.id = p_id AND t.estado = 'borrador';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solicitud no encontrada o no es borrador: %', p_id;
  END IF;

  v_merged := v_existente || p_datos || jsonb_build_object(
    'id',         p_id,
    'estado',     'borrador',
    'updated_at', now()
  );

  SELECT string_agg(quote_ident(column_name), ', ' ORDER BY ordinal_position)
  INTO v_cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name   = 'solicitudes_credito_portal'
    AND is_generated = 'NEVER';

  DELETE FROM solicitudes_credito_portal WHERE id = p_id;

  v_sql := format(
    'INSERT INTO solicitudes_credito_portal (%s)
     SELECT %s FROM jsonb_populate_record(null::solicitudes_credito_portal, $1)
     RETURNING id',
    v_cols, v_cols
  );

  EXECUTE v_sql USING v_merged INTO v_id;

  RETURN jsonb_build_object('id', v_id);
END;
$function$;


-- ─────────────────────────────────────────────────────────────────────────
-- 4) verificar_solicitudes_activas(uuid)
--    PENDIENTE de decidir si se elimina. Verifica que un asociado no
--    tenga ya una solicitud de crédito activa. Sin llamador detectado.
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.verificar_solicitudes_activas(p_asociado_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM solicitudes_credito
  WHERE asociado_id = p_asociado_id
    AND estado NOT IN ('rechazado', 'archivado', 'desembolsado');

  RETURN v_count < 2; -- máximo 1 solicitud activa (el sistema ya lo tiene así, pero lo reforzamos)
END;
$function$;
