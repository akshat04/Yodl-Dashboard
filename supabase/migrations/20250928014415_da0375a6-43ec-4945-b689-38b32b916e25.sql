-- Add INSERT policy for user_roles table to allow role assignment during signup
CREATE POLICY "Users can insert their own role during signup" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);