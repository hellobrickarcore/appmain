const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addPost() {
  const { data, error } = await supabase
    .from('posts')
    .insert([
      {
        slug: 'test-post',
        title: 'Test Post',
        excerpt: 'This is a test post.',
        content: '# Test\nThis is a test.',
        category: 'Market Trends',
        status: 'published',
        image_url: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=800&auto=format&fit=crop',
      },
    ]);

  if (error) console.error('Error:', error);
  else console.log('Success:', data);
}

addPost();
