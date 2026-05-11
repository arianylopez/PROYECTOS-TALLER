const SUPABASE_URL = 'https://qunivqhppodjksylxlyz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VIcOqhfXIAJXqxtJ6M5feQ_zfyIQ_G4';

const clienteSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
            return [];
        }
    }
};