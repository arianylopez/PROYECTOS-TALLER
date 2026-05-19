const { createClient } = window.supabase;

const supabaseUrl = 'https://nsolqqdidnmxdwhfsjrc.supabase.co';
const supabaseKey = 'sb_publishable_r3vbAgwryz-wEJ64MIuNAw_xNxDYuXm';

export const supabaseClient = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'psicologo'
  }
});