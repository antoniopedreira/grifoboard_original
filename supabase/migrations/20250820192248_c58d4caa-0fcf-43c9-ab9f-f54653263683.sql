-- Fix security issue in registros table RLS policies
-- The current policies only check if obra exists but don't verify user ownership
-- This allows any authenticated user to access registros from any obra

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their registros" ON public.registros;
DROP POLICY IF EXISTS "Users can insert registros" ON public.registros;
DROP POLICY IF EXISTS "Users can update their registros" ON public.registros;
DROP POLICY IF EXISTS "Users can delete their registros" ON public.registros;

-- Create secure policies that verify user ownership of the obra
CREATE POLICY "Users can view their registros" ON public.registros
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.obras
    WHERE obras.id = registros.obra_id 
    AND obras.usuario_id = auth.uid()
  )
);

CREATE POLICY "Users can insert registros" ON public.registros
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.obras
    WHERE obras.id = registros.obra_id 
    AND obras.usuario_id = auth.uid()
  )
);

CREATE POLICY "Users can update their registros" ON public.registros
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.obras
    WHERE obras.id = registros.obra_id 
    AND obras.usuario_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their registros" ON public.registros
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.obras
    WHERE obras.id = registros.obra_id 
    AND obras.usuario_id = auth.uid()
  )
);