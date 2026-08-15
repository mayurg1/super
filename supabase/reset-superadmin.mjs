/* global console */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://sgqgapthhknhmtnwwlrp.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNncWdhcHRoaGtuaG10bnd3bHJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQ3NTc4MSwiZXhwIjoyMTAxMDUxNzgxfQ.NMxPL9_og9zjxpgs6_i1E1DwNwsJVPgwaDn863qGaJA'
);

const { data, error } = await supabase.auth.admin.updateUserById(
    '2ad77e2f-b8dc-4410-865a-b3352c98065c',
    {
        password: 'test123'
    }
);

if (error) {
    console.error('Error:', error);
} else {
    console.log('Password updated successfully!');
    console.log(data);
}