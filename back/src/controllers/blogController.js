import { pool } from '../config/db.js';

export async function listPosts(_req, res) {
  try {
    const result = await pool.query('SELECT * FROM blog_posts ORDER BY sort_order ASC, created_at DESC');
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

export async function getPostBySlug(req, res) {
  const { slug } = req.params;
  try {
    const result = await pool.query('SELECT * FROM blog_posts WHERE slug = $1 AND status = $2', [slug, 'published']);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Article introuvable ou non publié.' });
    
    // Update view count asynchronously
    pool.query('UPDATE blog_posts SET views_count = views_count + 1 WHERE id = $1', [result.rows[0].id]).catch(() => {});
    
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

export async function createPost(req, res) {
  const { title, slug, category, cover_image, content_html, meta_description, status, sort_order } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO blog_posts (title, slug, category, cover_image, content_html, meta_description, status, sort_order, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7::post_status, $8, CASE WHEN $7='published' THEN now() ELSE NULL END) RETURNING id`,
      [title, slug, category, cover_image, content_html, meta_description, status || 'draft', sort_order || 0]
    );
    return res.status(201).json({ message: 'Article créé.', id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') return res.status(400).json({ message: 'Ce slug existe déjà.' });
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

export async function updatePost(req, res) {
  const { id } = req.params;
  const { title, slug, category, cover_image, content_html, meta_description, status, sort_order } = req.body;
  try {
    const result = await pool.query(
      `UPDATE blog_posts SET title=$1, slug=$2, category=$3, cover_image=$4, content_html=$5,
       meta_description=$6, status=$7::post_status, sort_order=$8, published_at=CASE WHEN $7='published' AND published_at IS NULL THEN now() ELSE published_at END
       WHERE id=$9`,
      [title, slug, category, cover_image, content_html, meta_description, status, sort_order || 0, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Article introuvable.' });
    return res.json({ message: 'Article mis à jour.', id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

export async function deletePost(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM blog_posts WHERE id=$1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Article introuvable.' });
    return res.json({ message: 'Article supprimé.', id });
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

export async function sharePostRedirect(req, res) {
  const { slug } = req.params;
  const frontUrl = req.query.front || 'http://localhost:5173';
  
  try {
    const result = await pool.query('SELECT * FROM blog_posts WHERE slug = $1 AND status = $2', [slug, 'published']);
    if (result.rowCount === 0) {
      return res.redirect(`${frontUrl}/blog`);
    }
    
    const post = result.rows[0];
    const targetUrl = `${frontUrl}/blog/${slug}`;
    const cleanImageUrl = post.cover_image && post.cover_image.startsWith('/') 
      ? `${req.protocol}://${req.get('host')}${post.cover_image}`
      : post.cover_image;
    
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta property="og:title" content="${post.title}">
        <meta property="og:description" content="${post.meta_description || ''}">
        ${cleanImageUrl ? `<meta property="og:image" content="${cleanImageUrl}">` : ''}
        <meta property="og:url" content="${targetUrl}">
        <meta property="og:type" content="article">
        
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${post.title}">
        <meta name="twitter:description" content="${post.meta_description || ''}">
        ${cleanImageUrl ? `<meta name="twitter:image" content="${cleanImageUrl}">` : ''}
        
        <meta http-equiv="refresh" content="0; url=${targetUrl}">
        <script>window.location.replace("${targetUrl}");</script>
        <title>${post.title}</title>
      </head>
      <body>
        <p>Redirection vers l'article...</p>
      </body>
      </html>
    `;
    
    res.send(html);
  } catch (err) {
    res.redirect(`${frontUrl}/blog`);
  }
}
