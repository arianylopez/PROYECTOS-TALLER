const SUPABASE_URL = 'https://nsolqqdidnmxdwhfsjrc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_r3vbAgwryz-wEJ64MIuNAw_xNxDYuXm';

const clienteSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: {
    schema: 'ecommerce'
  }
});

const API = {
    async getProducts() {
        try {
            const { data, error } = await clienteSupabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Error al obtener productos:", error);
            throw error; 
        }
    }
};