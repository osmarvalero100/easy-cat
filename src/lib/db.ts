import mysql from 'mysql2/promise';
import crypto from 'crypto';
import { Catalog, Product, Project, UserAISettings, DEFAULT_CATALOG_LOGO, getCatalogLogo, hasCustomLogo, mergeContactWithProjectDefaults } from '../types/catalog';
import { INITIAL_CATALOG } from '../data/defaultCatalog';

// Global connection pool singleton to prevent exhausting connections during Next.js dev hot-reload
declare global {
  // eslint-disable-next-line no-var
  var __dbPool: mysql.Pool | undefined;
  // eslint-disable-next-line no-var
  var __dbInitialized: boolean | undefined;
}

export function getPool(): mysql.Pool {
  if (!global.__dbPool) {
    const host = process.env.DB_HOST || '85.31.63.21';
    const port = Number(process.env.DB_PORT || 3904);
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || 'N3uoW*sz3wa*';
    const database = process.env.DB_NAME || 'easy_cat';

    if (database !== 'easy_cat') {
      throw new Error(`CRITICAL: Database MUST be easy_cat. Detected: ${database}`);
    }

    global.__dbPool = mysql.createPool({
      host,
      port,
      user,
      password,
      database: 'easy_cat',
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 5,
      idleTimeout: 60000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      charset: 'utf8mb4',
    });
  }
  return global.__dbPool;
}

let initPromise: Promise<void> | null = null;

/**
 * Initializes MySQL tables if they do not exist in easy_cat database.
 */
export async function initDatabase(): Promise<void> {
  if (global.__dbInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const pool = getPool();

    // 1. Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(128) PRIMARY KEY,
        user_id INT NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_expires (expires_at),
        CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Projects table (Emprendimientos / Marcas)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(64) PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(128) NOT NULL,
        logo_url LONGTEXT NULL,
        description TEXT NULL,
        default_currency VARCHAR(10) DEFAULT '$',
        default_contact JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_project_user (user_id),
        INDEX idx_project_slug (slug),
        CONSTRAINT fk_projects_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Catalogs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS catalogs (
        id VARCHAR(64) PRIMARY KEY,
        project_id VARCHAR(64) NOT NULL,
        user_id INT NOT NULL,
        slug VARCHAR(128) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255) DEFAULT '',
        season_tag VARCHAR(100) DEFAULT '',
        edition_year VARCHAR(50) DEFAULT '',
        brand_name VARCHAR(255) NOT NULL DEFAULT '',
        brand_logo LONGTEXT,
        cover_image LONGTEXT,
        intro_text TEXT,
        featured_section_title VARCHAR(255) DEFAULT 'Colección Destacada',
        regular_section_title VARCHAR(255) DEFAULT 'Velas & Aromas',
        footer_text VARCHAR(255) NULL,
        theme_config JSON NOT NULL,
        contact_info JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_catalogs_project (project_id),
        INDEX idx_catalogs_user (user_id),
        INDEX idx_catalogs_slug (slug),
        CONSTRAINT fk_catalogs_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
        CONSTRAINT fk_catalogs_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(64) PRIMARY KEY,
        catalog_id VARCHAR(64) NOT NULL,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100) DEFAULT '',
        price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        currency VARCHAR(10) NOT NULL DEFAULT '$',
        description TEXT,
        height_cm DECIMAL(5, 2) DEFAULT 0.00,
        width_cm DECIMAL(5, 2) DEFAULT 0.00,
        image LONGTEXT,
        burn_time_hours INT NULL,
        wax_type VARCHAR(100) DEFAULT '',
        is_seasonal_special TINYINT(1) DEFAULT 0,
        sort_order INT DEFAULT 0,
        fragrances JSON,
        colors JSON,
        includes JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_products_catalog (catalog_id),
        CONSTRAINT fk_products_catalog FOREIGN KEY (catalog_id) REFERENCES catalogs (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. User AI Settings table (BYOK - Bring Your Own Key)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_ai_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        provider VARCHAR(50) NOT NULL,
        api_key VARCHAR(255) NOT NULL,
        model_name VARCHAR(100) NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_ai_user (user_id),
        CONSTRAINT fk_ai_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    global.__dbInitialized = true;
  })();

  return initPromise;
}

// -------------------------------------------------------------
// USER & AUTHENTICATION REPOSITORY
// -------------------------------------------------------------

export async function findUserByEmail(email: string) {
  await initDatabase();
  const pool = getPool();
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [email.toLowerCase().trim()]
  );
  return rows[0] || null;
}

export async function findUserById(id: number) {
  await initDatabase();
  const pool = getPool();
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    'SELECT id, email, name, created_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

export async function createUser(email: string, passwordHash: string, name: string = '') {
  await initDatabase();
  const pool = getPool();
  const [result] = await pool.query<mysql.ResultSetHeader>(
    'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
    [email.toLowerCase().trim(), passwordHash, name.trim()]
  );
  return result.insertId;
}

export async function createSession(userId: number, daysValid: number = 30): Promise<string> {
  await initDatabase();
  const pool = getPool();
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + daysValid);

  await pool.query(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
    [sessionId, userId, expiresAt]
  );

  return sessionId;
}

export async function getSession(sessionId: string) {
  if (!sessionId) return null;
  await initDatabase();
  const pool = getPool();
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    `SELECT s.id, s.user_id, s.expires_at, u.email, u.name 
     FROM sessions s 
     JOIN users u ON s.user_id = u.id 
     WHERE s.id = ? AND s.expires_at > NOW() 
     LIMIT 1`,
    [sessionId]
  );
  return rows[0] || null;
}

export async function deleteSession(sessionId: string): Promise<void> {
  if (!sessionId) return;
  await initDatabase();
  const pool = getPool();
  await pool.query('DELETE FROM sessions WHERE id = ?', [sessionId]);
}

// -------------------------------------------------------------
// PROJECTS (EMPRENDIMIENTOS / MARCAS) REPOSITORY
// -------------------------------------------------------------

export async function getProjectsByUserId(userId: number): Promise<Project[]> {
  await initDatabase();
  const pool = getPool();
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    `SELECT p.*, COUNT(c.id) as catalog_count
     FROM projects p
     LEFT JOIN catalogs c ON p.id = c.project_id
     WHERE p.user_id = ?
     GROUP BY p.id
     ORDER BY p.created_at DESC`,
    [userId]
  );

  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    name: r.name,
    slug: r.slug,
    logoUrl: r.logo_url || undefined,
    description: r.description || undefined,
    defaultCurrency: r.default_currency || '$',
    defaultContact: r.default_contact ? (typeof r.default_contact === 'string' ? JSON.parse(r.default_contact) : r.default_contact) : undefined,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
    catalogCount: Number(r.catalog_count || 0),
  }));
}

export async function getProjectById(projectId: string, userId?: number): Promise<Project | null> {
  await initDatabase();
  const pool = getPool();
  const query = userId
    ? 'SELECT * FROM projects WHERE id = ? AND user_id = ? LIMIT 1'
    : 'SELECT * FROM projects WHERE id = ? LIMIT 1';
  const params = userId ? [projectId, userId] : [projectId];

  const [rows] = await pool.query<mysql.RowDataPacket[]>(query, params);
  if (!rows || rows.length === 0) return null;

  const r = rows[0];
  return {
    id: r.id,
    userId: r.user_id,
    name: r.name,
    slug: r.slug,
    logoUrl: r.logo_url || undefined,
    description: r.description || undefined,
    defaultCurrency: r.default_currency || '$',
    defaultContact: r.default_contact ? (typeof r.default_contact === 'string' ? JSON.parse(r.default_contact) : r.default_contact) : undefined,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
  };
}

export async function createProject(
  userId: number,
  data: {
    name: string;
    slug?: string;
    logoUrl?: string;
    description?: string;
    defaultCurrency?: string;
    defaultContact?: any;
  }
): Promise<Project> {
  await initDatabase();
  const pool = getPool();
  const id = 'proj_' + crypto.randomBytes(8).toString('hex');
  const baseSlug = (data.slug || data.name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const slug = baseSlug || 'proyecto-' + Date.now().toString(36);

  await pool.query(
    `INSERT INTO projects (id, user_id, name, slug, logo_url, description, default_currency, default_contact)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      userId,
      data.name.trim(),
      slug,
      data.logoUrl || null,
      data.description || null,
      data.defaultCurrency || '$',
      data.defaultContact ? JSON.stringify(data.defaultContact) : null,
    ]
  );

  return {
    id,
    userId,
    name: data.name.trim(),
    slug,
    logoUrl: data.logoUrl,
    description: data.description,
    defaultCurrency: data.defaultCurrency || '$',
    defaultContact: data.defaultContact,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function updateProject(
  projectId: string,
  userId: number,
  data: {
    name?: string;
    logoUrl?: string;
    description?: string;
    defaultCurrency?: string;
    defaultContact?: any;
  }
): Promise<boolean> {
  await initDatabase();
  const pool = getPool();
  const updates: string[] = [];
  const params: any[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    params.push(data.name.trim());
  }
  if (data.logoUrl !== undefined) {
    updates.push('logo_url = ?');
    params.push(data.logoUrl || null);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    params.push(data.description || null);
  }
  if (data.defaultCurrency !== undefined) {
    updates.push('default_currency = ?');
    params.push(data.defaultCurrency);
  }
  if (data.defaultContact !== undefined) {
    updates.push('default_contact = ?');
    params.push(data.defaultContact ? JSON.stringify(data.defaultContact) : null);
  }

  if (updates.length === 0) return true;

  params.push(projectId, userId);
  const [result] = await pool.query<mysql.ResultSetHeader>(
    `UPDATE projects SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
    params
  );

  // If brand name or logo changed, optionally update project's catalogs default brand_name/logo
  if (data.name !== undefined || data.logoUrl !== undefined) {
    const catUpdates: string[] = [];
    const catParams: any[] = [];
    if (data.name !== undefined) {
      catUpdates.push('brand_name = ?');
      catParams.push(data.name.trim());
    }
    if (data.logoUrl !== undefined) {
      catUpdates.push('brand_logo = ?');
      catParams.push(data.logoUrl || null);
    }
    catParams.push(projectId, userId);
    await pool.query(
      `UPDATE catalogs SET ${catUpdates.join(', ')} WHERE project_id = ? AND user_id = ?`,
      catParams
    );
  }

  return result.affectedRows > 0;
}

export async function deleteProject(projectId: string, userId: number): Promise<boolean> {
  await initDatabase();
  const pool = getPool();
  const [result] = await pool.query<mysql.ResultSetHeader>(
    'DELETE FROM projects WHERE id = ? AND user_id = ?',
    [projectId, userId]
  );
  return result.affectedRows > 0;
}

// -------------------------------------------------------------
// CATALOGS REPOSITORY
// -------------------------------------------------------------

export async function getCatalogsByProjectId(projectId: string, userId: number): Promise<Array<{
  id: string;
  projectId: string;
  slug: string;
  title: string;
  seasonTag: string;
  brandName: string;
  coverImage: string;
  productCount: number;
  updatedAt: string;
}>> {
  await initDatabase();
  const pool = getPool();
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    `SELECT c.id, c.project_id, c.slug, c.title, c.season_tag, c.brand_name, c.cover_image, c.updated_at,
            COUNT(p.id) as product_count
     FROM catalogs c
     LEFT JOIN products p ON c.id = p.catalog_id
     WHERE c.project_id = ? AND c.user_id = ?
     GROUP BY c.id
     ORDER BY c.updated_at DESC`,
    [projectId, userId]
  );

  return rows.map((r) => ({
    id: r.id,
    projectId: r.project_id,
    slug: r.slug,
    title: r.title,
    seasonTag: r.season_tag,
    brandName: r.brand_name,
    coverImage: r.cover_image,
    productCount: Number(r.product_count || 0),
    updatedAt: new Date(r.updated_at).toISOString(),
  }));
}

export async function getCatalogByIdOrSlug(idOrSlug: string, userId?: number): Promise<Catalog | null> {
  await initDatabase();
  const pool = getPool();

  const query = userId
    ? `SELECT c.*, p.logo_url as project_logo_url, p.default_contact as project_default_contact
       FROM catalogs c
       LEFT JOIN projects p ON c.project_id = p.id
       WHERE (c.id = ? OR c.slug = ?) AND c.user_id = ? LIMIT 1`
    : `SELECT c.*, p.logo_url as project_logo_url, p.default_contact as project_default_contact
       FROM catalogs c
       LEFT JOIN projects p ON c.project_id = p.id
       WHERE c.id = ? OR c.slug = ? LIMIT 1`;
  const params = userId ? [idOrSlug, idOrSlug, userId] : [idOrSlug, idOrSlug];

  const [catRows] = await pool.query<mysql.RowDataPacket[]>(query, params);
  if (!catRows || catRows.length === 0) return null;

  const cat = catRows[0];

  // Fetch products
  const [prodRows] = await pool.query<mysql.RowDataPacket[]>(
    'SELECT * FROM products WHERE catalog_id = ? ORDER BY sort_order ASC, created_at ASC',
    [cat.id]
  );

  const products: Product[] = prodRows.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku || undefined,
    price: Number(p.price),
    currency: p.currency || '$',
    description: p.description || '',
    heightCm: Number(p.height_cm || 0),
    widthCm: Number(p.width_cm || 0),
    fragrances: typeof p.fragrances === 'string' ? JSON.parse(p.fragrances) : p.fragrances || [],
    colors: typeof p.colors === 'string' ? JSON.parse(p.colors) : p.colors || [],
    includes: typeof p.includes === 'string' ? JSON.parse(p.includes) : p.includes || [],
    image: p.image || '',
    burnTimeHours: p.burn_time_hours ? Number(p.burn_time_hours) : undefined,
    waxType: p.wax_type || undefined,
    isSeasonalSpecial: Boolean(p.is_seasonal_special),
    sortOrder: Number(p.sort_order || 0),
  }));

  const effectiveLogo = (cat.brand_logo && hasCustomLogo(cat.brand_logo))
    ? cat.brand_logo
    : (cat.project_logo_url && hasCustomLogo(cat.project_logo_url)
        ? cat.project_logo_url
        : undefined);

  return {
    id: cat.id,
    projectId: cat.project_id,
    userId: cat.user_id,
    slug: cat.slug,
    title: cat.title,
    subtitle: cat.subtitle || '',
    seasonTag: cat.season_tag || '',
    editionYear: cat.edition_year || '',
    brandName: cat.brand_name || '',
    brandLogo: effectiveLogo,
    coverImage: cat.cover_image || '',
    introText: cat.intro_text || '',
    featuredSectionTitle: cat.featured_section_title || 'Colección Destacada',
    regularSectionTitle: cat.regular_section_title || 'Velas & Aromas',
    footerText: cat.footer_text || undefined,
    products,
    theme: typeof cat.theme_config === 'string' ? JSON.parse(cat.theme_config) : cat.theme_config,
    contact: mergeContactWithProjectDefaults(
      typeof cat.contact_info === 'string' ? JSON.parse(cat.contact_info) : cat.contact_info,
      cat.project_default_contact
        ? (typeof cat.project_default_contact === 'string'
            ? JSON.parse(cat.project_default_contact)
            : cat.project_default_contact)
        : null
    ),
    updatedAt: new Date(cat.updated_at).toISOString(),
  };
}

export async function saveCatalog(catalog: Catalog, userId: number): Promise<void> {
  await initDatabase();
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Verify that project exists and belongs to user
    let projectId = catalog.projectId;
    if (!projectId || projectId === 'default-project') {
      const [existingProjects] = await conn.query<mysql.RowDataPacket[]>(
        'SELECT id FROM projects WHERE user_id = ? ORDER BY created_at ASC LIMIT 1',
        [userId]
      );
      if (existingProjects && existingProjects.length > 0) {
        projectId = existingProjects[0].id;
      } else {
        // Create initial project for user
        const newProjId = 'proj_' + crypto.randomBytes(8).toString('hex');
        await conn.query(
          `INSERT INTO projects (id, user_id, name, slug, logo_url, default_currency)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            newProjId,
            userId,
            catalog.brandName || 'Mi Emprendimiento',
            'mi-emprendimiento-' + Date.now().toString(36),
            catalog.brandLogo || null,
            catalog.theme?.currencySymbol || '$',
          ]
        );
        projectId = newProjId;
      }
    }

    // 2. Check catalog ownership or duplicate slug conflict
    const [existing] = await conn.query<mysql.RowDataPacket[]>(
      'SELECT id, user_id FROM catalogs WHERE id = ? OR slug = ? LIMIT 1',
      [catalog.id, catalog.slug]
    );

    if (existing.length > 0 && existing[0].user_id !== userId) {
      catalog.slug = `${catalog.slug}-${Date.now().toString(36)}`;
    }

    // 3. Upsert catalog record
    await conn.query(
      `INSERT INTO catalogs (
        id, project_id, user_id, slug, title, subtitle, season_tag, edition_year,
        brand_name, brand_logo, cover_image, intro_text,
        featured_section_title, regular_section_title, footer_text,
        theme_config, contact_info
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        project_id = VALUES(project_id),
        user_id = VALUES(user_id),
        slug = VALUES(slug),
        title = VALUES(title),
        subtitle = VALUES(subtitle),
        season_tag = VALUES(season_tag),
        edition_year = VALUES(edition_year),
        brand_name = VALUES(brand_name),
        brand_logo = VALUES(brand_logo),
        cover_image = VALUES(cover_image),
        intro_text = VALUES(intro_text),
        featured_section_title = VALUES(featured_section_title),
        regular_section_title = VALUES(regular_section_title),
        footer_text = VALUES(footer_text),
        theme_config = VALUES(theme_config),
        contact_info = VALUES(contact_info),
        updated_at = CURRENT_TIMESTAMP`,
      [
        catalog.id,
        projectId,
        userId,
        catalog.slug,
        catalog.title,
        catalog.subtitle || '',
        catalog.seasonTag || '',
        catalog.editionYear || '',
        catalog.brandName || '',
        hasCustomLogo(catalog.brandLogo) ? catalog.brandLogo : null,
        catalog.coverImage || '',
        catalog.introText || '',
        catalog.featuredSectionTitle || 'Colección Destacada',
        catalog.regularSectionTitle || 'Velas & Aromas',
        catalog.footerText || null,
        JSON.stringify(catalog.theme),
        JSON.stringify(catalog.contact),
      ]
    );

    // 4. Synchronize products
    await conn.query('DELETE FROM products WHERE catalog_id = ?', [catalog.id]);

    if (catalog.products && catalog.products.length > 0) {
      const productValues = catalog.products.map((p, index) => [
        p.id || `prod_${catalog.id}_${index}_${crypto.randomBytes(4).toString('hex')}`,
        catalog.id,
        p.name || 'Producto sin nombre',
        p.sku || '',
        Number(p.price) || 0,
        p.currency || '$',
        p.description || '',
        Number(p.heightCm) || 0,
        Number(p.widthCm) || 0,
        p.image || '',
        p.burnTimeHours ? Number(p.burnTimeHours) : null,
        p.waxType || '',
        p.isSeasonalSpecial ? 1 : 0,
        index,
        JSON.stringify(p.fragrances || []),
        JSON.stringify(p.colors || []),
        JSON.stringify(p.includes || []),
      ]);

      await conn.query(
        `INSERT INTO products (
          id, catalog_id, name, sku, price, currency, description,
          height_cm, width_cm, image, burn_time_hours, wax_type,
          is_seasonal_special, sort_order, fragrances, colors, includes
        ) VALUES ?`,
        [productValues]
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function duplicateCatalog(
  sourceSlug: string,
  newTitle: string,
  newSlug: string,
  userId: number
): Promise<Catalog> {
  const source = await getCatalogByIdOrSlug(sourceSlug);
  if (!source) {
    throw new Error(`Catálogo fuente no encontrado: ${sourceSlug}`);
  }

  const cleanSlug = newSlug
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const newCatalogId = `cat_${cleanSlug}_${crypto.randomBytes(4).toString('hex')}`;

  const duplicated: Catalog = {
    ...source,
    id: newCatalogId,
    slug: cleanSlug,
    title: newTitle.trim(),
    userId,
    products: source.products.map((p, idx) => ({
      ...p,
      id: `prod_${newCatalogId}_${idx}_${crypto.randomBytes(3).toString('hex')}`,
    })),
    updatedAt: new Date().toISOString(),
  };

  await saveCatalog(duplicated, userId);
  return duplicated;
}

export async function deleteCatalog(catalogId: string, userId: number): Promise<boolean> {
  await initDatabase();
  const pool = getPool();
  const [result] = await pool.query<mysql.ResultSetHeader>(
    'DELETE FROM catalogs WHERE id = ? AND user_id = ?',
    [catalogId, userId]
  );
  return result.affectedRows > 0;
}

// -------------------------------------------------------------
// USER AI SETTINGS REPOSITORY (BYOK)
// -------------------------------------------------------------

export async function getAISettingsByUserId(userId: number): Promise<UserAISettings[]> {
  await initDatabase();
  const pool = getPool();
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    'SELECT id, user_id, provider, api_key, model_name, is_active, created_at, updated_at FROM user_ai_settings WHERE user_id = ?',
    [userId]
  );
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    provider: r.provider,
    apiKey: r.api_key,
    modelName: r.model_name || undefined,
    isActive: Boolean(r.is_active),
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
  }));
}

export async function saveAISettings(
  userId: number,
  provider: string,
  apiKey: string,
  modelName?: string
): Promise<void> {
  await initDatabase();
  const pool = getPool();
  await pool.query(
    `INSERT INTO user_ai_settings (user_id, provider, api_key, model_name, is_active)
     VALUES (?, ?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE
       api_key = VALUES(api_key),
       model_name = VALUES(model_name),
       is_active = 1,
       updated_at = CURRENT_TIMESTAMP`,
    [userId, provider, apiKey.trim(), modelName || null]
  );
}

export async function deleteAISettings(userId: number, provider: string): Promise<boolean> {
  await initDatabase();
  const pool = getPool();
  const [result] = await pool.query<mysql.ResultSetHeader>(
    'DELETE FROM user_ai_settings WHERE user_id = ? AND provider = ?',
    [userId, provider]
  );
  return result.affectedRows > 0;
}
